import type { CollectionConfig } from 'payload'

export const Referrals: CollectionConfig = {
  slug: 'referrals',
  dbName: 'referrals',
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (req.user) return { referrer_id: { equals: req.user.id } }
      return false
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'referrer_id',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'referred_id',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'created_at',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'teresi_credited',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  timestamps: true,
}
