'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Media, MisrutBlog, SynrgyBlog } from '@/payload-types'

type BlogType = MisrutBlog | SynrgyBlog

export const LivePreviewPost: React.FC<{
    initialData: BlogType
}> = ({ initialData }) => {
    // Determine the server URL dynamically if possible, or fallback to 3000
    const serverURL = typeof window !== 'undefined' && window.location.port !== '3000'
        ? `${window.location.protocol}//${window.location.hostname}:3000`
        : ''

    const { data } = useLivePreview<BlogType>({
        initialData,
        serverURL: serverURL || 'http://localhost:3000',
        depth: 2, // Increased depth for better nested field support
    })

    const [isIframe, setIsIframe] = React.useState(false)

    React.useEffect(() => {
        setIsIframe(window.self !== window.top)
    }, [])

    // Fallback to initialData if live preview data is not available yet or empty
    const activeData = data && Object.keys(data).length > 0 ? data : initialData
    const image = activeData?.image as Media | undefined

    return (
        <div className="blog-detail">
            {isIframe && (
                <div className="live-preview-nav" style={{ marginBottom: '2rem' }}>
                    <Link
                        href="/blog"
                        className="back-to-listing-btn"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            background: '#fff',
                            color: '#000',
                            textDecoration: 'none',
                            fontSize: '1.5rem',
                            fontWeight: '800',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                            border: '1px solid rgba(0,0,0,0.05)',
                        }}
                        onMouseOver={(e: React.MouseEvent<HTMLAnchorElement>) => {
                            e.currentTarget.style.transform = 'scale(1.05)'
                            e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.2)'
                        }}
                        onMouseOut={(e: React.MouseEvent<HTMLAnchorElement>) => {
                            e.currentTarget.style.transform = 'scale(1)'
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'
                        }}
                        title="Back to Blog Listing"
                    >
                        ←
                    </Link>
                </div>
            )}
            {/* Title — click to edit */}
            <h1
                data-live-preview-path="title"
                style={{ cursor: 'pointer' }}
                title="Click to edit title"
            >
                {activeData.title || 'Untitled Post'}
            </h1>

            {/* Image — click to edit */}
            {image?.url ? (
                <div
                    data-live-preview-path="image"
                    style={{ cursor: 'pointer', position: 'relative', width: '100%', height: '400px', marginBottom: '2rem' }}
                    title="Click to edit image"
                >
                    <Image
                        src={image.url}
                        alt={image.alt || activeData.title}
                        fill
                        className="hero-image"
                        style={{ objectFit: 'cover', borderRadius: '12px' }}
                    />
                </div>
            ) : (
                <div
                    data-live-preview-path="image"
                    className="image-placeholder"
                    style={{
                        cursor: 'pointer',
                        padding: '3rem',
                        textAlign: 'center',
                        borderRadius: '12px',
                        background: 'rgba(128,128,128,0.1)',
                        border: '2px dashed rgba(128,128,128,0.3)',
                        marginBottom: '2rem',
                    }}
                    title="Click to add an image"
                >
                    <p style={{ opacity: 0.5 }}>📷 Click to add a cover image</p>
                </div>
            )}

            {/* Labels — click to browse */}
            {activeData.labels && activeData.labels.length > 0 && (
                <div className="post-detail-labels">
                    {activeData.labels.map((item, i) => (
                        <a
                            key={i}
                            href={`/blog/label/${encodeURIComponent(item.label)}`}
                            className="blog-label-chip"
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            )}

            {/* Content — Lexical RichText — click to edit */}
            <div
                data-live-preview-path="content"
                className="content"
                style={{ cursor: 'text' }}
                title="Click to edit content"
            >
                {activeData.content ? (
                    <RichText data={activeData.content} />
                ) : (
                    <p style={{ opacity: 0.4, fontStyle: 'italic' }}>
                        Start typing in the editor to see your content here...
                    </p>
                )}
            </div>

            <p className="slug-info" style={{ marginTop: '2rem', fontSize: '0.85rem', opacity: 0.4 }}>
                Slug: {activeData.slug || '—'}
            </p>
        </div>
    )
}
