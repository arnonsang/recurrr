import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// Configure for either local SQLite or Turso
const dbCredentials = process.env.DATABASE_TOKEN
	? {
			// Turso configuration
			url: process.env.DATABASE_URL,
			authToken: process.env.DATABASE_TOKEN
	  }
	: {
			// Local SQLite configuration
			url: process.env.DATABASE_URL
	  };

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'sqlite',
	dbCredentials,
	verbose: true,
	strict: true
});
