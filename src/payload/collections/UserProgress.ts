import type { CollectionConfig } from 'payload'

export const UserProgress: CollectionConfig = {
  slug: 'user-progress',
  dbName: 'user_progress',
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (req.user) return { user_id: { equals: req.user.id } }
      return false
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (req.user) return { user_id: { equals: req.user.id } }
      return false
    },
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
      name: 'pill_id',
      type: 'relationship',
      relationTo: 'pills',
      required: true,
    },
    {
      name: 'watch_percentage',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'completed',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'completed_at',
      type: 'date',
    },
    {
      name: 'last_watched_at',
      type: 'date',
    },
  ],
  timestamps: true,
}
