'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import React, { useCallback } from 'react'

export const LivePreviewPost: React.FC<{
    initialData: any
    tenantSlug: string
}> = ({ initialData, tenantSlug }) => {
    const { data } = useLivePreview({
        initialData,
        serverURL: 'http://localhost:3000',
        depth: 2,
    })

    // Click-to-edit: send postMessage to admin panel to focus the corresponding field
    const handleFieldClick = useCallback((fieldName: string) => {
        if (typeof window !== 'undefined' && window.parent !== window) {
            window.parent.postMessage(
                {
                    type: 'payload-live-preview',
                    action: 'field-focus',
                    field: fieldName,
                },
                'http://localhost:3000'
            )
        }
    }, [])

    return (
        <div className={tenantSlug}>
            <div className="blog-detail">
                {/* Title — click to edit */}
                <h1
                    data-field="title"
                    onClick={() => handleFieldClick('title')}
                    style={{ cursor: 'pointer' }}
                    title="Click to edit title"
                >
                    {data.title || 'Untitled Post'}
                </h1>

                {/* Image — click to edit */}
                {data?.image && typeof data.image === 'object' && (data.image as any).url ? (
                    <div
                        data-field="image"
                        onClick={() => handleFieldClick('image')}
                        style={{ cursor: 'pointer' }}
                        title="Click to edit image"
                    >
                        <img
                            src={(data.image as any).url}
                            alt={(data.image as any).alt || data.title}
                            className="hero-image"
                        />
                    </div>
                ) : (
                    <div
                        data-field="image"
                        onClick={() => handleFieldClick('image')}
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

                {/* Content — Lexical RichText — click to edit */}
                <div
                    data-field="content"
                    onClick={() => handleFieldClick('content')}
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
        </div>
    )
}
