import type { CollectionConfig } from 'payload'

export const Companies: CollectionConfig = {
  slug: 'companies',
  dbName: 'companies',
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
      name: 'vat_number',
      type: 'text',
    },
    {
      name: 'sdi_code',
      type: 'text',
    },
    {
      name: 'contract_start',
      type: 'date',
    },
    {
      name: 'contract_end',
      type: 'date',
    },
    {
      name: 'session_credits',
      type: 'number',
    },
    {
      name: 'session_credits_used',
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
