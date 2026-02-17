import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import '../themes/misrut-theme.css'
import '../themes/synrgy-theme.css'
import '../themes/blog-listing.css'

interface PageProps {
    params: Promise<{
        tenant: string
    }>
}

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

function getImageUrl(post: any): string | null {
    if (post.image && typeof post.image === 'object' && 'url' in post.image) {
        return post.image.url || null
    }
    return null
}

export default async function TenantBlogListing({ params }: PageProps) {
    const { tenant: tenantSlug } = await params

    if (tenantSlug !== 'misrut' && tenantSlug !== 'synrgy') {
        notFound()
    }

    const payload = await getPayload({ config: configPromise })
    const collectionSlug = getCollectionSlug(tenantSlug)

    const tenantQuery = await payload.find({
        collection: 'tenants',
        where: { slug: { equals: tenantSlug } },
    })
    const tenant = tenantQuery.docs[0]
    if (!tenant) notFound()

    const postsQuery = await payload.find({
        collection: collectionSlug,
        sort: '-createdAt',
        limit: 20,
    })

    const allPosts = postsQuery.docs

    if (allPosts.length === 0) {
        return (
            <div className={`${tenantSlug} blog-page`}>
                <div className="empty-state">
                    <h2>No posts yet</h2>
                    <p>Check back soon for new content!</p>
                </div>
            </div>
        )
    }

    // Split posts into sections
    const featuredPost = allPosts[0]
    const latestPosts = allPosts.slice(1, 5)    // Next 4 posts
    const editorsPicks = allPosts.slice(5, 8)   // Next 3 posts

    return (
        <div className={`${tenantSlug} blog-page`}>

            {/* ─── Featured / Hero Blog ─── */}
            <section className="featured-section">
                <Link href={`/${tenantSlug}/${featuredPost.slug}`} className="featured-card">
                    <div className="featured-image-wrapper">
                        {getImageUrl(featuredPost) ? (
                            <img
                                src={getImageUrl(featuredPost)!}
                                alt={featuredPost.title}
                                className="featured-image"
                            />
                        ) : (
                            <div className="featured-image-placeholder" />
                        )}
                    </div>
                    <div className="featured-content">
                        <span className="featured-badge">Featured</span>
                        <h1 className="featured-title">{featuredPost.title}</h1>
                        <p className="featured-meta">{formatDate(featuredPost.createdAt)}</p>
                        <p className="featured-excerpt">
                            Click to read the full article — discover insights, tips, and updates from our team.
                        </p>
                        <span className="featured-readmore">Read more →</span>
                    </div>
                </Link>
            </section>

            {/* ─── Latest Posts (4 in a row) ─── */}
            {latestPosts.length > 0 && (
                <section className="posts-section">
                    <h2 className="section-heading">Latest posts</h2>
                    <div className="posts-grid posts-grid-4">
                        {latestPosts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/${tenantSlug}/${post.slug}`}
                                className="post-card"
                            >
                                <div className="post-card-image-wrapper">
                                    {getImageUrl(post) ? (
                                        <img
                                            src={getImageUrl(post)!}
                                            alt={post.title}
                                            className="post-card-image"
                                        />
                                    ) : (
                                        <div className="post-card-image-placeholder" />
                                    )}
                                </div>
                                <div className="post-card-body">
                                    <h3 className="post-card-title">{post.title}</h3>
                                    <div className="post-card-footer">
                                        <span className="post-card-date">{formatDate(post.createdAt)}</span>
                                        <span className="post-card-readmore">Read more →</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* ─── Editor's Choice (3 in a row) ─── */}
            {editorsPicks.length > 0 && (
                <section className="posts-section">
                    <h2 className="section-heading">Editors Choice</h2>
                    <div className="posts-grid posts-grid-3">
                        {editorsPicks.map((post) => (
                            <Link
                                key={post.id}
                                href={`/${tenantSlug}/${post.slug}`}
                                className="post-card"
                            >
                                <div className="post-card-image-wrapper">
                                    {getImageUrl(post) ? (
                                        <img
                                            src={getImageUrl(post)!}
                                            alt={post.title}
                                            className="post-card-image"
                                        />
                                    ) : (
                                        <div className="post-card-image-placeholder" />
                                    )}
                                </div>
                                <div className="post-card-body">
                                    <h3 className="post-card-title">{post.title}</h3>
                                    <div className="post-card-footer">
                                        <span className="post-card-date">{formatDate(post.createdAt)}</span>
                                        <span className="post-card-readmore">Read more →</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

        </div>
    )
}
