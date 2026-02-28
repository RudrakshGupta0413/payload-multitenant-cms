'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import './generate.css'

const LOADING_MESSAGES = [
    'Understanding your prompt...',
    'Researching the topic...',
    'Drafting the introduction...',
    'Writing main sections...',
    'Adding details and depth...',
    'Polishing the conclusion...',
    'Formatting for display...',
]

export default function GeneratePage() {
    const router = useRouter()
    const [prompt, setPrompt] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [loadingMsgIndex, setLoadingMsgIndex] = useState(0)

    // Cycle loading messages
    React.useEffect(() => {
        if (!loading) return
        const interval = setInterval(() => {
            setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [loading])

    const handleGenerate = async () => {
        if (!prompt.trim()) return

        setLoading(true)
        setError('')
        setLoadingMsgIndex(0)

        try {
            const res = await fetch('/api/generate-blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt.trim() }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Something went wrong. Please try again.')
                setLoading(false)
                return
            }

            // Store the generated blog in sessionStorage for the preview page
            sessionStorage.setItem('generated-blog', JSON.stringify(data))

            // Navigate to the preview page
            router.push('/generate/preview')
        } catch (err) {
            console.error('Generate error:', err)
            setError('Network error. Please check your connection and try again.')
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleGenerate()
        }
    }

    return (
        <div className="generate-page">
            <Link href="/" className="generate-back-link">
                ← Back to Home
            </Link>

            <div className="generate-container">
                <h1>Generate a Blog Post</h1>
                <p className="subtitle">
                    Describe the topic you want to write about, and AI will craft a
                    fully-formatted blog post for you.
                </p>

                <div className="generate-input-area">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. Write a detailed blog about how AI is transforming employee engagement in modern workplaces..."
                        disabled={loading}
                    />
                    <div className="generate-input-footer">
                        <span className="generate-char-count">{prompt.length} characters</span>
                        <button
                            className="generate-send-btn"
                            onClick={handleGenerate}
                            disabled={loading || !prompt.trim()}
                        >
                            {loading ? 'Generating...' : 'Generate'}
                            <span className="btn-icon">{loading ? '⏳' : '→'}</span>
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="generate-loading">
                        <div className="generate-spinner" />
                        <p className="generate-loading-text">
                            {LOADING_MESSAGES[loadingMsgIndex]}
                        </p>
                    </div>
                )}

                {error && <div className="generate-error">{error}</div>}

                <p
                    style={{
                        marginTop: '2rem',
                        fontSize: '0.75rem',
                        color: '#444',
                    }}
                >
                    Press <strong>Ctrl + Enter</strong> to generate
                </p>
            </div>
        </div>
    )
}
