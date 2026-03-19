import type { CollectionConfig } from 'payload'
import { isSuperAdminOrTenant } from '../utils/accessControl'

export const SynrgyBlogs: CollectionConfig = {
    slug: 'synrgy-blogs',
    labels: {
        singular: 'Synrgy Blog',
        plural: 'Synrgy Blogs',
    },
    admin: {
        useAsTitle: 'title',
        group: 'Blogs',
        defaultColumns: ['title', 'slug', 'sections', 'labels', 'updatedAt'],
        livePreview: {
            url: ({ data }) => `http://localhost:3002/blog/${data.slug}`,
        },
    },
    access: {
        read: () => true,
        create: isSuperAdminOrTenant('synrgy'),
        update: isSuperAdminOrTenant('synrgy'),
        delete: isSuperAdminOrTenant('synrgy'),
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
