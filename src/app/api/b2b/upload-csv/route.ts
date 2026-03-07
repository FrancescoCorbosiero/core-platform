import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendB2BMagicLinkEmail } from '@/lib/resend/emails'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Check admin auth (via Payload session)
    const { user } = await payload.auth({ headers: req.headers })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const companyId = formData.get('company_id') as string

    if (!file || !companyId) {
      return NextResponse.json({ error: 'File and company_id are required' }, { status: 400 })
    }

    // Verify company exists
    const company = await payload.findByID({
      collection: 'companies',
      id: companyId,
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const csvText = await file.text()
    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l && l.includes('@'))

    const results = { created: 0, skipped: 0, errors: [] as string[] }

    for (const email of lines) {
      try {
        // Check if user already exists
        const existing = await payload.find({
          collection: 'users',
          where: { email: { equals: email } },
          limit: 1,
        })

        if (existing.docs.length > 0) {
          results.skipped++
          continue
        }

        const user = await payload.create({
          collection: 'users',
          data: {
            email,
            password: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
            role: 'b2b',
            plan: 'pro', // B2B gets pro-level access
            company_id: companyId,
            is_active: false, // Inactive until magic link clicked
          },
        })

        // Generate magic link
        const magicLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/b2b-activate?token=${user.id}`
        await sendB2BMagicLinkEmail(email, magicLinkUrl)

        results.created++
      } catch (error) {
        results.errors.push(`Failed for ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('B2B CSV upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
