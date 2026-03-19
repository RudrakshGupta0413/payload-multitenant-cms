import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (!user) return false
      const u = user as any
      if (u.role === 'super-admin') return true
      if (!u.tenant) return false
      return {
        tenant: {
          equals: typeof u.tenant === 'object' ? u.tenant.id : u.tenant,
        },
      }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      const u = user as any
      if (u.role === 'super-admin') return true
      if (!u.tenant) return false
      return {
        tenant: {
          equals: typeof u.tenant === 'object' ? u.tenant.id : u.tenant,
        },
      }
    },
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
