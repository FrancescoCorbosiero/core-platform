import type { CollectionConfig } from 'payload'

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  dbName: 'coupons',
  admin: {
    useAsTitle: 'code',
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
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'stripe_coupon_id',
      type: 'text',
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Percentage', value: 'percentage' },
        { label: 'Fixed', value: 'fixed' },
      ],
    },
    {
      name: 'value',
      type: 'number',
      required: true,
    },
    {
      name: 'expires_at',
      type: 'date',
    },
    {
      name: 'max_uses_total',
      type: 'number',
    },
    {
      name: 'max_uses_per_user',
      type: 'number',
    },
    {
      name: 'uses_count',
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
