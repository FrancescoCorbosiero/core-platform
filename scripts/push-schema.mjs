/**
 * Pushes the Payload schema to the database before production builds.
 * Payload's built-in push only runs in development mode, so this script
 * temporarily sets NODE_ENV to make it work during Vercel builds.
 */

const originalNodeEnv = process.env.NODE_ENV
process.env.NODE_ENV = 'development'

const { getPayload } = await import('payload')

const payload = await getPayload({
  config: (await import('../src/payload/payload.config.ts')).default,
})

console.log('Schema push complete.')
await payload.db.pool.end()

process.env.NODE_ENV = originalNodeEnv
