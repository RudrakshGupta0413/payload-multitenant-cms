import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { LivePreviewPost } from '../../../../components/LivePreviewPost'
import '../../themes/misrut-theme.css'
import '../../themes/synrgy-theme.css'

interface PageProps {
    params: Promise<{
        slug: string
    }>
}

// Map tenant slug to collection slug
function getCollectionSlug(tenantSlug: string): 'misrut-blogs' | 'synrgy-blogs' {
    if (tenantSlug === 'misrut') return 'misrut-blogs'
    if (tenantSlug === 'synrgy') return 'synrgy-blogs'
    return 'misrut-blogs'
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params
    const headersList = await headers()
    const tenantSlug = headersList.get('x-tenant')

    if (!tenantSlug || (tenantSlug !== 'misrut' && tenantSlug !== 'synrgy')) {
        notFound()
    }

    const payload = await getPayload({ config: configPromise })
    const collectionSlug = getCollectionSlug(tenantSlug)

    const postsQuery = await payload.find({
        collection: collectionSlug,
        where: {
            slug: { equals: slug },
        },
    })

    const post = postsQuery.docs[0]
    if (!post) {
        notFound()
    }

    return (
        <>
            {/* LivePreviewPost handles real-time updates when loaded in admin iframe */}
            <LivePreviewPost initialData={post} tenantSlug={tenantSlug} />
        </>
    )
}
