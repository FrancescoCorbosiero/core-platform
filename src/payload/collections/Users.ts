import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  dbName: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (req.user) return { id: { equals: req.user.id } }
      return false
    },
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (req.user) return { id: { equals: req.user.id } }
      return false
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'nickname',
      type: 'text',
    },
    {
      name: 'first_name',
      type: 'text',
    },
    {
      name: 'last_name',
      type: 'text',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'address',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'b2c',
      options: [
        { label: 'B2C', value: 'b2c' },
        { label: 'B2B', value: 'b2b' },
        { label: 'HR', value: 'hr' },
        { label: 'Admin', value: 'admin' },
      ],
    },
    {
      name: 'company_id',
      type: 'relationship',
      relationTo: 'companies',
    },
    {
      name: 'plan',
      type: 'select',
      required: true,
      defaultValue: 'trial',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Base', value: 'base' },
        { label: 'Pro', value: 'pro' },
        { label: 'Trial', value: 'trial' },
      ],
    },
    {
      name: 'trial_started_at',
      type: 'date',
    },
    {
      name: 'trial_ends_at',
      type: 'date',
    },
    {
      name: 'plan_expires_at',
      type: 'date',
    },
    {
      name: 'stripe_customer_id',
      type: 'text',
    },
    {
      name: 'stripe_subscription_id',
      type: 'text',
    },
    {
      name: 'referral_code',
      type: 'text',
      unique: true,
      index: true,
    },
    {
      name: 'last_login_at',
      type: 'date',
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  timestamps: true,
}
