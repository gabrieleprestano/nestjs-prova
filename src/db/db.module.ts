/**
 * Database module for setting up Drizzle ORM with Neon serverless database.
 */
import { Global, Module } from '@nestjs/common';

/**
 * Neon Database client with WebSockets and Drizzle ORM setup.
 */
import { neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle as drizzleOrm } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

/**
 * Database schema.
 */
import * as schema from './schema.js';

/**
 * Drizzle ORM provider injection token.
 */
export const drizzle = 'drizzle';

@Global()
@Module({
    providers: [
        {
            provide: drizzle,
            useFactory: () => {
                const dbUrl = process.env.NEON_DB_URL;
                if (!dbUrl) throw new Error('NEON_DB_URL is not defined');

                neonConfig.webSocketConstructor = ws;

                // Setting up the connection pool for the Neon database with WebSocket support
                const pool = new Pool({
                    connectionString: dbUrl,
                });

                return drizzleOrm(pool, { schema });
            },
        },
    ],
    exports: [drizzle],
})
export class DbModule { }