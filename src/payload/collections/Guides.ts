import type { CollectionConfig } from 'payload'

export const Guides: CollectionConfig = {
  slug: 'guides',
  dbName: 'guides',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (!req.user) return { is_active: { equals: true } }
      return { is_active: { equals: true } }
    },
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'file_url',
      type: 'text',
    },
    {
      name: 'min_plan',
      type: 'select',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Base', value: 'base' },
        { label: 'Pro', value: 'pro' },
      ],
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  timestamps: true,
}
