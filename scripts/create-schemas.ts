import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:5432/multi-tenant-poc',
});

async function createSchemas() {
  try {
    await client.connect();
    console.log('Connected to database');

    const schemas = ['client_a', 'client_b'];

    for (const schema of schemas) {
      console.log(`Creating schema: ${schema}`);
      await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}";`);
    }

    // Note: Tables will be created by Payload on first access or migration
    // since we will be switching search_path dynamically.

    console.log('Schemas created successfully');
  } catch (err) {
    console.error('Error creating schemas:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createSchemas();
