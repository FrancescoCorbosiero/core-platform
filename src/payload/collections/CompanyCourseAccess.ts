import type { CollectionConfig } from 'payload'

export const CompanyCourseAccess: CollectionConfig = {
  slug: 'company-course-access',
  dbName: 'company_course_access',
  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'company_id',
      type: 'relationship',
      relationTo: 'companies',
      required: true,
    },
    {
      name: 'course_id',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  timestamps: true,
}
