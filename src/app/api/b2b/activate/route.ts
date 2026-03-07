import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Find user by ID (token is user ID)
    const user = await payload.findByID({
      collection: 'users',
      id: token,
    })

    if (!user || user.role !== 'b2b') {
      return NextResponse.json({ error: 'Invalid activation token' }, { status: 400 })
    }

    if (user.is_active) {
      return NextResponse.json({ error: 'Account already activated' }, { status: 400 })
    }

    // Activate user and set password
    await payload.update({
      collection: 'users',
      id: token,
      data: {
        is_active: true,
        password,
      },
    })

    return NextResponse.json({ success: true, message: 'Account activated successfully' })
  } catch (error) {
    console.error('B2B activation error:', error)
    return NextResponse.json({ error: 'Activation failed' }, { status: 500 })
  }
}
