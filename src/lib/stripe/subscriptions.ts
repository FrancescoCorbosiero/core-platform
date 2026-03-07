import { stripe } from './client'

export async function createCheckoutSession(
  userId: string,
  priceId: string,
  couponCode?: string,
) {
  const sessionParams: Record<string, unknown> = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    client_reference_id: userId,
    metadata: {
      userId,
    },
  }

  if (couponCode) {
    sessionParams.discounts = [{ coupon: couponCode }]
  }

  const session = await stripe.checkout.sessions.create(sessionParams as Parameters<typeof stripe.checkout.sessions.create>[0])
  return session
}

export async function createCustomerPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing`,
  })

  return session.url
}

export async function upgradeSubscription(subscriptionId: string, newPriceId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  const currentItem = subscription.items.data[0]
  if (!currentItem) {
    throw new Error('No subscription items found')
  }

  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: currentItem.id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'always_invoice',
  })

  return updatedSubscription
}

export async function downgradeSubscription(subscriptionId: string, newPriceId: string) {
  // Cancel current subscription at period end
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
    metadata: {
      downgrade_to_price: newPriceId,
    },
  })

  return subscription
}

export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })

  return subscription
}
