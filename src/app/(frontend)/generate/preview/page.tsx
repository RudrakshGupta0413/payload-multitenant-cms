'use client'

import React, { useEffect, useState } from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import '../generate.css'
import '../../themes/misrut-theme.css'

interface GeneratedBlog {
    title: string
    slug: string
    content: any
}

export default function PreviewPage() {
    const [blog, setBlog] = useState<GeneratedBlog | null>(null)
    const [copySuccess, setCopySuccess] = useState(false)
    const [selectedTenants, setSelectedTenants] = useState<string[]>(['misrut'])
    const [saving, setSaving] = useState(false)
    const [saveResult, setSaveResult] = useState<{ message: string; results: { tenant: string; editUrl: string }[] } | null>(null)
    const [saveError, setSaveError] = useState('')

    useEffect(() => {
        const stored = sessionStorage.getItem('generated-blog')
        if (stored) {
            try {
                setBlog(JSON.parse(stored))
            } catch {
                setBlog(null)
            }
        }
    }, [])

    const toggleTenant = (tenant: string) => {
        setSaveResult(null)
        setSelectedTenants(prev =>
            prev.includes(tenant)
                ? prev.filter(t => t !== tenant)
                : [...prev, tenant]
        )
    }

    const handleSaveToCMS = async () => {
        if (!blog || selectedTenants.length === 0) return
        setSaving(true)
        setSaveError('')
        setSaveResult(null)

        try {
            const res = await fetch('/api/save-blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: blog.title,
                    slug: blog.slug,
                    content: blog.content,
                    tenants: selectedTenants
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setSaveError(data.error || 'Failed to save to CMS')
            } else {
                setSaveResult(data)
            }
        } catch {
            setSaveError('Network error. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleCopyJSON = async () => {
        if (!blog) return
        try {
            await navigator.clipboard.writeText(JSON.stringify(blog.content, null, 2))
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 2000)
        } catch {
            // Fallback for non-HTTPS
            const textArea = document.createElement('textarea')
            textArea.value = JSON.stringify(blog.content, null, 2)
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 2000)
        }
    }

    if (!blog) {
        return (
            <div
                className="generate-page"
                style={{
                    flexDirection: 'column',
                    gap: '1.5rem',
                }}
            >
                <p style={{ fontSize: '1.2rem', color: '#888' }}>
                    No generated blog found.
                </p>
                <Link
                    href="/generate"
                    style={{
                        color: '#a78bfa',
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                    }}
                >
                    ← Go back and generate one
                </Link>
            </div>
        )
    }

    return (
        <div className="generate-preview-page">
            {/* Top Bar */}
            <div className="generate-preview-header">
                <div className="generate-preview-actions">
                    <Link href="/generate">← Generate Another</Link>
                    <button
                        onClick={handleCopyJSON}
                        className={copySuccess ? 'copy-success' : ''}
                    >
                        {copySuccess ? '✓ Copied!' : '📋 Copy JSON'}
                    </button>
                </div>

                {/* Save to CMS Control Panel */}
                <div className="save-controls">
                    <div className="tenant-checkboxes">
                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                checked={selectedTenants.includes('misrut')}
                                onChange={() => toggleTenant('misrut')}
                                disabled={saving || !!saveResult}
                            />
                            <span>Misrut</span>
                        </label>
                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                checked={selectedTenants.includes('synrgy')}
                                onChange={() => toggleTenant('synrgy')}
                                disabled={saving || !!saveResult}
                            />
                            <span>Synrgy</span>
                        </label>
                    </div>

                    <button
                        className={`save-cms-btn ${saveResult ? 'success' : ''}`}
                        onClick={handleSaveToCMS}
                        disabled={saving || !!saveResult || selectedTenants.length === 0}
                    >
                        {saving ? 'Saving...' : saveResult ? '✓ Saved!' : '💾 Save to CMS'}
                    </button>
                </div>
            </div>

            <main className="misrut blog-detail-view">
                <div className="blog-detail">
                    {saveError && <div className="generate-error" style={{ marginBottom: '1rem' }}>{saveError}</div>}

                    {saveResult && (
                        <div className="edit-link-banner">
                            🎉 {saveResult.message} <br />
                            <div className="results-list">
                                {saveResult.results.map(res => (
                                    <div key={res.tenant} className="result-link">
                                        <strong>{res.tenant === 'misrut' ? 'Misrut' : 'Synrgy'}:</strong>{' '}
                                        <a href={res.editUrl} target="_blank" rel="noopener noreferrer">
                                            Edit in Admin Panel →
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <h1>{blog.title}</h1>

                    {/* Placeholder for image — user can add later */}
                    <div
                        style={{
                            padding: '3rem',
                            textAlign: 'center',
                            borderRadius: '12px',
                            background: 'rgba(128,128,128,0.06)',
                            border: '2px dashed rgba(128,128,128,0.2)',
                            marginBottom: '2rem',
                            color: '#999',
                        }}
                    >
                        <p>📷 Image can be uploaded when saving to CMS</p>
                    </div>

                    {/* Rich Text Content */}
                    <div className="content">
                        {blog.content ? (
                            <RichText data={blog.content} />
                        ) : (
                            <p style={{ opacity: 0.4, fontStyle: 'italic' }}>
                                No content was generated.
                            </p>
                        )}
                    </div>

                    <p
                        className="slug-info"
                        style={{ marginTop: '2rem', fontSize: '0.85rem', opacity: 0.4 }}
                    >
                        Slug: {blog.slug || '—'}
                    </p>
                </div>
            </main>
        </div>
    )
}
