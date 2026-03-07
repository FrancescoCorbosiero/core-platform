import { describe, it, expect, vi, beforeEach } from 'vitest'

process.env.STRIPE_SECRET_KEY = 'sk_test_fake'
process.env.NEXT_PUBLIC_APP_URL = 'https://tereso.it'

vi.mock('@/lib/stripe/client', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
    billingPortal: {
      sessions: {
        create: vi.fn(),
      },
    },
    subscriptions: {
      retrieve: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import { stripe } from '@/lib/stripe/client'
import {
  createCheckoutSession,
  createCustomerPortalSession,
  upgradeSubscription,
  downgradeSubscription,
  cancelSubscription,
} from '@/lib/stripe/subscriptions'

describe('Stripe Subscriptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createCheckoutSession', () => {
    it('should create a checkout session without coupon', async () => {
      const mockSession = { id: 'cs_123', url: 'https://checkout.stripe.com/cs_123' }
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(mockSession as any)

      const result = await createCheckoutSession('user-1', 'price_pro_monthly')

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [{ price: 'price_pro_monthly', quantity: 1 }],
          client_reference_id: 'user-1',
          metadata: { userId: 'user-1' },
        })
      )
      expect(result).toEqual(mockSession)
    })

    it('should create a checkout session with coupon code', async () => {
      const mockSession = { id: 'cs_124', url: 'https://checkout.stripe.com/cs_124' }
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(mockSession as any)

      const result = await createCheckoutSession('user-1', 'price_pro_monthly', 'DISCOUNT10')

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          discounts: [{ coupon: 'DISCOUNT10' }],
        })
      )
      expect(result).toEqual(mockSession)
    })
  })

  describe('createCustomerPortalSession', () => {
    it('should create a customer portal session and return URL', async () => {
      vi.mocked(stripe.billingPortal.sessions.create).mockResolvedValue({
        url: 'https://billing.stripe.com/session/abc',
      } as any)

      const result = await createCustomerPortalSession('cus_123')

      expect(stripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_123',
        return_url: 'https://tereso.it/account/billing',
      })
      expect(result).toBe('https://billing.stripe.com/session/abc')
    })
  })

  describe('upgradeSubscription', () => {
    it('should upgrade subscription to new price', async () => {
      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue({
        items: { data: [{ id: 'si_123', price: { id: 'price_base_monthly' } }] },
      } as any)

      const mockUpdated = { id: 'sub_123', items: { data: [{ price: { id: 'price_pro_monthly' } }] } }
      vi.mocked(stripe.subscriptions.update).mockResolvedValue(mockUpdated as any)

      const result = await upgradeSubscription('sub_123', 'price_pro_monthly')

      expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith('sub_123')
      expect(stripe.subscriptions.update).toHaveBeenCalledWith('sub_123', {
        items: [{ id: 'si_123', price: 'price_pro_monthly' }],
        proration_behavior: 'always_invoice',
      })
      expect(result).toEqual(mockUpdated)
    })

    it('should throw when no subscription items found', async () => {
      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue({
        items: { data: [] },
      } as any)

      await expect(upgradeSubscription('sub_123', 'price_pro_monthly'))
        .rejects.toThrow('No subscription items found')
    })
  })

  describe('downgradeSubscription', () => {
    it('should cancel at period end with downgrade metadata', async () => {
      const mockSub = { id: 'sub_123', cancel_at_period_end: true }
      vi.mocked(stripe.subscriptions.update).mockResolvedValue(mockSub as any)

      const result = await downgradeSubscription('sub_123', 'price_base_monthly')

      expect(stripe.subscriptions.update).toHaveBeenCalledWith('sub_123', {
        cancel_at_period_end: true,
        metadata: { downgrade_to_price: 'price_base_monthly' },
      })
      expect(result).toEqual(mockSub)
    })
  })

  describe('cancelSubscription', () => {
    it('should cancel subscription at period end', async () => {
      const mockSub = { id: 'sub_123', cancel_at_period_end: true }
      vi.mocked(stripe.subscriptions.update).mockResolvedValue(mockSub as any)

      const result = await cancelSubscription('sub_123')

      expect(stripe.subscriptions.update).toHaveBeenCalledWith('sub_123', {
        cancel_at_period_end: true,
      })
      expect(result).toEqual(mockSub)
    })
  })
})
