import { describe, it, expect, vi } from 'vitest'
import { canAccessContent, isPlanExpired, isTrialExpired, canDownload, canAccessLiveEvents, canReceiveCertificates, getPlanHierarchy, type Plan } from '@/lib/auth/plans'
import { isAdmin, isAdminOrSelf, isAuthenticated, hasContentAccess, isAdminOrOwner } from '@/payload/access/index'

// Mock user factory
function createUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'b2c',
    plan: 'free' as Plan,
    is_active: true,
    trial_started_at: null,
    trial_ends_at: null,
    plan_expires_at: null,
    company_id: null,
    ...overrides,
  }
}

function createReq(user: Record<string, unknown> | null = null) {
  return { req: { user } } as any
}

describe('Plan Hierarchy', () => {
  it('should return correct plan hierarchy', () => {
    const hierarchy = getPlanHierarchy()
    expect(hierarchy.free).toEqual(['free'])
    expect(hierarchy.base).toEqual(['free', 'base'])
    expect(hierarchy.pro).toEqual(['free', 'base', 'pro'])
    expect(hierarchy.trial).toEqual(['free', 'base', 'pro'])
  })
})

describe('isPlanExpired', () => {
  it('should return false for free plan', () => {
    const user = createUser({ plan: 'free' })
    expect(isPlanExpired(user)).toBe(false)
  })

  it('should return false when plan_expires_at is in the future', () => {
    const user = createUser({
      plan: 'pro',
      plan_expires_at: new Date(Date.now() + 86400000).toISOString(),
    })
    expect(isPlanExpired(user)).toBe(false)
  })

  it('should return true when plan_expires_at is in the past', () => {
    const user = createUser({
      plan: 'pro',
      plan_expires_at: new Date(Date.now() - 86400000).toISOString(),
    })
    expect(isPlanExpired(user)).toBe(true)
  })

  it('should return false when plan_expires_at is null', () => {
    const user = createUser({ plan: 'pro', plan_expires_at: null })
    expect(isPlanExpired(user)).toBe(false)
  })
})

describe('isTrialExpired', () => {
  it('should return false for non-trial plan', () => {
    const user = createUser({ plan: 'free' })
    expect(isTrialExpired(user)).toBe(false)
  })

  it('should return false when trial_ends_at is in the future', () => {
    const user = createUser({
      plan: 'trial',
      trial_ends_at: new Date(Date.now() + 86400000).toISOString(),
    })
    expect(isTrialExpired(user)).toBe(false)
  })

  it('should return true when trial_ends_at is in the past', () => {
    const user = createUser({
      plan: 'trial',
      trial_ends_at: new Date(Date.now() - 86400000).toISOString(),
    })
    expect(isTrialExpired(user)).toBe(true)
  })
})

describe('canAccessContent', () => {
  it('free user can access free content', () => {
    const user = createUser({ plan: 'free' })
    expect(canAccessContent(user, 'free')).toBe(true)
  })

  it('free user cannot access base content', () => {
    const user = createUser({ plan: 'free' })
    expect(canAccessContent(user, 'base')).toBe(false)
  })

  it('free user cannot access pro content', () => {
    const user = createUser({ plan: 'free' })
    expect(canAccessContent(user, 'pro')).toBe(false)
  })

  it('base user can access free and base content', () => {
    const user = createUser({ plan: 'base' })
    expect(canAccessContent(user, 'free')).toBe(true)
    expect(canAccessContent(user, 'base')).toBe(true)
  })

  it('base user cannot access pro content', () => {
    const user = createUser({ plan: 'base' })
    expect(canAccessContent(user, 'pro')).toBe(false)
  })

  it('pro user can access all content', () => {
    const user = createUser({ plan: 'pro' })
    expect(canAccessContent(user, 'free')).toBe(true)
    expect(canAccessContent(user, 'base')).toBe(true)
    expect(canAccessContent(user, 'pro')).toBe(true)
  })

  it('trial user can access all content', () => {
    const user = createUser({
      plan: 'trial',
      trial_ends_at: new Date(Date.now() + 86400000).toISOString(),
    })
    expect(canAccessContent(user, 'free')).toBe(true)
    expect(canAccessContent(user, 'base')).toBe(true)
    expect(canAccessContent(user, 'pro')).toBe(true)
  })

  it('expired trial user can only access free content', () => {
    const user = createUser({
      plan: 'trial',
      trial_ends_at: new Date(Date.now() - 86400000).toISOString(),
    })
    expect(canAccessContent(user, 'free')).toBe(true)
    expect(canAccessContent(user, 'base')).toBe(false)
    expect(canAccessContent(user, 'pro')).toBe(false)
  })

  it('expired plan user can only access free content', () => {
    const user = createUser({
      plan: 'pro',
      plan_expires_at: new Date(Date.now() - 86400000).toISOString(),
    })
    expect(canAccessContent(user, 'free')).toBe(true)
    expect(canAccessContent(user, 'base')).toBe(false)
    expect(canAccessContent(user, 'pro')).toBe(false)
  })
})

describe('canAccessContent edge cases', () => {
  it('inactive user cannot access any content', () => {
    const user = createUser({ plan: 'pro', is_active: false })
    expect(canAccessContent(user, 'free')).toBe(false)
  })
})

describe('canDownload', () => {
  it('trial users cannot download', () => {
    const user = createUser({ plan: 'trial' })
    expect(canDownload(user)).toBe(false)
  })

  it('free users cannot download', () => {
    const user = createUser({ plan: 'free' })
    expect(canDownload(user)).toBe(false)
  })

  it('base users can download', () => {
    const user = createUser({ plan: 'base' })
    expect(canDownload(user)).toBe(true)
  })

  it('pro users can download', () => {
    const user = createUser({ plan: 'pro' })
    expect(canDownload(user)).toBe(true)
  })

  it('expired pro user cannot download', () => {
    const user = createUser({
      plan: 'pro',
      plan_expires_at: new Date(Date.now() - 86400000).toISOString(),
    })
    expect(canDownload(user)).toBe(false)
  })
})

describe('canAccessLiveEvents', () => {
  it('only pro users can access live events', () => {
    expect(canAccessLiveEvents(createUser({ plan: 'free' }))).toBe(false)
    expect(canAccessLiveEvents(createUser({ plan: 'base' }))).toBe(false)
    expect(canAccessLiveEvents(createUser({ plan: 'trial' }))).toBe(false)
    expect(canAccessLiveEvents(createUser({ plan: 'pro' }))).toBe(true)
  })

  it('expired pro user cannot access live events', () => {
    const user = createUser({
      plan: 'pro',
      plan_expires_at: new Date(Date.now() - 86400000).toISOString(),
    })
    expect(canAccessLiveEvents(user)).toBe(false)
  })
})

describe('canReceiveCertificates', () => {
  it('only pro users (not trial) can receive certificates', () => {
    expect(canReceiveCertificates(createUser({ plan: 'free' }))).toBe(false)
    expect(canReceiveCertificates(createUser({ plan: 'base' }))).toBe(false)
    expect(canReceiveCertificates(createUser({ plan: 'trial' }))).toBe(false)
    expect(canReceiveCertificates(createUser({ plan: 'pro' }))).toBe(true)
  })

  it('expired pro user cannot receive certificates', () => {
    const user = createUser({
      plan: 'pro',
      plan_expires_at: new Date(Date.now() - 86400000).toISOString(),
    })
    expect(canReceiveCertificates(user)).toBe(false)
  })
})

// --- Payload Access Control Functions ---

describe('isAdmin', () => {
  it('should return true for admin users', () => {
    expect(isAdmin(createReq({ role: 'admin' }))).toBe(true)
  })

  it('should return false for non-admin users', () => {
    expect(isAdmin(createReq({ role: 'b2c' }))).toBe(false)
  })

  it('should return false when no user', () => {
    expect(isAdmin(createReq(null))).toBe(false)
  })
})

describe('isAdminOrSelf', () => {
  it('should return true for admin users', () => {
    expect(isAdminOrSelf(createReq({ role: 'admin', id: 'user-1' }))).toBe(true)
  })

  it('should return false when no user', () => {
    expect(isAdminOrSelf(createReq(null))).toBe(false)
  })

  it('should return constraint for non-admin users', () => {
    const result = isAdminOrSelf(createReq({ role: 'b2c', id: 'user-1' }))
    expect(result).toEqual({ id: { equals: 'user-1' } })
  })
})

describe('isAuthenticated', () => {
  it('should return true for authenticated users', () => {
    expect(isAuthenticated(createReq({ role: 'b2c', id: 'user-1' }))).toBe(true)
  })

  it('should return false when no user', () => {
    expect(isAuthenticated(createReq(null))).toBe(false)
  })
})

describe('hasContentAccess', () => {
  it('should return false when no user', () => {
    expect(hasContentAccess(createReq(null))).toBe(false)
  })

  it('should return true for admin users', () => {
    expect(hasContentAccess(createReq({ role: 'admin' }))).toBe(true)
  })

  it('should return free-only constraint for expired plan', () => {
    const user = {
      role: 'b2c',
      plan: 'pro',
      plan_expires_at: new Date(Date.now() - 86400000).toISOString(),
    }
    expect(hasContentAccess(createReq(user))).toEqual({ min_plan: { equals: 'free' } })
  })

  it('should not restrict non-expired plan', () => {
    const user = {
      role: 'b2c',
      plan: 'pro',
      plan_expires_at: new Date(Date.now() + 86400000).toISOString(),
    }
    const result = hasContentAccess(createReq(user))
    expect(result).toEqual({ min_plan: { in: ['free', 'base', 'pro'] } })
  })

  it('should return free-only constraint for expired trial', () => {
    const user = {
      role: 'b2c',
      plan: 'trial',
      trial_ends_at: new Date(Date.now() - 86400000).toISOString(),
    }
    expect(hasContentAccess(createReq(user))).toEqual({ min_plan: { equals: 'free' } })
  })

  it('should return true for b2b users', () => {
    const user = { role: 'b2b', plan: 'pro' }
    expect(hasContentAccess(createReq(user))).toBe(true)
  })

  it('should return correct plan constraints for free user', () => {
    const user = { role: 'b2c', plan: 'free' }
    expect(hasContentAccess(createReq(user))).toEqual({ min_plan: { in: ['free'] } })
  })

  it('should return correct plan constraints for base user', () => {
    const user = { role: 'b2c', plan: 'base' }
    expect(hasContentAccess(createReq(user))).toEqual({ min_plan: { in: ['free', 'base'] } })
  })

  it('should return correct plan constraints for trial user', () => {
    const user = {
      role: 'b2c',
      plan: 'trial',
      trial_ends_at: new Date(Date.now() + 86400000).toISOString(),
    }
    expect(hasContentAccess(createReq(user))).toEqual({ min_plan: { in: ['free', 'base', 'pro'] } })
  })

  it('should fall back to free for unknown plan', () => {
    const user = { role: 'b2c', plan: 'unknown' }
    expect(hasContentAccess(createReq(user))).toEqual({ min_plan: { in: ['free'] } })
  })

  it('should not check expiry for free plan', () => {
    const user = {
      role: 'b2c',
      plan: 'free',
      plan_expires_at: new Date(Date.now() - 86400000).toISOString(),
    }
    // free plan should not trigger expiry check
    expect(hasContentAccess(createReq(user))).toEqual({ min_plan: { in: ['free'] } })
  })
})

describe('isAdminOrOwner', () => {
  it('should return true for admin users', () => {
    const accessFn = isAdminOrOwner()
    expect(accessFn(createReq({ role: 'admin', id: 'user-1' }))).toBe(true)
  })

  it('should return false when no user', () => {
    const accessFn = isAdminOrOwner()
    expect(accessFn(createReq(null))).toBe(false)
  })

  it('should return constraint with default field name', () => {
    const accessFn = isAdminOrOwner()
    const result = accessFn(createReq({ role: 'b2c', id: 'user-1' }))
    expect(result).toEqual({ user_id: { equals: 'user-1' } })
  })

  it('should return constraint with custom field name', () => {
    const accessFn = isAdminOrOwner('owner_id')
    const result = accessFn(createReq({ role: 'b2c', id: 'user-1' }))
    expect(result).toEqual({ owner_id: { equals: 'user-1' } })
  })
})
