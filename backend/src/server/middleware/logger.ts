import { createMiddleware } from 'hono/factory'
import { getPath } from 'hono/utils/url'
import { logger } from '~/lib/logger'

function formatElapsedTime(start: number) {
	const delta = Date.now() - start
	const time = delta < 1000 ? `${delta}ms` : `${Math.round(delta / 1000)}s`
	return time.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
}

export const loggerMiddleware = createMiddleware(async (c, next) => {
	const path = getPath(c.req.raw)
	const { method } = c.req

	logger.info(
		{
			request: {
				method,
				path,
			},
		},
		'Incoming request',
	)

	const start = Date.now()

	await next()

	const { status } = c.res

	logger.info(
		{
			response: {
				status,
				duration: formatElapsedTime(start),
			},
		},
		'Request completed',
	)
})
