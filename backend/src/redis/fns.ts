import { ZodError, type ZodType } from 'zod'
import { client } from './client'

const DEFAULT_TTL_IN_SECONDS = 3600 // 1 hour

/**
 * Set a key and value
 */
export async function set(key: string, value: unknown, ttlInSeconds = DEFAULT_TTL_IN_SECONDS) {
	// If the value is null or undefined, do nothing
	if (value === null || value === undefined) return

	// Set the value in Redis
	return await client.set(key, JSON.stringify(value), 'EX', ttlInSeconds)
}

/**
 * Get a key and return the value
 */
export async function get<T>(key: string) {
	// Get the value from Redis
	const value = await client.get(key)

	// If the value is not found, return null
	if (!value) return null

	// Convert the value to an object
	return JSON.parse(value) as T
}

/**
 * Get a key and parse it using the provided Zod schema
 */
export async function getWithSchema<T extends ZodType>(key: string, schema: ZodType<T>) {
	// Get the value from Redis
	const value = await client.get(key)

	// If the value is not found, return null
	if (!value) return null

	try {
		// Convert the value to an object
		const parsed = JSON.parse(value)

		// Parse the value using the provided Zod schema
		return schema.parse(parsed)
	} catch (error) {
		// If the value cannot be parsed, delete the key and return null
		if (error instanceof ZodError) {
			await client.del(key)
			return null
		}

		// Otherwise, rethrow the error
		throw error
	}
}

/**
 * Get a key; if not found, set it using a fallback function
 * If the value is null or undefined, don't set it and return null
 */
export async function getOrSet<T>(
	key: string,
	fetcher: () => Promise<T>,
	ttlInSeconds = DEFAULT_TTL_IN_SECONDS,
) {
	// Get the cached value from Redis
	const cached = await get<T>(key)

	// If the value is found, return it
	if (cached !== null) return cached

	// Otherwise, fetch the fresh value from the fetcher function
	const fresh = await fetcher()

	// Set the fresh value in Redis
	await set(key, fresh, ttlInSeconds)

	// Return the fresh value
	return fresh
}

/**
 * Delete one or more keys
 */
export async function del(key: string) {
	return await client.del(key)
}

/**
 * Check if a key exists
 */
export async function exists(key: string) {
	return await client.exists(key)
}

/**
 * Get time-to-live for a key
 */
export async function ttl(key: string) {
	return await client.ttl(key)
}

/**
 * Set a new TTL for a given key
 */
export async function setTTL(key: string, ttlInSeconds: number) {
	return await client.expire(key, ttlInSeconds)
}

/**
 * Get all keys that match a pattern
 */
export async function keys(pattern: string) {
	return await client.keys(pattern)
}

/**
 * Ping the Redis server
 */
export async function ping() {
	return await client.send('PING', [])
}
