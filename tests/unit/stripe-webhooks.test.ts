import { describe, it, expect, vi, beforeEach } from 'vitest'

// Set required env vars before imports
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret'
process.env.STRIPE_PRICE_BASE_MONTHLY = 'price_base_monthly'
process.env.STRIPE_PRICE_BASE_ANNUAL = 'price_base_annual'
process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_pro_monthly'
process.env.STRIPE_PRICE_PRO_ANNUAL = 'price_pro_annual'

// Mock the dependencies before importing
vi.mock('payload', () => ({
  getPayload: vi.fn(),
}))

vi.mock('@/lib/stripe/client', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}))

vi.mock('@/lib/resend/emails', () => ({
  sendPaymentFailedEmail: vi.fn().mockResolvedValue(undefined),
  sendTrialExpiredEmail: vi.fn().mockResolvedValue(undefined),
  sendRenewalReminderEmail: vi.fn().mockResolvedValue(undefined),
  sendSubscriptionCancelledEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@payload-config', () => ({
  default: {},
}))

import { getPayload } from 'payload'
import { stripe } from '@/lib/stripe/client'
import { handleStripeWebhook } from '@/lib/stripe/webhooks'
import {
  sendPaymentFailedEmail,
  sendTrialExpiredEmail,
  sendRenewalReminderEmail,
  sendSubscriptionCancelledEmail,
} from '@/lib/resend/emails'

describe('Stripe Webhooks', () => {
  const mockPayload = {
    find: vi.fn(),
    update: vi.fn(),
    findByID: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getPayload).mockResolvedValue(mockPayload as any)
  })

  describe('invoice.payment_failed', () => {
    it('should deactivate user on payment failure', async () => {
      const event = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            customer: 'cus_123',
            subscription: 'sub_123',
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)
      mockPayload.find.mockResolvedValue({
        docs: [{ id: 'user-1', email: 'test@example.com', is_active: true }],
      })
      mockPayload.update.mockResolvedValue({})

      await handleStripeWebhook('body', 'sig')

      expect(mockPayload.update).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'users',
          id: 'user-1',
          data: expect.objectContaining({ is_active: false }),
        })
      )
      expect(sendPaymentFailedEmail).toHaveBeenCalledWith('test@example.com')
    })
  })

  describe('customer.subscription.trial_will_end', () => {
    it('should downgrade user to free plan', async () => {
      const event = {
        type: 'customer.subscription.trial_will_end',
        data: {
          object: {
            customer: 'cus_123',
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)
      mockPayload.find.mockResolvedValue({
        docs: [{ id: 'user-1', email: 'test@example.com', plan: 'trial' }],
      })
      mockPayload.update.mockResolvedValue({})

      await handleStripeWebhook('body', 'sig')

      expect(mockPayload.update).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'users',
          id: 'user-1',
          data: expect.objectContaining({ plan: 'free' }),
        })
      )
      expect(sendTrialExpiredEmail).toHaveBeenCalledWith('test@example.com')
    })
  })

  describe('customer.subscription.deleted', () => {
    it('should freeze access on subscription deletion', async () => {
      const event = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            customer: 'cus_123',
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)
      mockPayload.find.mockResolvedValue({
        docs: [{ id: 'user-1', email: 'test@example.com', plan: 'pro' }],
      })
      mockPayload.update.mockResolvedValue({})

      await handleStripeWebhook('body', 'sig')

      expect(mockPayload.update).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'users',
          id: 'user-1',
          data: expect.objectContaining({
            plan_expires_at: expect.any(String),
          }),
        })
      )
      expect(sendSubscriptionCancelledEmail).toHaveBeenCalledWith('test@example.com')
    })
  })

  describe('customer.subscription.updated', () => {
    it('should update user plan on subscription change', async () => {
      process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_pro_monthly'
      process.env.STRIPE_PRICE_PRO_ANNUAL = 'price_pro_annual'
      process.env.STRIPE_PRICE_BASE_MONTHLY = 'price_base_monthly'
      process.env.STRIPE_PRICE_BASE_ANNUAL = 'price_base_annual'

      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            customer: 'cus_123',
            items: {
              data: [{ price: { id: 'price_pro_monthly' } }],
            },
            current_period_end: Math.floor(Date.now() / 1000) + 86400,
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)
      mockPayload.find.mockResolvedValue({
        docs: [{ id: 'user-1', email: 'test@example.com', plan: 'base' }],
      })
      mockPayload.update.mockResolvedValue({})

      await handleStripeWebhook('body', 'sig')

      expect(mockPayload.update).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'users',
          id: 'user-1',
          data: expect.objectContaining({
            plan: 'pro',
          }),
        })
      )
    })
  })

  describe('invoice.upcoming', () => {
    it('should send renewal reminder for annual plans', async () => {
      process.env.STRIPE_PRICE_PRO_ANNUAL = 'price_pro_annual'
      process.env.STRIPE_PRICE_BASE_ANNUAL = 'price_base_annual'
      process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_pro_monthly'
      process.env.STRIPE_PRICE_BASE_MONTHLY = 'price_base_monthly'

      const event = {
        type: 'invoice.upcoming',
        data: {
          object: {
            customer: 'cus_123',
            subscription: 'sub_123',
            lines: {
              data: [{ pricing: { price_details: { price: { id: 'price_pro_annual' } } } }],
            },
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)
      mockPayload.find.mockResolvedValue({
        docs: [{ id: 'user-1', email: 'test@example.com', plan: 'pro' }],
      })

      await handleStripeWebhook('body', 'sig')

      expect(sendRenewalReminderEmail).toHaveBeenCalledWith('test@example.com', expect.any(String))
    })
  })

  describe('idempotency', () => {
    it('should handle missing user gracefully', async () => {
      const event = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            customer: 'cus_nonexistent',
            subscription: 'sub_123',
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)
      mockPayload.find.mockResolvedValue({ docs: [] })

      // Should not throw
      await handleStripeWebhook('body', 'sig')

      expect(mockPayload.update).not.toHaveBeenCalled()
    })
  })

  describe('webhook signature verification', () => {
    it('should throw when STRIPE_WEBHOOK_SECRET is not set', async () => {
      const original = process.env.STRIPE_WEBHOOK_SECRET
      delete process.env.STRIPE_WEBHOOK_SECRET

      await expect(handleStripeWebhook('body', 'sig')).rejects.toThrow(
        'STRIPE_WEBHOOK_SECRET is not set'
      )

      process.env.STRIPE_WEBHOOK_SECRET = original
    })

    it('should throw on invalid signature', async () => {
      vi.mocked(stripe.webhooks.constructEvent).mockImplementation(() => {
        throw new Error('Invalid signature')
      })

      await expect(handleStripeWebhook('body', 'bad_sig')).rejects.toThrow(
        'Webhook signature verification failed: Invalid signature'
      )
    })

    it('should handle non-Error thrown during signature verification', async () => {
      vi.mocked(stripe.webhooks.constructEvent).mockImplementation(() => {
        throw 'some string error'
      })

      await expect(handleStripeWebhook('body', 'bad_sig')).rejects.toThrow(
        'Webhook signature verification failed: Unknown error'
      )
    })
  })

  describe('unhandled event types', () => {
    it('should log unhandled event types', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const event = {
        type: 'some.unhandled.event',
        data: { object: {} },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)

      await handleStripeWebhook('body', 'sig')

      expect(consoleSpy).toHaveBeenCalledWith('Unhandled webhook event type: some.unhandled.event')
      consoleSpy.mockRestore()
    })
  })

  describe('invoice.payment_failed edge cases', () => {
    it('should handle customer as object with id', async () => {
      const event = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            customer: { id: 'cus_456' },
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)
      mockPayload.find.mockResolvedValue({
        docs: [{ id: 'user-2', email: 'test2@example.com' }],
      })
      mockPayload.update.mockResolvedValue({})

      await handleStripeWebhook('body', 'sig')

      expect(mockPayload.update).toHaveBeenCalled()
      expect(sendPaymentFailedEmail).toHaveBeenCalledWith('test2@example.com')
    })

    it('should handle missing customer ID', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const event = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            customer: null,
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)

      await handleStripeWebhook('body', 'sig')

      expect(mockPayload.update).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('customer.subscription.trial_will_end edge cases', () => {
    it('should handle missing customer ID', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const event = {
        type: 'customer.subscription.trial_will_end',
        data: {
          object: {
            customer: null,
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)

      await handleStripeWebhook('body', 'sig')

      expect(mockPayload.update).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should handle missing user for trial_will_end', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const event = {
        type: 'customer.subscription.trial_will_end',
        data: {
          object: {
            customer: 'cus_missing',
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)
      mockPayload.find.mockResolvedValue({ docs: [] })

      await handleStripeWebhook('body', 'sig')

      expect(mockPayload.update).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('customer.subscription.updated edge cases', () => {
    it('should handle missing customer ID', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            customer: null,
            items: { data: [] },
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)

      await handleStripeWebhook('body', 'sig')

      expect(mockPayload.update).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should handle missing user for subscription updated', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            customer: 'cus_missing',
            items: { data: [{ price: { id: 'price_pro_monthly' } }] },
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)
      mockPayload.find.mockResolvedValue({ docs: [] })

      await handleStripeWebhook('body', 'sig')

      expect(mockPayload.update).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should handle missing price ID in subscription items', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            customer: 'cus_123',
            items: { data: [{}] },
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)
      mockPayload.find.mockResolvedValue({
        docs: [{ id: 'user-1', email: 'test@example.com' }],
      })

      await handleStripeWebhook('body', 'sig')

      expect(mockPayload.update).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should handle subscription with no current_period_end', async () => {
      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            customer: 'cus_123',
            items: { data: [{ price: { id: 'price_base_monthly' } }] },
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)
      mockPayload.find.mockResolvedValue({
        docs: [{ id: 'user-1', email: 'test@example.com' }],
      })
      mockPayload.update.mockResolvedValue({})

      await handleStripeWebhook('body', 'sig')

      expect(mockPayload.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            plan: 'base',
            plan_expires_at: null,
          }),
        })
      )
    })

    it('should map unknown price to free plan', async () => {
      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            customer: 'cus_123',
            items: { data: [{ price: { id: 'price_unknown' } }] },
            current_period_end: Math.floor(Date.now() / 1000) + 86400,
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)
      mockPayload.find.mockResolvedValue({
        docs: [{ id: 'user-1', email: 'test@example.com' }],
      })
      mockPayload.update.mockResolvedValue({})

      await handleStripeWebhook('body', 'sig')

      expect(mockPayload.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ plan: 'free' }),
        })
      )
    })
  })

  describe('customer.subscription.deleted edge cases', () => {
    it('should handle missing customer ID', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const event = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            customer: null,
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)

      await handleStripeWebhook('body', 'sig')

      expect(mockPayload.update).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should handle missing user for subscription deleted', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const event = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            customer: 'cus_missing',
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)
      mockPayload.find.mockResolvedValue({ docs: [] })

      await handleStripeWebhook('body', 'sig')

      expect(mockPayload.update).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('customer.subscription.trial_will_end - customer as object', () => {
    it('should handle customer as object with id', async () => {
      const event = {
        type: 'customer.subscription.trial_will_end',
        data: {
          object: {
            customer: { id: 'cus_789' },
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)
      mockPayload.find.mockResolvedValue({
        docs: [{ id: 'user-3', email: 'test3@example.com', plan: 'trial' }],
      })
      mockPayload.update.mockResolvedValue({})

      await handleStripeWebhook('body', 'sig')

      expect(mockPayload.update).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'users',
          id: 'user-3',
          data: expect.objectContaining({ plan: 'free' }),
        })
      )
      expect(sendTrialExpiredEmail).toHaveBeenCalledWith('test3@example.com')
    })
  })

  describe('customer.subscription.deleted - customer as object', () => {
    it('should handle customer as object with id', async () => {
      const event = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            customer: { id: 'cus_789' },
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)
      mockPayload.find.mockResolvedValue({
        docs: [{ id: 'user-3', email: 'test3@example.com', plan: 'pro' }],
      })
      mockPayload.update.mockResolvedValue({})

      await handleStripeWebhook('body', 'sig')

      expect(mockPayload.update).toHaveBeenCalled()
      expect(sendSubscriptionCancelledEmail).toHaveBeenCalledWith('test3@example.com')
    })
  })

  describe('customer.subscription.updated - customer as object', () => {
    it('should handle customer as object with id', async () => {
      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            customer: { id: 'cus_789' },
            items: { data: [{ price: { id: 'price_pro_monthly' } }] },
            current_period_end: Math.floor(Date.now() / 1000) + 86400,
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)
      mockPayload.find.mockResolvedValue({
        docs: [{ id: 'user-3', email: 'test3@example.com' }],
      })
      mockPayload.update.mockResolvedValue({})

      await handleStripeWebhook('body', 'sig')

      expect(mockPayload.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ plan: 'pro' }),
        })
      )
    })
  })

  describe('invoice.upcoming edge cases', () => {
    it('should handle missing customer ID', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const event = {
        type: 'invoice.upcoming',
        data: {
          object: {
            customer: null,
            lines: { data: [] },
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)

      await handleStripeWebhook('body', 'sig')

      expect(sendRenewalReminderEmail).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should skip non-annual plans', async () => {
      const event = {
        type: 'invoice.upcoming',
        data: {
          object: {
            customer: 'cus_123',
            lines: {
              data: [{ pricing: { price_details: { price: { id: 'price_pro_monthly' } } } }],
            },
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)

      await handleStripeWebhook('body', 'sig')

      expect(sendRenewalReminderEmail).not.toHaveBeenCalled()
    })

    it('should handle missing user for invoice.upcoming', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const event = {
        type: 'invoice.upcoming',
        data: {
          object: {
            customer: 'cus_missing',
            lines: {
              data: [{ pricing: { price_details: { price: { id: 'price_pro_annual' } } } }],
            },
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)
      mockPayload.find.mockResolvedValue({ docs: [] })

      await handleStripeWebhook('body', 'sig')

      expect(sendRenewalReminderEmail).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should handle invoice with next_payment_attempt', async () => {
      const event = {
        type: 'invoice.upcoming',
        data: {
          object: {
            customer: 'cus_123',
            lines: {
              data: [{ pricing: { price_details: { price: { id: 'price_base_annual' } } } }],
            },
            next_payment_attempt: Math.floor(Date.now() / 1000) + 86400 * 30,
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)
      mockPayload.find.mockResolvedValue({
        docs: [{ id: 'user-1', email: 'test@example.com' }],
      })

      await handleStripeWebhook('body', 'sig')

      expect(sendRenewalReminderEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(String)
      )
    })

    it('should handle invoice without next_payment_attempt', async () => {
      const event = {
        type: 'invoice.upcoming',
        data: {
          object: {
            customer: 'cus_123',
            lines: {
              data: [{ pricing: { price_details: { price: { id: 'price_base_annual' } } } }],
            },
            next_payment_attempt: null,
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)
      mockPayload.find.mockResolvedValue({
        docs: [{ id: 'user-1', email: 'test@example.com' }],
      })

      await handleStripeWebhook('body', 'sig')

      expect(sendRenewalReminderEmail).toHaveBeenCalledWith('test@example.com', 'prossimamente')
    })

    it('should handle price as string in line item', async () => {
      const event = {
        type: 'invoice.upcoming',
        data: {
          object: {
            customer: 'cus_123',
            lines: {
              data: [{ pricing: { price_details: { price: 'price_pro_annual' } } }],
            },
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)
      mockPayload.find.mockResolvedValue({
        docs: [{ id: 'user-1', email: 'test@example.com' }],
      })

      await handleStripeWebhook('body', 'sig')

      expect(sendRenewalReminderEmail).toHaveBeenCalledWith('test@example.com', expect.any(String))
    })

    it('should skip when no price ID found in line item', async () => {
      const event = {
        type: 'invoice.upcoming',
        data: {
          object: {
            customer: 'cus_123',
            lines: {
              data: [{ pricing: { price_details: { price: null } } }],
            },
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)

      await handleStripeWebhook('body', 'sig')

      expect(sendRenewalReminderEmail).not.toHaveBeenCalled()
    })

    it('should skip when no line items', async () => {
      const event = {
        type: 'invoice.upcoming',
        data: {
          object: {
            customer: 'cus_123',
            lines: {
              data: [],
            },
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as any)

      await handleStripeWebhook('body', 'sig')

      expect(sendRenewalReminderEmail).not.toHaveBeenCalled()
    })
  })
})
