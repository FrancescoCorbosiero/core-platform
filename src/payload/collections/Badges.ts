import type { CollectionConfig } from 'payload'

export const Badges: CollectionConfig = {
  slug: 'badges',
  dbName: 'badges',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: ({ req }) => !!req.user,
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
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'image_url',
      type: 'text',
    },
    {
      name: 'condition_type',
      type: 'select',
      options: [
        { label: 'Registration', value: 'registration' },
        { label: 'Video Count', value: 'video_count' },
        { label: 'Quiz Count', value: 'quiz_count' },
        { label: 'Course', value: 'course' },
        { label: 'Review', value: 'review' },
        { label: 'Tool', value: 'tool' },
        { label: 'Referral', value: 'referral' },
      ],
    },
    {
      name: 'condition_value',
      type: 'number',
    },
  ],
  timestamps: true,
}
