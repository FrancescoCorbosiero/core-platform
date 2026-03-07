import type { CollectionConfig } from 'payload'

export const Questions: CollectionConfig = {
  slug: 'questions',
  dbName: 'questions',
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
      name: 'quiz_id',
      type: 'relationship',
      relationTo: 'quizzes',
      required: true,
    },
    {
      name: 'text',
      type: 'text',
      required: true,
    },
    {
      name: 'sort_order',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'randomize_options',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  timestamps: true,
}
