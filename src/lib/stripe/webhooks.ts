import type Stripe from 'stripe'
import { getPayload } from 'payload'
import config from '@payload-config'
import { stripe } from './client'
import {
  sendPaymentFailedEmail,
  sendTrialExpiredEmail,
  sendRenewalReminderEmail,
  sendSubscriptionCancelledEmail,
} from '@/lib/resend/emails'

function getPriceToPlanMap(): Record<string, 'base' | 'pro'> {
  return {
    [process.env.STRIPE_PRICE_BASE_MONTHLY!]: 'base',
    [process.env.STRIPE_PRICE_BASE_ANNUAL!]: 'base',
    [process.env.STRIPE_PRICE_PRO_MONTHLY!]: 'pro',
    [process.env.STRIPE_PRICE_PRO_ANNUAL!]: 'pro',
  }
}

function getAnnualPriceIds(): Set<string | undefined> {
  return new Set([
    process.env.STRIPE_PRICE_BASE_ANNUAL,
    process.env.STRIPE_PRICE_PRO_ANNUAL,
  ])
}

function getPlanFromPriceId(priceId: string): 'base' | 'pro' | 'free' {
  return getPriceToPlanMap()[priceId] || 'free'
}

async function findUserByStripeCustomerId(customerId: string) {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'users',
    where: {
      stripe_customer_id: { equals: customerId },
    },
    limit: 1,
  })

  return result.docs[0] || null
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id

  if (!customerId) {
    console.error('invoice.payment_failed: No customer ID found')
    return
  }

  const user = await findUserByStripeCustomerId(customerId)
  if (!user) {
    console.error(`invoice.payment_failed: No user found for customer ${customerId}`)
    return
  }

  const payload = await getPayload({ config })

  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      is_active: false,
    },
  })

  await sendPaymentFailedEmail(user.email)
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id

  if (!customerId) {
    console.error('customer.subscription.trial_will_end: No customer ID found')
    return
  }

  const user = await findUserByStripeCustomerId(customerId)
  if (!user) {
    console.error(`customer.subscription.trial_will_end: No user found for customer ${customerId}`)
    return
  }

  const payload = await getPayload({ config })

  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      plan: 'free',
    },
  })

  await sendTrialExpiredEmail(user.email)
}

async function handleInvoiceUpcoming(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id

  if (!customerId) {
    console.error('invoice.upcoming: No customer ID found')
    return
  }

  // Only send renewal reminders for annual plans
  const lineItem = invoice.lines?.data?.[0]
  const lineItemPrice = lineItem?.pricing?.price_details?.price
  const priceId = typeof lineItemPrice === 'string' ? lineItemPrice : lineItemPrice?.id

  if (!priceId || !getAnnualPriceIds().has(priceId)) {
    return
  }

  const user = await findUserByStripeCustomerId(customerId)
  if (!user) {
    console.error(`invoice.upcoming: No user found for customer ${customerId}`)
    return
  }

  const renewalDate = invoice.next_payment_attempt
    ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString('it-IT')
    : 'prossimamente'

  await sendRenewalReminderEmail(user.email, renewalDate)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id

  if (!customerId) {
    console.error('customer.subscription.updated: No customer ID found')
    return
  }

  const user = await findUserByStripeCustomerId(customerId)
  if (!user) {
    console.error(`customer.subscription.updated: No user found for customer ${customerId}`)
    return
  }

  const priceId = subscription.items.data[0]?.price?.id
  if (!priceId) {
    console.error('customer.subscription.updated: No price ID found')
    return
  }

  const plan = getPlanFromPriceId(priceId)

  const periodEnd = (subscription as unknown as Record<string, unknown>).current_period_end as number | undefined
  const planExpiresAt = periodEnd
    ? new Date(periodEnd * 1000).toISOString()
    : null

  const payload = await getPayload({ config })

  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      plan,
      plan_expires_at: planExpiresAt,
    },
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id

  if (!customerId) {
    console.error('customer.subscription.deleted: No customer ID found')
    return
  }

  const user = await findUserByStripeCustomerId(customerId)
  if (!user) {
    console.error(`customer.subscription.deleted: No user found for customer ${customerId}`)
    return
  }

  const payload = await getPayload({ config })

  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      plan_expires_at: new Date().toISOString(),
    },
  })

  await sendSubscriptionCancelledEmail(user.email)
}

export async function handleStripeWebhook(rawBody: string | Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set')
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    throw new Error(`Webhook signature verification failed: ${message}`)
  }

  switch (event.type) {
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
      break

    case 'customer.subscription.trial_will_end':
      await handleTrialWillEnd(event.data.object as Stripe.Subscription)
      break

    case 'invoice.upcoming':
      await handleInvoiceUpcoming(event.data.object as Stripe.Invoice)
      break

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
      break

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
      break

    default:
      console.log(`Unhandled webhook event type: ${event.type}`)
  }
}
