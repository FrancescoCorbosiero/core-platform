import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  dbName: 'media',
  admin: {
    useAsTitle: 'alt',
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*', 'application/pdf'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  timestamps: true,
}
