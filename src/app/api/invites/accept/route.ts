import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { v4 as uuidv4 } from 'uuid'

interface InviteRow {
  id: string
  sender_id: string
  receiver_id: string
  status: string
  expires_at: string
  note?: string
}

export async function POST(req: NextRequest) {
  try {
    const { inviteId, userId } = await req.json()
    if (!inviteId || !userId)
      return NextResponse.json({ error: 'inviteId and userId required' }, { status: 400 })

    const db = getSupabaseAdmin()

    const { data, error: inviteError } = await db
      .from('invites')
      .select('id, sender_id, receiver_id, status, expires_at, note')
      .eq('id', inviteId)
      .single()

    if (inviteError || !data)
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })

    const invite = data as InviteRow

    if (invite.receiver_id !== userId)
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    if (invite.status !== 'pending')
      return NextResponse.json({ error: 'Invite is no longer pending' }, { status: 409 })
    if (new Date(invite.expires_at) < new Date()) {
      await db.from('invites').update({ status: 'expired' }).eq('id', inviteId)
      return NextResponse.json({ error: 'Invite has expired' }, { status: 410 })
    }

    const channelName = `mmi_${uuidv4().replace(/-/g, '').slice(0, 16)}`
    const { data: sessionData, error: sessionError } = await db
      .from('sessions')
      .insert({
        user1_id: invite.sender_id,
        user2_id: invite.receiver_id,
        status: 'active',
        channel_name: channelName,
      })
      .select()
      .single()

    if (sessionError)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })

    await db.from('invites').update({ status: 'accepted' }).eq('id', inviteId)

    // If the sender included a note, insert it as the first message in the chat
    if (invite.note?.trim()) {
      await db.from('messages').insert({
        session_id: sessionData.id,
        sender_id: invite.sender_id,
        content: invite.note.trim(),
      })
    }

    return NextResponse.json({ session: sessionData })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
