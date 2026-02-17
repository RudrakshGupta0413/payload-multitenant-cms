import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
    },
  ],
  upload: true,
}
