import type { CollectionConfig } from 'payload'

export const MisrutBlogs: CollectionConfig = {
    slug: 'misrut-blogs',
    labels: {
        singular: 'Misrut Blog',
        plural: 'Misrut Blogs',
    },
    admin: {
        useAsTitle: 'title',
        group: 'Blogs',
        defaultColumns: ['title', 'slug', 'sections', 'labels', 'updatedAt'],
        livePreview: {
            url: 'http://localhost:3001',
        },
    },
    access: {
        read: () => true,
        create: ({ req: { user } }) => !!user,
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => !!user,
    },
    hooks: {
        beforeChange: [
            async ({ data, req }) => {
                // Auto-assign Misrut tenant
                if (!data.tenant) {
                    const payload = req.payload
                    const tenants = await payload.find({
                        collection: 'tenants',
                        where: { slug: { equals: 'misrut' } },
                        limit: 1,
                    })
                    if (tenants.docs.length > 0) {
                        data.tenant = tenants.docs[0].id
                    }
                }
                return data
            },
        ],
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true,
        },
        {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
        },
        {
            name: 'content',
            type: 'richText',
        },
        {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
        },
        {
            name: 'tenant',
            type: 'relationship',
            relationTo: 'tenants',
            admin: {
                hidden: true,
            },
        },
        {
            name: 'sections',
            type: 'select',
            hasMany: true,
            admin: {
                position: 'sidebar',
            },
            options: [
                {
                    label: 'Featured Blog',
                    value: 'featured',
                },
                {
                    label: 'Latest Blog',
                    value: 'latest',
                },
                {
                    label: 'Editors Choice',
                    value: 'editors-choice',
                },
            ],
        },
        {
            name: 'labels',
            type: 'array',
            admin: {
                position: 'sidebar',
            },
            fields: [
                {
                    name: 'label',
                    type: 'text',
                    required: true,
                },
            ],
        },
    ],
}
