import type { CollectionConfig } from 'payload'

export const TeresiLedger: CollectionConfig = {
  slug: 'teresi-ledger',
  dbName: 'teresi_ledger',
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (req.user) return { user_id: { equals: req.user.id } }
      return false
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'user_id',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
    },
    {
      name: 'action',
      type: 'select',
      options: [
        { label: 'Video', value: 'video' },
        { label: 'Quiz', value: 'quiz' },
        { label: 'Course', value: 'course' },
        { label: 'Badge', value: 'badge' },
        { label: 'Referral', value: 'referral' },
        { label: 'Review', value: 'review' },
        { label: 'Login', value: 'login' },
        { label: 'Session', value: 'session' },
      ],
    },
    {
      name: 'ref_id',
      type: 'text',
    },
    {
      name: 'created_at',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
    },
  ],
  timestamps: true,
}
