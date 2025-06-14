import { afterEach, beforeAll } from 'bun:test'
import { sql } from 'drizzle-orm'
import { db } from '~/db'
import { env } from '~/lib/env'
import { redis } from '~/redis'

async function cleanDatabase() {
	if (env.NODE_ENV !== 'test') return

	// Drop public + drizzle schemas
	await Promise.all([
		db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE`),
		db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`),
	])

	// Recreate public schema
	await db.execute(sql`CREATE SCHEMA public`)
}

async function cleanRedis() {
	if (env.NODE_ENV !== 'test') return

	// Delete all keys from Redis
	const keys = await redis.keys('*')
	await Promise.all(keys.map((key) => redis.del(key)))
}

async function truncateTables() {
	if (env.NODE_ENV !== 'test') return

	// Get all table names in public schema
	const { rows } = await db.execute<{ tablename: string }>(sql`
		SELECT tablename 
		FROM pg_tables 
		WHERE schemaname = 'public'
	`)
	if (rows.length === 0) return

	// Truncate all tables in public schema
	const tableNames = rows.map((table) => table.tablename).join(', ')
	await db.execute(sql.raw(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`))
}

beforeAll(async () => {
	// Clear out DB + Redis before all tests
	await Promise.all([cleanDatabase(), cleanRedis()])

	// Run DB migrations
	await Bun.spawn(['bun', 'run', 'migrate']).exited
})

afterEach(async () => {
	// Truncate tables + clean Redis between tests
	await Promise.all([truncateTables(), cleanRedis()])
})
