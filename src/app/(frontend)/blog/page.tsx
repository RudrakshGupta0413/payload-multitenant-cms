import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { Media, MisrutBlog, SynrgyBlog } from '@/payload-types'
import { BlogSearch } from '@/components/BlogSearch'
import '../themes/misrut-theme.css'
import '../themes/synrgy-theme.css'
import '../themes/blog-listing.css'

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

export default async function BlogListingPage({
    searchParams: searchParamsPromise,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await searchParamsPromise
    const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : undefined

    const headersList = await headers()
    const tenantSlug = headersList.get('x-tenant')

    if (!tenantSlug || (tenantSlug !== 'misrut' && tenantSlug !== 'synrgy')) {
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

    const featuredPostsQuery = await payload.find({
        collection: collectionSlug,
        where: {
            sections: { equals: 'featured' },
        },
        sort: '-updatedAt',
        limit: 1,
    })

    const latestPostsQuery = await payload.find({
        collection: collectionSlug,
        where: {
            sections: { equals: 'latest' },
        },
        sort: '-updatedAt',
        limit: 4,
    })

    const editorsPicksQuery = await payload.find({
        collection: collectionSlug,
        where: {
            sections: { equals: 'editors-choice' },
        },
        sort: '-updatedAt',
        limit: 3,
    })

    const featuredPost = featuredPostsQuery.docs[0] as unknown as BlogType | undefined
    const latestPosts = latestPostsQuery.docs as unknown as BlogType[]
    const editorsPicks = editorsPicksQuery.docs as unknown as BlogType[]

    // Handle Search Results if a query is present
    let searchResults: BlogType[] = []
    if (searchQuery) {
        const searchResultsQuery = await payload.find({
            collection: collectionSlug,
            where: {
                title: { contains: searchQuery },
            },
            sort: '-updatedAt',
        })
        searchResults = searchResultsQuery.docs as unknown as BlogType[]
    }

    if (!searchQuery && !featuredPost && latestPosts.length === 0 && editorsPicks.length === 0) {
        return (
            <div className={`${tenantSlug} blog-page blog-listing-view`}>
                <div className="empty-state">
                    <h2>No posts yet</h2>
                    <p>Check back soon for new content!</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`${tenantSlug} blog-page blog-listing-view`}>

            <BlogSearch />

            {/* If searching, show only results */}
            {searchQuery ? (
                <section className="posts-section search-results">
                    <h2 className="section-heading">
                        {searchResults.length > 0
                            ? `Search results for "${searchQuery}"`
                            : `No results found for "${searchQuery}"`}
                    </h2>
                    {searchResults.length > 0 && (
                        <div className="posts-grid posts-grid-4">
                            {searchResults.map((post) => (
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
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
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
                                                {post.labels.length > 3 && <span className="label-more">+{post.labels.length - 3}</span>}
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
                    )}
                </section>
            ) : (
                <>
                    {/* Featured / Hero Blog */}
                    {featuredPost && (
                        <section className="featured-section">
                            <Link href={`/blog/${featuredPost.slug}`} className="featured-card">
                                <div className="featured-image-wrapper" style={{ position: 'relative' }}>
                                    {getImageUrl(featuredPost) ? (
                                        <Image
                                            src={getImageUrl(featuredPost)!}
                                            alt={featuredPost.title}
                                            fill
                                            className="featured-image"
                                            priority
                                            sizes="(max-width: 1200px) 100vw, 1200px"
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
                                    {featuredPost.labels && featuredPost.labels.length > 0 && (
                                        <div className="post-labels">
                                            {featuredPost.labels.map((item: { label: string }, i: number) => (
                                                <span key={i} className="blog-label">{item.label}</span>
                                            ))}
                                        </div>
                                    )}
                                    <span className="featured-readmore">Read more →</span>
                                </div>
                            </Link>
                        </section>
                    )}

                    {/* Latest Posts (4 in a row)  */}
                    {latestPosts.length > 0 && (
                        <section className="posts-section">
                            <h2 className="section-heading">Latest posts</h2>
                            <div className="posts-grid posts-grid-4">
                                {latestPosts.map((post) => (
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
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                                />
                                            ) : (
                                                <div className="post-card-image-placeholder" />
                                            )}
                                        </div>
                                        <div className="post-card-body">
                                            <h3 className="post-card-title">{post.title}</h3>
                                            {post.labels && post.labels.length > 0 && (
                                                <div className="post-labels">
                                                    {post.labels.slice(0, 3).map((item: { label: string }, i: number) => (
                                                        <span key={i} className="blog-label">{item.label}</span>
                                                    ))}
                                                    {post.labels.length > 3 && <span className="label-more">+{post.labels.length - 3}</span>}
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
                        </section>
                    )}

                    {/* Editor's Choice (3 in a row)  */}
                    {editorsPicks.length > 0 && (
                        <section className="posts-section">
                            <h2 className="section-heading">Editors Choice</h2>
                            <div className="posts-grid posts-grid-3">
                                {editorsPicks.map((post) => (
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
                                                    {post.labels.slice(0, 3).map((item: { label: string }, i: number) => (
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
                        </section>
                    )}

                    {!searchQuery && (
                        <p className="debug-info" style={{ textAlign: 'center', opacity: 0.2, fontSize: '0.8rem', marginTop: '4rem' }}>
                            Tenant: {tenantSlug} | Feed: {collectionSlug}
                        </p>
                    )}
                </>
            )}
        </div>
    )
}
