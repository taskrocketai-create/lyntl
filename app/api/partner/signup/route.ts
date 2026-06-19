import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient as createBrowserClient } from '@supabase/supabase-js'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      funeral_home_name,
      contact_name,
      email,
      phone,
      city,
      state,
      password,
    } = body

    if (!funeral_home_name || !contact_name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      )
    }

    const service = createServiceClient()

    // Check if email already exists
    const { data: existingUsers } = await service.auth.admin.listUsers()
    const emailExists = existingUsers?.users?.some(u => u.email === email)
    if (emailExists) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 400 }
      )
    }

    // Use signUp with auto-confirm via service role
    // Create a temporary client with service role to bypass email confirmation
    const adminAuthClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        }
      }
    )

    // Create user with admin API, setting email_confirm to true to skip confirmation
    const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // skip confirmation email entirely
      user_metadata: { name: contact_name, funeral_home: funeral_home_name },
    })

    if (authError) {
      console.error('Auth error details:', JSON.stringify(authError))
      return NextResponse.json(
        { error: `Auth error: ${authError.message}` },
        { status: 400 }
      )
    }

    const userId = authData.user.id

    // Generate unique slug
    let slug = slugify(funeral_home_name)
    const { data: existing } = await service
      .from('partners')
      .select('slug')
      .eq('slug', slug)
      .single()

    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    // Create partner record
    const { data: partner, error: partnerError } = await (service as any)
      .from('partners')
      .insert({
        name: funeral_home_name,
        contact_name,
        email,
        phone,
        city: city || null,
        state: state || null,
        slug,
      })
      .select()
      .single()

    if (partnerError) {
      console.error('Partner insert error:', JSON.stringify(partnerError))
      throw partnerError
    }

    // Link user to partner
    const { error: linkError } = await (service as any)
      .from('partner_users')
      .insert({
        user_id: userId,
        partner_id: partner.id,
        role: 'admin',
      })

    if (linkError) {
      console.error('Link error:', JSON.stringify(linkError))
      throw linkError
    }

    return NextResponse.json({ success: true, partner_id: partner.id })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}
