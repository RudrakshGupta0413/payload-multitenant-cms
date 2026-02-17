import { getPayload } from 'payload'
import config from '../src/payload.config'

async function createTestUser(tenantId: string) {
    process.env.FORCE_TENANT_ID = tenantId
    const payload = await getPayload({ config })

    const email = 'test@multi.tenant'
    const password = 'testpassword123'

    const existing = await payload.find({
        collection: 'users',
        where: { email: { equals: email } },
    })

    if (existing.totalDocs > 0) {
        console.log(`User already exists in ${tenantId}`)
        return
    }

    await payload.create({
        collection: 'users',
        data: {
            email,
            password,
            role: 'client-admin',
        },
    })
    console.log(`Created test user in ${tenantId}`)
}

async function run() {
    await createTestUser('client_a')
    await createTestUser('client_b')
    process.exit(0)
}

run()
