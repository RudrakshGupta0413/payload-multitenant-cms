import { execSync } from 'child_process'

const schemas = ['client_a', 'client_b']
const dbName = 'multi-tenant-poc'

console.log('--- Multi-Tenant Schema Structure Cloning ---')

for (const schema of schemas) {
    console.log(`\nProcessing schema: ${schema}...`)

    // 1. Create schema and reset it
    execSync(`psql -U postgres -d ${dbName} -c "DROP SCHEMA IF EXISTS ${schema} CASCADE; CREATE SCHEMA ${schema};"`, { stdio: 'inherit' })

    // 2. Create a temporary SQL file with the schema name substituted
    const tempSql = `scripts/clone_${schema}.sql`
    execSync(`sed "s/{{SCHEMA}}/${schema}/g" scripts/clone_schema.template.sql > ${tempSql}`)

    // 3. Clone structure using the generated SQL file
    execSync(`psql -U postgres -d ${dbName} -v ON_ERROR_STOP=1 -f ${tempSql}`, { stdio: 'inherit' })

    console.log(`Successfully cloned structure to ${schema}`)
}

console.log('\n--- Initialization Complete ---')
