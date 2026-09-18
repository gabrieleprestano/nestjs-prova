/**
 * Database module for setting up Drizzle ORM with Neon serverless database.
 */
import { Global, Module } from '@nestjs/common';

/**
 * Neon Database client and Drizzle ORM setup.
 */
import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleOrm } from 'drizzle-orm/neon-http';

/**
 * Database schema.
 */
import * as schema from './schema.js';

/**
 * Drizzle ORM provider injection token (it is used to inject the Drizzle ORM instance into other parts of the application).
 */
export const drizzle = "drizzle";

@Global() // This makes the DbModule globally available throughout the application
@Module({
    providers: [
        {
            provide: 'drizzle',
            useFactory: () => {
                const dbUrl = process.env.NEON_DB_URL;
                if (!dbUrl) throw new Error('NEON_DB_URL is not defined');

                const sql = neon(dbUrl);
                return drizzleOrm(sql, { schema });
            }
        },
    ],
    exports: ['drizzle'],
})
export class DbModule { }
