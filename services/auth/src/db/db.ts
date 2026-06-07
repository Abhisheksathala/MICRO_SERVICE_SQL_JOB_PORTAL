import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

export const sql = neon(process.env.URL as string);

if (!sql) {
    console.log('Database connection failed');
} else {
    console.log('Database connection successful');
}