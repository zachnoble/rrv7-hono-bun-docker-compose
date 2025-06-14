import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'
import { logger } from 'hono/logger'
import { createRequestHandler } from 'react-router'

const app = new Hono({ strict: false })

app.use('*', logger())

app.use(async (c, next) => {
	return createMiddleware(async (c) => {
		return createRequestHandler(
			() => import('virtual:react-router/server-build'),
			Bun.env.NODE_ENV,
		)(c.req.raw)
	})(c, next)
})

const port = Bun.env.PORT ? Number.parseInt(Bun.env.PORT) : 5173

export default {
	port,
	fetch: app.fetch,
} satisfies Bun.ServeOptions
