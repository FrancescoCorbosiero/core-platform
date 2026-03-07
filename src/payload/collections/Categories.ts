import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  dbName: 'categories',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'image_url',
      type: 'text',
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
