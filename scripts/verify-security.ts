import { getPayload } from 'payload'
import config from '../src/payload.config'

async function testTenant(tenantId: string) {
    process.env.FORCE_TENANT_ID = tenantId
    // We use a fresh payload instance to ensure it goes through the adapter.connect logic
    const payload = await getPayload({ config })

    const layouts = await payload.find({ collection: 'layouts', depth: 0, overrideAccess: true })
    const blogs = await payload.find({ collection: 'blogs', depth: 0, overrideAccess: true })

    return { layouts: layouts.totalDocs, blogs: blogs.totalDocs }
}

async function verify() {
    console.log('--- Verification: Physical Data Isolation ---')

    console.log('\nFetching for: client_a')
    const resA = await testTenant('client_a')
    console.log(`✅ Client A - Layouts: ${resA.layouts}, Blogs: ${resA.blogs}`)

    console.log('\nFetching for: client_b')
    const resB = await testTenant('client_b')
    console.log(`✅ Client B - Blogs: ${resB.blogs}, Layouts: ${resB.layouts}`)

    if (resA.layouts > 0 && resB.blogs > 0 && resA.blogs === 0 && resB.layouts === 0) {
        console.log('\n🏆 SUCCESS: Physical Isolation Verified.')
    } else {
        console.log('\n❌ FAILURE: Check data existence or connection switching logic.')
        console.log(`Debug Results: A(L:${resA.layouts}, B:${resA.blogs}) | B(L:${resB.layouts}, B:${resB.blogs})`)
    }

    process.exit(0)
}

verify()
