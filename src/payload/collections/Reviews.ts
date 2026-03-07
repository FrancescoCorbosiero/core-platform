import type { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  dbName: 'reviews',
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      return { is_visible: { equals: true } }
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
      name: 'course_id',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
    },
    {
      name: 'comment',
      type: 'textarea',
    },
    {
      name: 'is_visible',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'created_at',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
    },
  ],
  timestamps: true,
}
