import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    const { taskId, token, status } = await request.json()

    if (!taskId || !token || !status) {
      return NextResponse.json({ error: 'Missing fields.' }, { status: 400 })
    }

    const service = createServiceClient()

    // Verify task belongs to this family token
    const { data: familyRaw } = await service
      .from('families')
      .select('id')
      .eq('token', token)
      .single()

    const family = familyRaw as { id: string } | null
    if (!family) {
      return NextResponse.json({ error: 'Not found.' }, { status: 404 })
    }

    await (service as any)
      .from('tasks')
      .update({ status })
      .eq('id', taskId)
      .eq('family_id', family.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Task update error:', error)
    return NextResponse.json({ error: 'Failed to update task.' }, { status: 500 })
  }
}
