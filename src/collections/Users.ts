import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'client-admin',
      options: [
        {
          label: 'Super Admin',
          value: 'super-admin',
        },
        {
          label: 'Client Admin',
          value: 'client-admin',
        },
      ],
    },
  ],
}
