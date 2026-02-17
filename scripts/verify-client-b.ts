import { getPayload } from 'payload'
import config from '../src/payload.config'

async function verify() {
    console.log(`[CLIENT_B] Initializing Payload...`)
    const payload = await getPayload({ config })

    try {
        const blogs = await payload.find({ collection: 'blogs', depth: 0, overrideAccess: true })
        console.log(`✅ [CLIENT_B] Access to Blogs: SUCCESS (Found ${blogs.totalDocs} docs)`)
    } catch (err) {
        console.log(`❌ [CLIENT_B] Access to Blogs: FAILED (${err.message})`)
    }

    try {
        // @ts-ignore
        await payload.find({ collection: 'layouts', depth: 0, overrideAccess: true })
        console.log(`❌ [CLIENT_B] Access to Layouts: SECURITY BREACH (Collection found)`)
    } catch (err) {
        console.log(`✅ [CLIENT_B] Access to Layouts: DENIED (Expected: ${err.message})`)
    }

    process.exit(0)
}

verify()
