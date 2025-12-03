import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create postgres client
const connectionString = process.env.POSTGRES_URL!;
const client = postgres(connectionString);

// Create Drizzle client
export const db = drizzle(client, { schema });

// Re-export schema for convenience
export * from './schema';
