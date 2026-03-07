import type { CollectionConfig } from 'payload'

export const CourseCompletions: CollectionConfig = {
  slug: 'course-completions',
  dbName: 'course_completions',
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
      name: 'course_id',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
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
      name: 'quiz_score',
      type: 'number',
    },
  ],
  timestamps: true,
}
