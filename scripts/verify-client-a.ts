import { getPayload } from 'payload'
import config from '../src/payload.config'

async function verify() {
    console.log(`[CLIENT_A] Initializing Payload...`)
    const payload = await getPayload({ config })

    try {
        const layouts = await payload.find({ collection: 'layouts', depth: 0, overrideAccess: true })
        console.log(`✅ [CLIENT_A] Access to Layouts: SUCCESS (Found ${layouts.totalDocs} docs)`)
    } catch (err) {
        console.log(`❌ [CLIENT_A] Access to Layouts: FAILED (${err.message})`)
    }

    try {
        // @ts-ignore
        await payload.find({ collection: 'blogs', depth: 0, overrideAccess: true })
        console.log(`❌ [CLIENT_A] Access to Blogs: SECURITY BREACH (Collection found)`)
    } catch (err) {
        console.log(`✅ [CLIENT_A] Access to Blogs: DENIED (Expected: ${err.message})`)
    }

    process.exit(0)
}

verify()
