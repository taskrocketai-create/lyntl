import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import Anthropic from '@anthropic-ai/sdk'
import { addDays, format } from 'date-fns'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface TaskItem {
  category: string
  title: string
  description: string
  why_it_matters: string
  urgency: string
  deadline_days: number | null
  sort_order: number
  letter_subject: string | null
  letter_body: string | null
  gov_form_name: string | null
  gov_form_url: string | null
  states_relevant: string[] | null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { familyId, token, answers } = body

    if (!familyId || !token || !answers) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const service = createServiceClient()

    // Get family details
    const { data: familyRaw } = await service
      .from('families')
      .select('*')
      .eq('id', familyId)
      .eq('token', token)
      .single()

    const family = familyRaw as {
      id: string
      deceased_name: string
      contact_name: string
      deceased_dod: string | null
      partner_id: string
    } | null

    if (!family) {
      return NextResponse.json({ error: 'Family not found.' }, { status: 404 })
    }

    // 1. Save all intake responses
    const responseInserts = Object.entries(answers).map(([key, value]) => ({
      family_id: familyId,
      section: getSectionForKey(key),
      key,
      value: JSON.stringify(value),
    }))

    await (service as any)
      .from('intake_responses')
      .upsert(responseInserts, { onConflict: 'family_id,key' })

    // 2. Mark intake complete
    await (service as any)
      .from('families')
      .update({
        intake_completed: true,
        deceased_state: answers.deceased_state || null,
      })
      .eq('id', familyId)

    // 3. Generate tasks with Claude
    const dod = family.deceased_dod ? new Date(family.deceased_dod) : new Date()
    const prompt = buildClaudePrompt(family.deceased_name, family.contact_name, dod, answers)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    })

    const responseText = message.content
      .filter(c => c.type === 'text')
      .map(c => (c as { type: 'text'; text: string }).text)
      .join('')

    // Parse JSON from Claude response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('Claude did not return valid JSON task list')
    }

    const tasks: TaskItem[] = JSON.parse(jsonMatch[0])

    // 4. Save tasks to database
    const taskInserts = tasks.map((task, index) => ({
      family_id: familyId,
      category: task.category,
      title: task.title,
      description: task.description,
      why_it_matters: task.why_it_matters || null,
      urgency: task.urgency || 'normal',
      deadline_days: task.deadline_days || null,
      deadline_date: task.deadline_days
        ? format(addDays(dod, task.deadline_days), 'yyyy-MM-dd')
        : null,
      status: 'pending',
      sort_order: index,
      letter_subject: task.letter_subject || null,
      letter_body: task.letter_body || null,
      gov_form_name: task.gov_form_name || null,
      gov_form_url: task.gov_form_url || null,
      states_relevant: task.states_relevant || null,
    }))

    await (service as any)
      .from('tasks')
      .insert(taskInserts)

    // 5. Create reminder records for urgent tasks
    const urgentTasks = tasks.filter(t => t.urgency === 'urgent' && t.deadline_days)
    const reminderInserts = urgentTasks.map(task => ({
      family_id: familyId,
      type: 'sms',
      message: `Lyntl reminder: "${task.title}" is due soon. Log in to complete it: ${process.env.NEXT_PUBLIC_APP_URL}/f/${token}`,
      scheduled_for: format(
        addDays(dod, (task.deadline_days || 7) - 3),
        "yyyy-MM-dd'T'HH:mm:ssxxx"
      ),
      status: 'pending',
    }))

    if (reminderInserts.length > 0) {
      await (service as any)
        .from('reminders')
        .insert(reminderInserts)
    }

    // 6. Mark tasks as generated
    await (service as any)
      .from('families')
      .update({ tasks_generated: true })
      .eq('id', familyId)

    return NextResponse.json({
      success: true,
      task_count: tasks.length,
    })

  } catch (error) {
    console.error('Intake completion error:', error)
    return NextResponse.json(
      { error: 'Failed to generate your plan. Please try again.' },
      { status: 500 }
    )
  }
}

function getSectionForKey(key: string): string {
  const deceased = ['deceased_state', 'us_citizen', 'was_veteran', 'was_employed', 'employer_name', 'owned_business', 'business_type']
  const estate = ['has_will', 'has_trust', 'jointly_held', 'has_property', 'property_states', 'has_vehicle', 'has_bank_accounts', 'has_retirement', 'has_life_insurance', 'has_digital_assets', 'has_debts', 'has_safe_deposit']
  const benefits = ['received_ss', 'received_pension', 'pension_type', 'received_va', 'received_medicare']
  const familyKeys = ['executor_name', 'executor_relation', 'has_spouse', 'has_minor_children', 'has_guardianship_docs', 'family_size']
  const foreign = ['has_foreign_assets', 'foreign_countries', 'has_foreign_pension']

  if (deceased.includes(key)) return 'deceased'
  if (estate.includes(key)) return 'estate'
  if (benefits.includes(key)) return 'benefits'
  if (familyKeys.includes(key)) return 'family'
  if (foreign.includes(key)) return 'foreign'
  return 'other'
}

function buildClaudePrompt(
  deceasedName: string,
  contactName: string,
  dod: Date,
  answers: Record<string, unknown>
): string {
  return `You are an estate administration assistant. Generate a personalized task list for a family managing an estate.

DECEASED: ${deceasedName}
DATE OF DEATH: ${format(dod, 'MMMM d, yyyy')}
FAMILY CONTACT: ${contactName}

INTAKE ANSWERS:
${JSON.stringify(answers, null, 2)}

Generate a comprehensive, prioritized task list based ONLY on what applies to this specific situation. Do not include tasks that are not relevant based on the intake answers.

Return ONLY a valid JSON array. No markdown, no explanation, just the raw JSON array:

[
  {
    "category": "government|property|finance|daily|veteran|business|foreign",
    "title": "Short action-oriented task title",
    "description": "2-3 sentences explaining exactly what to do and how",
    "why_it_matters": "One sentence on consequences of missing this",
    "urgency": "urgent|normal|low",
    "deadline_days": 30,
    "sort_order": 1,
    "letter_subject": "Subject line for notification letter or null",
    "letter_body": "Full letter template with [PLACEHOLDER] for variables, or null",
    "gov_form_name": "Form name e.g. SSA-8 or null",
    "gov_form_url": "Direct URL to form or null",
    "states_relevant": ["NC"] or null
  }
]

RULES:
- deadline_days is days from date of death (e.g. 30 = 30 days after death)
- Mark as "urgent" if deadline is within 30 days of death
- Include letter templates for all government and financial notifications
- Letter templates use [DECEASED_NAME], [DATE_OF_DEATH], [EXECUTOR_NAME], [ACCOUNT_NUMBER] as placeholders
- Include real government form names and SSA/IRS/DMV URLs where applicable
- For veteran = Yes, include VA burial benefits (deadline 2 years), VA survivor benefits, DD-214 retrieval
- For business owner, include IRS EIN notification, business account closure, license cancellation
- For foreign assets, include "consult international estate attorney" tasks per country
- Minimum 15 tasks, maximum 60 tasks
- Sort by urgency then deadline_days ascending`
}
