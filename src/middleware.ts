import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip admin, API, static assets, and Next.js internals
    if (
        pathname.startsWith('/admin') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/media') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    // If already on /blog route, pass through
    if (pathname.startsWith('/blog')) {
        return NextResponse.next()
    }

    // Read X-Tenant header injected by Nginx
    const tenantSlugs = ['misrut', 'synrgy']
    const tenant = request.headers.get('x-tenant')

    if (tenant && tenantSlugs.includes(tenant)) {
        // Rewrite root "/" to "/blog" (blog listing page)
        const url = request.nextUrl.clone()
        if (pathname === '/') {
            url.pathname = '/blog'
        } else {
            // For any other path, rewrite to /blog/... 
            url.pathname = `/blog${pathname}`
        }
        return NextResponse.rewrite(url)
    }

    // No tenant header (direct access to port 3000) — show home page
    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
