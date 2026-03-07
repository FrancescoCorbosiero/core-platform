import type { CollectionConfig } from 'payload'

export const Quizzes: CollectionConfig = {
  slug: 'quizzes',
  dbName: 'quizzes',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (req.user) return { is_active: { equals: true } }
      return false
    },
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'pill_id',
      type: 'relationship',
      relationTo: 'pills',
    },
    {
      name: 'course_id',
      type: 'relationship',
      relationTo: 'courses',
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Pill Quiz', value: 'pill_quiz' },
        { label: 'Course Final', value: 'course_final' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'randomize_questions',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  timestamps: true,
}
