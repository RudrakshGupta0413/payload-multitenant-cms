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

    // Check if already on a tenant route (e.g., /misrut/... or /synrgy/...)
    const tenantSlugs = ['misrut', 'synrgy']
    const firstSegment = pathname.split('/')[1]
    if (tenantSlugs.includes(firstSegment)) {
        return NextResponse.next()
    }

    // Read X-Tenant header injected by Nginx
    const tenant = request.headers.get('x-tenant')

    if (tenant && tenantSlugs.includes(tenant)) {
        // Rewrite root "/" or any path to "/<tenant>/..." 
        const url = request.nextUrl.clone()
        url.pathname = `/${tenant}${pathname}`
        return NextResponse.rewrite(url)
    }

    // No tenant header (direct access to port 3000) — show home page
    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
