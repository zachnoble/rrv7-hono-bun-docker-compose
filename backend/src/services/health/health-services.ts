import { sql } from 'drizzle-orm'
import { db } from '~/db'
import { logger } from '~/lib/logger'
import { redis } from '~/redis'

export async function getHealth() {
	const timestamp = new Date().toISOString()
	const errors = []

	// Check if Postgres and Redis are reachable
	const [pgCheck, redisCheck] = await Promise.allSettled([
		db.execute(sql`SELECT 1`),
		redis.ping(),
	])

	if (pgCheck.status === 'rejected') {
		// PG is down
		logger.error(pgCheck.reason)
		errors.push('Postgres')
	}

	if (redisCheck.status === 'rejected') {
		// Redis is down
		logger.error(redisCheck.reason)
		errors.push('Redis')
	}

	if (errors.length > 0) {
		// Return a list of services that are down
		return {
			status: 500,
			message: `Unable to connect to: ${errors.join(', ')}`,
			timestamp,
		}
	}

	// All services are reachable
	return {
		status: 200,
		message: 'Service is running',
		timestamp,
	}
}
