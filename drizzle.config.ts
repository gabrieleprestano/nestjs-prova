/**
 * Environment Variables
 */
import dotenv from 'dotenv';
dotenv.config();

/**
 * Drizzle Kit Configuration
 */
import { defineConfig } from "drizzle-kit";
import 'dotenv/config';

const dbUrl = process.env.NEON_DB_URL;

if (!dbUrl) {
    throw new Error('There was an error retrieving the NEON_DB_URL from the environment variables. Please make sure it\'s defined in the .env file.');
}

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './src/db/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: dbUrl,
    },
});