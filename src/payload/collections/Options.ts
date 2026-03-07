import type { CollectionConfig } from 'payload'

export const Options: CollectionConfig = {
  slug: 'options',
  dbName: 'options',
  admin: {
    useAsTitle: 'text',
  },
  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'question_id',
      type: 'relationship',
      relationTo: 'questions',
      required: true,
    },
    {
      name: 'text',
      type: 'text',
      required: true,
    },
    {
      name: 'subtext',
      type: 'text',
    },
    {
      name: 'is_correct',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'sort_order',
      type: 'number',
      defaultValue: 0,
    },
  ],
  timestamps: true,
}
