export type Plan = 'free' | 'base' | 'pro' | 'trial'

export interface UserWithPlan {
  plan: Plan
  plan_expires_at?: string | Date | null
  trial_ends_at?: string | Date | null
  is_active?: boolean
}

const PLAN_LEVELS: Record<string, number> = {
  free: 0,
  base: 1,
  trial: 2,
  pro: 2,
}

const PLAN_HIERARCHY: Record<string, string[]> = {
  free: ['free'],
  base: ['free', 'base'],
  pro: ['free', 'base', 'pro'],
  trial: ['free', 'base', 'pro'],
}

export function getPlanHierarchy(): Record<string, string[]> {
  return { ...PLAN_HIERARCHY }
}

export function isPlanExpired(user: UserWithPlan): boolean {
  if (user.plan === 'free') {
    return false
  }

  if (!user.plan_expires_at) {
    return false
  }

  return new Date(user.plan_expires_at) < new Date()
}

export function isTrialExpired(user: UserWithPlan): boolean {
  if (!user.trial_ends_at) {
    return false
  }

  return new Date(user.trial_ends_at) < new Date()
}

export function canAccessContent(user: UserWithPlan, minPlan: Plan): boolean {
  if (user.is_active === false) {
    return false
  }

  // Expired plan/trial users can still access free content
  if (user.plan !== 'free' && isPlanExpired(user)) {
    return minPlan === 'free'
  }

  if (user.plan === 'trial' && isTrialExpired(user)) {
    return minPlan === 'free'
  }

  const userLevel = PLAN_LEVELS[user.plan] ?? 0
  const requiredLevel = PLAN_LEVELS[minPlan] ?? 0

  return userLevel >= requiredLevel
}

export function canDownload(user: UserWithPlan): boolean {
  if (user.plan === 'free' || user.plan === 'trial') {
    return false
  }

  if (isPlanExpired(user)) {
    return false
  }

  return true
}

export function canAccessLiveEvents(user: UserWithPlan): boolean {
  if (user.plan !== 'pro') {
    return false
  }

  if (isPlanExpired(user)) {
    return false
  }

  return true
}

export function canReceiveCertificates(user: UserWithPlan): boolean {
  if (user.plan !== 'pro') {
    return false
  }

  if (isPlanExpired(user)) {
    return false
  }

  return true
}
