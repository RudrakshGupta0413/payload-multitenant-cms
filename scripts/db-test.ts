import { Pool } from 'pg'

const config = {
    user: 'postgres',
    password: 'postgres',
    host: '127.0.0.1',
    port: 5432,
    database: 'multi-tenant-poc',
}

console.log('Testing connection with:', config)
const pool = new Pool(config)

async function test() {
    try {
        const res = await pool.query('SELECT NOW()')
        console.log('Success:', res.rows[0])
    } catch (err) {
        console.error('Failed:', err)
    } finally {
        await pool.end()
    }
}

test()
