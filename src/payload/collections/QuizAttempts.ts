import type { CollectionConfig } from 'payload'

export const QuizAttempts: CollectionConfig = {
  slug: 'quiz-attempts',
  dbName: 'quiz_attempts',
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
      name: 'quiz_id',
      type: 'relationship',
      relationTo: 'quizzes',
      required: true,
    },
    {
      name: 'score_percentage',
      type: 'number',
    },
    {
      name: 'passed',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'answers',
      type: 'json',
    },
    {
      name: 'attempted_at',
      type: 'date',
    },
  ],
  timestamps: true,
}
