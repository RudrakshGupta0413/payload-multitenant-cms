import type { CollectionConfig } from 'payload'

export const SynrgyBlogs: CollectionConfig = {
    slug: 'synrgy-blogs',
    labels: {
        singular: 'Synrgy Blog',
        plural: 'Synrgy Blogs',
    },
    admin: {
        useAsTitle: 'title',
        group: 'Blogs',
        livePreview: {
            url: 'http://localhost:3002',
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
                // Auto-assign Synrgy tenant
                if (!data.tenant) {
                    const payload = req.payload
                    const tenants = await payload.find({
                        collection: 'tenants',
                        where: { slug: { equals: 'synrgy' } },
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
    ],
}
