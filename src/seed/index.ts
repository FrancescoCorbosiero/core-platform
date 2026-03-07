import { getPayload } from 'payload'
import config from '@payload-config'

const categories = [
  { name: 'Budget e pianificazione', slug: 'budget-e-pianificazione', description: 'Impara a gestire il tuo budget e pianificare le tue finanze', sort_order: 1 },
  { name: 'Risparmio e investimenti', slug: 'risparmio-e-investimenti', description: 'Scopri come risparmiare e investire saggiamente', sort_order: 2 },
  { name: 'Pensione', slug: 'pensione', description: 'Preparati per il futuro con la pianificazione pensionistica', sort_order: 3 },
  { name: 'Servizi bancari', slug: 'servizi-bancari', description: 'Comprendi i servizi bancari e come utilizzarli al meglio', sort_order: 4 },
  { name: 'Assicurazioni', slug: 'assicurazioni', description: 'Proteggi te stesso e i tuoi beni con le assicurazioni', sort_order: 5 },
  { name: 'Mutui e finanziamenti', slug: 'mutui-e-finanziamenti', description: 'Naviga il mondo dei mutui e dei finanziamenti', sort_order: 6 },
  { name: 'Finanza digitale', slug: 'finanza-digitale', description: 'Esplora il mondo della finanza digitale e delle criptovalute', sort_order: 7 },
  { name: 'Fiscalità', slug: 'fiscalita', description: 'Comprendi il sistema fiscale italiano', sort_order: 8 },
]

const badges = [
  { name: 'Benvenuto a Bordo', description: 'Registrazione completata', image_url: '', condition_type: 'registration' as const, condition_value: 1 },
  { name: 'Prima Pillola', description: 'Hai guardato il tuo primo video', image_url: '', condition_type: 'video_count' as const, condition_value: 1 },
  { name: 'Maratoneta', description: 'Hai guardato 10 video', image_url: '', condition_type: 'video_count' as const, condition_value: 10 },
  { name: 'Quiz Master', description: 'Hai completato 5 quiz', image_url: '', condition_type: 'quiz_count' as const, condition_value: 5 },
  { name: 'Corso Conquistatore', description: 'Hai completato il tuo primo corso', image_url: '', condition_type: 'course' as const, condition_value: 1 },
  { name: 'Social Star', description: 'Hai lasciato la tua prima recensione', image_url: '', condition_type: 'review' as const, condition_value: 1 },
  { name: 'Tool User', description: 'Hai utilizzato il tuo primo strumento', image_url: '', condition_type: 'tool' as const, condition_value: 1 },
  { name: 'Referral Champion', description: 'Hai invitato il tuo primo amico', image_url: '', condition_type: 'referral' as const, condition_value: 1 },
]

export async function seed() {
  const payload = await getPayload({ config })

  console.log('Seeding database...')

  // Create admin user
  console.log('Creating admin user...')
  await payload.create({
    collection: 'users',
    data: {
      email: 'admin@tereso.it',
      password: 'admin123456',
      nickname: 'Tereso Admin',
      first_name: 'Tereso',
      last_name: 'Admin',
      role: 'admin',
      plan: 'pro',
      is_active: true,
      referral_code: 'TERESO-ADMIN',
    },
  })

  // Create categories
  console.log('Creating categories...')
  for (const cat of categories) {
    await payload.create({
      collection: 'categories',
      data: { ...cat, is_active: true },
    })
  }

  // Create badges
  console.log('Creating badges...')
  for (const badge of badges) {
    await payload.create({
      collection: 'badges',
      data: badge,
    })
  }

  // Create sample company
  console.log('Creating sample company...')
  const company = await payload.create({
    collection: 'companies',
    data: {
      name: 'Acme Finance SpA',
      vat_number: 'IT12345678901',
      sdi_code: 'ABCDEFG',
      contract_start: new Date().toISOString(),
      contract_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      session_credits: 100,
      session_credits_used: 0,
      is_active: true,
    },
  })

  // Create B2B employees
  console.log('Creating B2B employees...')
  await payload.create({
    collection: 'users',
    data: {
      email: 'mario.rossi@acmefinance.it',
      password: 'employee123456',
      first_name: 'Mario',
      last_name: 'Rossi',
      role: 'b2b',
      plan: 'pro',
      company_id: company.id,
      is_active: true,
      referral_code: 'B2B-MARIO',
    },
  })

  await payload.create({
    collection: 'users',
    data: {
      email: 'lucia.bianchi@acmefinance.it',
      password: 'employee123456',
      first_name: 'Lucia',
      last_name: 'Bianchi',
      role: 'b2b',
      plan: 'pro',
      company_id: company.id,
      is_active: true,
      referral_code: 'B2B-LUCIA',
    },
  })

  // Create B2C trial user
  console.log('Creating B2C trial user...')
  const now = new Date()
  const trialEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  await payload.create({
    collection: 'users',
    data: {
      email: 'trial.user@example.com',
      password: 'trial123456',
      nickname: 'TrialUser',
      first_name: 'Trial',
      last_name: 'User',
      role: 'b2c',
      plan: 'trial',
      trial_started_at: now.toISOString(),
      trial_ends_at: trialEnd.toISOString(),
      is_active: true,
      referral_code: 'TRIAL-USER',
    },
  })

  console.log('Seed completed successfully!')
}

// Allow running as script
seed().catch(console.error)
