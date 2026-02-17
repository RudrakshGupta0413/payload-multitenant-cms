import type { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
    slug: 'tenants',
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'domain', 'slug'],
    },
    access: {
        read: () => true,
        create: ({ req: { user } }) => !!user,
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => !!user,
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true,
        },
        {
            name: 'domain',
            type: 'text',
            unique: true,
            required: true,
        },
        {
            name: 'slug',
            type: 'text',
            unique: true,
            required: true,
        },
    ],
}
