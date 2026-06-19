import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

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

    // Validate required fields
    if (!funeral_home_name || !contact_name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // sends confirmation email
      user_metadata: { name: contact_name, funeral_home: funeral_home_name },
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists.' },
          { status: 400 }
        )
      }
      throw authError
    }

    const userId = authData.user.id

    // 2. Generate unique slug
    let slug = slugify(funeral_home_name)
    const { data: existing } = await supabase
      .from('partners')
      .select('slug')
      .eq('slug', slug)
      .single()

    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    // 3. Create partner record
    const { data: partner, error: partnerError } = await (supabase as any)
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

    if (partnerError) throw partnerError

    // 4. Link user to partner
    const { error: linkError } = await (supabase as any)
      .from('partner_users')
      .insert({
        user_id: userId,
        partner_id: partner.id,
        role: 'admin',
      })

    if (linkError) throw linkError

    return NextResponse.json({ success: true, partner_id: partner.id })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}
