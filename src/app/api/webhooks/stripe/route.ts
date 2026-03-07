import { NextRequest, NextResponse } from 'next/server'
import { handleStripeWebhook } from '@/lib/stripe/webhooks'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  try {
    await handleStripeWebhook(body, signature)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    if (error instanceof Error && error.message.includes('signature')) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
