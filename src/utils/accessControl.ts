import { Access } from 'payload'

export const isSuperAdminOrTenant = (tenantSlug: string): Access => async ({ req: { user, payload } }) => {
    if (!user) return false
    const u = user as any
    if (u.role === 'super-admin') return true
    if (!u.tenant) return false
    
    const tenantId = (u.tenant && typeof u.tenant === 'object') ? u.tenant.id : u.tenant
    const tenant = await payload.findByID({
        collection: 'tenants',
        id: tenantId,
    })
    
    return tenant?.slug === tenantSlug
}
