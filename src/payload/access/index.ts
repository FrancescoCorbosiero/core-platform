import type { Access } from 'payload'

export const isAdmin: Access = ({ req }) => {
  return req.user?.role === 'admin'
}

export const isAdminOrSelf: Access = ({ req }) => {
  if (req.user?.role === 'admin') return true
  if (!req.user) return false
  return { id: { equals: req.user.id } }
}

export const isAuthenticated: Access = ({ req }) => {
  return !!req.user
}

// Content access based on plan
// This checks: user plan vs content min_plan
// Also handles B2B: only courses in company_course_access
// Also checks plan expiry
export const hasContentAccess: Access = ({ req }) => {
  const user = req.user
  if (!user) return false
  if (user.role === 'admin') return true

  // Check plan expiry
  if (user.plan !== 'free' && user.plan_expires_at) {
    const expiresAt = new Date(user.plan_expires_at)
    if (expiresAt < new Date()) {
      // Expired - only show free content
      return { min_plan: { equals: 'free' } }
    }
  }

  // Check trial expiry
  if (user.plan === 'trial' && user.trial_ends_at) {
    const trialEnds = new Date(user.trial_ends_at)
    if (trialEnds < new Date()) {
      return { min_plan: { equals: 'free' } }
    }
  }

  // B2B users - handled differently (need company_course_access check)
  if (user.role === 'b2b') {
    // Return true here, filter at query level via hooks
    return true
  }

  // Plan hierarchy: free < base < pro, trial = pro (for content access)
  const planLevels: Record<string, string[]> = {
    free: ['free'],
    base: ['free', 'base'],
    pro: ['free', 'base', 'pro'],
    trial: ['free', 'base', 'pro'],
  }

  const allowedPlans = planLevels[user.plan] || ['free']
  return { min_plan: { in: allowedPlans } }
}

// Check if user is admin or if the resource belongs to the user
export const isAdminOrOwner = (userField: string = 'user_id'): Access => {
  return ({ req }) => {
    if (req.user?.role === 'admin') return true
    if (!req.user) return false
    return { [userField]: { equals: req.user.id } }
  }
}
