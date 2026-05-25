import { neon } from '@neondatabase/serverless';

export const db = neon(import.meta.env.DB_URL);