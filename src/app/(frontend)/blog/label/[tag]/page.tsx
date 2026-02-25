import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { Media, MisrutBlog, SynrgyBlog } from '@/payload-types'
import '../../../themes/misrut-theme.css'
import '../../../themes/synrgy-theme.css'
import '../../../themes/blog-listing.css'

type BlogType = MisrutBlog | SynrgyBlog

function getCollectionSlug(tenantSlug: string): 'misrut-blogs' | 'synrgy-blogs' {
    if (tenantSlug === 'misrut') return 'misrut-blogs'
    if (tenantSlug === 'synrgy') return 'synrgy-blogs'
    return 'misrut-blogs'
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

function getImageUrl(post: BlogType): string | null {
    if (post.image && typeof post.image === 'object' && 'url' in post.image) {
        return (post.image as Media).url || null
    }
    return null
}

export default async function LabelResultsPage({
    params: paramsPromise,
}: {
    params: Promise<{ tag: string }>
}) {
    const { tag: rawTag } = await paramsPromise
    const tag = decodeURIComponent(rawTag)

    const headersList = await headers()
    const tenantSlug = headersList.get('x-tenant')

    if (!tenantSlug || (tenantSlug !== 'misrut' && tenantSlug !== 'synrgy')) {
        notFound()
    }

    const payload = await getPayload({ config: configPromise })
    const collectionSlug = getCollectionSlug(tenantSlug)

    // Query blogs that have this label
    const results = await payload.find({
        collection: collectionSlug,
        where: {
            'labels.label': {
                equals: tag,
            },
        },
        sort: '-updatedAt',
    })

    const posts = results.docs as unknown as BlogType[]

    // --- Dynamic Label Navigation Logic ---
    const allPostsForTenant = await payload.find({
        collection: collectionSlug,
        depth: 0,
        limit: 1000,
        select: {
            labels: true
        }
    })

    const labelCountMap: Record<string, number> = {}
    allPostsForTenant.docs.forEach((doc: { labels?: { label: string }[] | null | string[] }) => {
        if (doc.labels && Array.isArray(doc.labels)) {
            doc.labels.forEach((l) => {
                if (typeof l === 'object' && l !== null && 'label' in l) {
                    const name = l.label
                    labelCountMap[name] = (labelCountMap[name] || 0) + 1
                }
            })
        }
    })

    const sortedLabels = [tag, ...Object.keys(labelCountMap)
        .filter(l => l !== tag)
        .sort((a, b) => labelCountMap[b] - labelCountMap[a])]

    return (
        <div className={`${tenantSlug} blog-page blog-listing-view label-results-page`}>

            {/* Medium-style Topic Navigation */}
            <div className="topic-nav-container">
                <div className="topic-nav-scroll">
                    <Link href="/blog" className="topic-nav-item explore">
                        <span className="topic-icon">🧭</span> Explore
                    </Link>
                    {sortedLabels.map((topic) => (
                        <Link
                            key={topic}
                            href={`/blog/label/${encodeURIComponent(topic)}`}
                            className={`topic-nav-item ${topic === tag ? 'active' : ''}`}
                        >
                            {topic} {topic !== tag && <span className="label-count-tiny">({labelCountMap[topic] || 0})</span>}
                        </Link>
                    ))}
                </div>
            </div>

            <header className="label-page-header">
                <h1 className="label-title">{tag}</h1>
                <p className="label-subtitle">
                    {posts.length} {posts.length === 1 ? 'article' : 'articles'} in this topic
                </p>
            </header>

            <section className="posts-section">
                {posts.length > 0 ? (
                    <div className="posts-grid posts-grid-3">
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/blog/${post.slug}`}
                                className="post-card"
                            >
                                <div className="post-card-image-wrapper" style={{ position: 'relative' }}>
                                    {getImageUrl(post) ? (
                                        <Image
                                            src={getImageUrl(post)!}
                                            alt={post.title}
                                            fill
                                            className="post-card-image"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                        />
                                    ) : (
                                        <div className="post-card-image-placeholder" />
                                    )}
                                </div>
                                <div className="post-card-body">
                                    <h3 className="post-card-title">{post.title}</h3>
                                    {post.labels && post.labels.length > 0 && (
                                        <div className="post-labels">
                                            {post.labels.slice(0, 3).map((item, i) => (
                                                <span key={i} className="blog-label">{item.label}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="post-card-footer">
                                        <span className="post-card-date">{formatDate(post.createdAt)}</span>
                                        <span className="post-card-readmore">Read more →</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <h2>No posts found</h2>
                        <p>We couldn&apos;t find any articles labeled with &quot;{tag}&quot;.</p>
                        <Link href="/blog" className="back-link">Return to blog</Link>
                    </div>
                )}
            </section>
        </div>
    )
}
