/*
resets the public schema in a PostgreSQL database
npx tsx scripts/reset-db.ts
*/



import 'dotenv/config';
import { sql } from '@vercel/postgres';

async function reset() {
  await sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_namespace WHERE nspname = 'public'
      ) THEN
        EXECUTE 'DROP SCHEMA public CASCADE';
      END IF;
    END
    $$;
  `;

  await sql`CREATE SCHEMA public;`;
  console.log('Schema "public" wurde erfolgreich zurückgesetzt.');
}

reset().catch((e) => {
  console.error('Fehler beim Zurücksetzen der Datenbank:', e);
});