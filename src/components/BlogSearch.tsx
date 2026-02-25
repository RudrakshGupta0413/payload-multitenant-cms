'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export const BlogSearch: React.FC = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()

    // Initial value from URL
    const [query, setQuery] = useState(searchParams.get('q') || '')

    // Keep state in sync with URL (e.g. if user hits back/forward)
    useEffect(() => {
        setQuery(searchParams.get('q') || '')
    }, [searchParams])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams(searchParams.toString())
        if (query.trim()) {
            params.set('q', query.trim())
        } else {
            params.delete('q')
        }
        router.push(`${pathname}?${params.toString()}`)
    }

    const clearSearch = () => {
        setQuery('')
        const params = new URLSearchParams(searchParams.toString())
        params.delete('q')
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    placeholder="Search blogs by title or content..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="search-input"
                />
                <button type="submit" className="search-button">
                    Search
                </button>
                {searchParams.get('q') && (
                    <button type="button" onClick={clearSearch} className="clear-search">
                        ✕
                    </button>
                )}
            </form>
        </div>
    )
}
