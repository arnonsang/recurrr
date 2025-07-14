import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// Support both local SQLite and Turso
const client = createClient({
	url: env.DATABASE_URL,
	authToken: env.DATABASE_TOKEN // Optional - used for Turso, ignored for local SQLite
});

export const db = drizzle(client, { schema });
