import type { CollectionConfig } from 'payload'

export const UserBadges: CollectionConfig = {
  slug: 'user-badges',
  dbName: 'user_badges',
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
      name: 'badge_id',
      type: 'relationship',
      relationTo: 'badges',
      required: true,
    },
    {
      name: 'earned_at',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
    },
  ],
  timestamps: true,
}
