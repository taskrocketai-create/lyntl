import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { nanoid } from 'nanoid'

function generateToken(): string {
  return nanoid(12) // 12-char URL-safe token
}

export async function POST(request: NextRequest) {
  try {
    // Verify partner is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { partner_id, deceased_name, deceased_dod, contact_name, contact_email, contact_phone } = body

    if (!partner_id || !deceased_name || !contact_name || !contact_phone) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    // Verify this user belongs to this partner
    const { data: partnerUser } = await supabase
      .from('partner_users')
      .select('partner_id')
      .eq('user_id', user.id)
      .eq('partner_id', partner_id)
      .single()

    if (!partnerUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const service = createServiceClient()

    // Get partner name for SMS
    const { data: partner } = await service
      .from('partners')
      .select('name')
      .eq('id', partner_id)
      .single()

    // Generate unique token
    let token = generateToken()
    // Ensure uniqueness
    let attempts = 0
    while (attempts < 5) {
      const { data: existing } = await service
        .from('families')
        .select('id')
        .eq('token', token)
        .single()
      if (!existing) break
      token = generateToken()
      attempts++
    }

    // Create family record
    const { data: family, error: familyError } = await service
      .from('families')
      .insert({
        partner_id,
        token,
        deceased_name: deceased_name.trim(),
        deceased_dod: deceased_dod || null,
        contact_name: contact_name.trim(),
        contact_email: contact_email?.trim() || null,
        contact_phone: contact_phone.trim(),
      })
      .select()
      .single()

    if (familyError) throw familyError

    // Send SMS to family via Twilio
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const familyLink = `${appUrl}/f/${token}`
    const partnerName = partner?.name || 'Your funeral home'

    try {
      const twilioSid = process.env.TWILIO_ACCOUNT_SID
      const twilioToken = process.env.TWILIO_AUTH_TOKEN
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER

      if (twilioSid && twilioToken && twilioPhone) {
        const twilio = require('twilio')(twilioSid, twilioToken)
        await twilio.messages.create({
          body: `${partnerName} has set up your Lyntl account. We'll guide you through everything you need to handle after ${deceased_name}'s passing — one step at a time.\n\nGet started here: ${familyLink}\n\nReply STOP to opt out.`,
          from: twilioPhone,
          to: contact_phone,
        })
      }
    } catch (smsError) {
      // Log but don't fail — family is created, SMS is best-effort
      console.error('SMS send failed:', smsError)
    }

    return NextResponse.json({
      success: true,
      family_id: family.id,
      token: family.token,
      link: familyLink,
    })

  } catch (error) {
    console.error('Family activation error:', error)
    return NextResponse.json(
      { error: 'Failed to activate family. Please try again.' },
      { status: 500 }
    )
  }
}
