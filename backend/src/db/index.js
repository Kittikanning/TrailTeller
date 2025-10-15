import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Create PostgreSQL connection
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10
});

// Create Drizzle instance
export const db = drizzle(client, { schema });

// Test connection
export async function testConnection() {
  try {
    await client`SELECT 1`;
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export default db;