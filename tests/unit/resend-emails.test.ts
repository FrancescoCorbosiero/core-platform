import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/resend/client', () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
}))

import { resend } from '@/lib/resend/client'
import {
  sendConfirmAccountEmail,
  sendTrialExpiringEmail,
  sendTrialExpiredEmail,
  sendSubscriptionConfirmedEmail,
  sendPaymentFailedEmail,
  sendRenewalReminderEmail,
  sendSubscriptionCancelledEmail,
  sendB2BMagicLinkEmail,
} from '@/lib/resend/emails'

describe('Resend Emails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sendConfirmAccountEmail', () => {
    it('should send confirmation email successfully', async () => {
      vi.mocked(resend.emails.send).mockResolvedValue({ data: { id: 'email-1' }, error: null } as any)

      await sendConfirmAccountEmail('user@test.com', 'https://tereso.it/confirm/abc')

      expect(resend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: 'Conferma il tuo account Tereso',
        })
      )
    })

    it('should throw on error', async () => {
      vi.mocked(resend.emails.send).mockResolvedValue({ data: null, error: { message: 'API error', name: 'api_error' } } as any)

      await expect(sendConfirmAccountEmail('user@test.com', 'https://tereso.it/confirm/abc'))
        .rejects.toThrow('Failed to send confirm account email: API error')
    })
  })

  describe('sendTrialExpiringEmail', () => {
    it('should send trial expiring email successfully', async () => {
      vi.mocked(resend.emails.send).mockResolvedValue({ data: { id: 'email-2' }, error: null } as any)

      await sendTrialExpiringEmail('user@test.com', 3)

      expect(resend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: 'Il tuo periodo di prova scade tra 3 giorni',
        })
      )
    })

    it('should throw on error', async () => {
      vi.mocked(resend.emails.send).mockResolvedValue({ data: null, error: { message: 'Rate limited', name: 'rate_limit' } } as any)

      await expect(sendTrialExpiringEmail('user@test.com', 3))
        .rejects.toThrow('Failed to send trial expiring email: Rate limited')
    })
  })

  describe('sendTrialExpiredEmail', () => {
    it('should send trial expired email successfully', async () => {
      vi.mocked(resend.emails.send).mockResolvedValue({ data: { id: 'email-3' }, error: null } as any)

      await sendTrialExpiredEmail('user@test.com')

      expect(resend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: 'Il tuo periodo di prova è scaduto',
        })
      )
    })

    it('should throw on error', async () => {
      vi.mocked(resend.emails.send).mockResolvedValue({ data: null, error: { message: 'Send failed', name: 'send_error' } } as any)

      await expect(sendTrialExpiredEmail('user@test.com'))
        .rejects.toThrow('Failed to send trial expired email: Send failed')
    })
  })

  describe('sendSubscriptionConfirmedEmail', () => {
    it('should send subscription confirmed email successfully', async () => {
      vi.mocked(resend.emails.send).mockResolvedValue({ data: { id: 'email-4' }, error: null } as any)

      await sendSubscriptionConfirmedEmail('user@test.com', 'Pro')

      expect(resend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: 'Abbonamento confermato',
        })
      )
    })

    it('should throw on error', async () => {
      vi.mocked(resend.emails.send).mockResolvedValue({ data: null, error: { message: 'Error', name: 'error' } } as any)

      await expect(sendSubscriptionConfirmedEmail('user@test.com', 'Pro'))
        .rejects.toThrow('Failed to send subscription confirmed email: Error')
    })
  })

  describe('sendPaymentFailedEmail', () => {
    it('should send payment failed email successfully', async () => {
      vi.mocked(resend.emails.send).mockResolvedValue({ data: { id: 'email-5' }, error: null } as any)

      await sendPaymentFailedEmail('user@test.com')

      expect(resend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: 'Pagamento non riuscito',
        })
      )
    })

    it('should throw on error', async () => {
      vi.mocked(resend.emails.send).mockResolvedValue({ data: null, error: { message: 'Error', name: 'error' } } as any)

      await expect(sendPaymentFailedEmail('user@test.com'))
        .rejects.toThrow('Failed to send payment failed email: Error')
    })
  })

  describe('sendRenewalReminderEmail', () => {
    it('should send renewal reminder email successfully', async () => {
      vi.mocked(resend.emails.send).mockResolvedValue({ data: { id: 'email-6' }, error: null } as any)

      await sendRenewalReminderEmail('user@test.com', '01/04/2026')

      expect(resend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: 'Promemoria di rinnovo abbonamento',
        })
      )
    })

    it('should throw on error', async () => {
      vi.mocked(resend.emails.send).mockResolvedValue({ data: null, error: { message: 'Error', name: 'error' } } as any)

      await expect(sendRenewalReminderEmail('user@test.com', '01/04/2026'))
        .rejects.toThrow('Failed to send renewal reminder email: Error')
    })
  })

  describe('sendSubscriptionCancelledEmail', () => {
    it('should send subscription cancelled email successfully', async () => {
      vi.mocked(resend.emails.send).mockResolvedValue({ data: { id: 'email-7' }, error: null } as any)

      await sendSubscriptionCancelledEmail('user@test.com')

      expect(resend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: 'Abbonamento cancellato',
        })
      )
    })

    it('should throw on error', async () => {
      vi.mocked(resend.emails.send).mockResolvedValue({ data: null, error: { message: 'Error', name: 'error' } } as any)

      await expect(sendSubscriptionCancelledEmail('user@test.com'))
        .rejects.toThrow('Failed to send subscription cancelled email: Error')
    })
  })

  describe('sendB2BMagicLinkEmail', () => {
    it('should send B2B magic link email successfully', async () => {
      vi.mocked(resend.emails.send).mockResolvedValue({ data: { id: 'email-8' }, error: null } as any)

      await sendB2BMagicLinkEmail('user@test.com', 'https://tereso.it/magic/xyz')

      expect(resend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: 'Il tuo link di accesso Tereso',
        })
      )
    })

    it('should throw on error', async () => {
      vi.mocked(resend.emails.send).mockResolvedValue({ data: null, error: { message: 'Error', name: 'error' } } as any)

      await expect(sendB2BMagicLinkEmail('user@test.com', 'https://tereso.it/magic/xyz'))
        .rejects.toThrow('Failed to send B2B magic link email: Error')
    })
  })
})
