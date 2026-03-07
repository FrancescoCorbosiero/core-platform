import { describe, it, expect } from 'vitest'
import { generateReferralCode } from '@/lib/auth/referral'
import { canAccessContent, canDownload, canAccessLiveEvents, canReceiveCertificates } from '@/lib/auth/plans'

describe('generateReferralCode', () => {
  it('should generate an 8-character code', () => {
    const code = generateReferralCode()
    expect(code).toHaveLength(8)
  })

  it('should only contain alphanumeric characters', () => {
    const code = generateReferralCode()
    expect(code).toMatch(/^[A-Z0-9]+$/)
  })

  it('should generate unique codes', () => {
    const codes = new Set()
    for (let i = 0; i < 100; i++) {
      codes.add(generateReferralCode())
    }
    // With 36^8 possible codes, 100 should all be unique
    expect(codes.size).toBe(100)
  })
})

describe('canAccessContent - inactive user', () => {
  it('should return false for inactive user regardless of plan', () => {
    const user = { plan: 'pro' as const, is_active: false }
    expect(canAccessContent(user, 'free')).toBe(false)
  })

  it('should return false for inactive user trying to access base content', () => {
    const user = { plan: 'base' as const, is_active: false }
    expect(canAccessContent(user, 'base')).toBe(false)
  })
})

describe('canDownload - expired plan', () => {
  it('should return false when base plan is expired', () => {
    const user = {
      plan: 'base' as const,
      plan_expires_at: new Date(Date.now() - 86400000).toISOString(),
    }
    expect(canDownload(user)).toBe(false)
  })

  it('should return false when pro plan is expired', () => {
    const user = {
      plan: 'pro' as const,
      plan_expires_at: new Date(Date.now() - 86400000).toISOString(),
    }
    expect(canDownload(user)).toBe(false)
  })
})

describe('canAccessLiveEvents - expired plan', () => {
  it('should return false when pro plan is expired', () => {
    const user = {
      plan: 'pro' as const,
      plan_expires_at: new Date(Date.now() - 86400000).toISOString(),
    }
    expect(canAccessLiveEvents(user)).toBe(false)
  })
})

describe('canReceiveCertificates - expired plan', () => {
  it('should return false when pro plan is expired', () => {
    const user = {
      plan: 'pro' as const,
      plan_expires_at: new Date(Date.now() - 86400000).toISOString(),
    }
    expect(canReceiveCertificates(user)).toBe(false)
  })
})
