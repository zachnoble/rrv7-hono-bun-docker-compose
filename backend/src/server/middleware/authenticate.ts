import { createMiddleware } from 'hono/factory'
import { UnauthorizedError } from '~/lib/errors'
import { redis } from '~/redis'
import { redisKeys } from '~/redis/keys'
import { getUserBySessionId } from '~/services/auth/auth-dal'
import { getSessionIdFromCookie } from '~/services/auth/auth-fns'

type Context = {
	Variables: {
		user: {
			id: string
			name: string
			email: string
		}
	}
}

export const authenticate = createMiddleware<Context>(async (c, next) => {
	// Get session ID from cookie
	const sessionId = await getSessionIdFromCookie(c)
	if (!sessionId) throw new UnauthorizedError('Session ID missing in request')

	// Get user from session ID in Redis; if not found, fetch from DB and cache in Redis
	const key = redisKeys.session(sessionId)
	const user = await redis.getOrSet(key, () => getUserBySessionId(sessionId))

	// If not found in DB, throw UnauthorizedError
	if (!user) throw new UnauthorizedError('Session not found')

	// Set user on context variables
	c.set('user', user)

	await next()
})
