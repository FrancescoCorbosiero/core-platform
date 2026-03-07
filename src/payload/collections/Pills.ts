import type { CollectionConfig } from 'payload'

export const Pills: CollectionConfig = {
  slug: 'pills',
  dbName: 'pills',
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
      name: 'course_id',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
    },
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
      name: 'thumbnail_url',
      type: 'text',
    },
    {
      name: 'mux_asset_id',
      type: 'text',
    },
    {
      name: 'mux_playback_id',
      type: 'text',
    },
    {
      name: 'duration_seconds',
      type: 'number',
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
      name: 'sort_order',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  timestamps: true,
}
