import { randomBytes } from 'crypto'

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const bytes = randomBytes(8)
  let code = ''

  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length]
  }

  return code
}
