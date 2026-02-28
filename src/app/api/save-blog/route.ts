import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { title, slug, content, tenants } = await request.json()

        // Basic validation
        if (!title || !slug || !content || !tenants || !Array.isArray(tenants) || tenants.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields: title, slug, content, and at least one tenant selection are required.' },
                { status: 400 },
            )
        }

        const payload = await getPayload({ config: configPromise })
        const results = []

        for (const tenantSlug of tenants) {
            // Determine target collection
            const collection = tenantSlug === 'misrut' ? 'misrut-blogs' : 'synrgy-blogs'

            // Create the blog post as a draft
            const newBlog = await payload.create({
                collection,
                data: {
                    title,
                    slug,
                    content,
                },
            })

            results.push({
                tenant: tenantSlug,
                collection,
                id: newBlog.id,
                editUrl: `http://localhost:3000/admin/collections/${collection}/${newBlog.id}`
            })
        }

        return NextResponse.json({
            message: `Successfully saved to ${results.length} website(s)!`,
            results,
        })
    } catch (error: any) {
        console.error('Save blog error:', error)

        // Handle duplicate slug errors from Payload/Postgres
        if (error?.message?.includes('slug') && error?.message?.includes('unique')) {
            return NextResponse.json(
                { error: 'A blog with this slug already exists. Please change the title or edit the existing blog.' },
                { status: 409 },
            )
        }

        return NextResponse.json(
            { error: error?.message || 'Failed to save blog to CMS. Please try again.' },
            { status: 500 },
        )
    }
}
