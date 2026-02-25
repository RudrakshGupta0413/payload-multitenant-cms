'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
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
        depth: 1, // Match the default payload.find depth to avoid mergeData TypeErrors
    })

    const image = data?.image as Media | undefined

    return (
        <div className="blog-detail">
            {/* Title — click to edit */}
            <h1
                data-live-preview-path="title"
                style={{ cursor: 'pointer' }}
                title="Click to edit title"
            >
                {data.title || 'Untitled Post'}
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
                        alt={image.alt || data.title}
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
            {data.labels && data.labels.length > 0 && (
                <div className="post-detail-labels">
                    {data.labels.map((item, i) => (
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
                {data.content ? (
                    <RichText data={data.content} />
                ) : (
                    <p style={{ opacity: 0.4, fontStyle: 'italic' }}>
                        Start typing in the editor to see your content here...
                    </p>
                )}
            </div>

            <p className="slug-info" style={{ marginTop: '2rem', fontSize: '0.85rem', opacity: 0.4 }}>
                Slug: {data.slug || '—'}
            </p>
        </div>
    )
}
