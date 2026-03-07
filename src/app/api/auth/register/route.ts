import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { generateReferralCode } from '@/lib/auth/referral'
import { sendConfirmAccountEmail } from '@/lib/resend/emails'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, nickname, first_name, last_name } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Check if email already exists (one trial per email)
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const now = new Date()
    const trialEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

    const referralCode = generateReferralCode()

    const user = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        nickname: nickname || '',
        first_name: first_name || '',
        last_name: last_name || '',
        role: 'b2c',
        plan: 'trial',
        trial_started_at: now.toISOString(),
        trial_ends_at: trialEnd.toISOString(),
        referral_code: referralCode,
        is_active: true,
      },
    })

    // Send confirmation email
    const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?token=${user.id}`
    await sendConfirmAccountEmail(email, confirmUrl)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        plan: 'trial',
        trial_ends_at: trialEnd.toISOString(),
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
