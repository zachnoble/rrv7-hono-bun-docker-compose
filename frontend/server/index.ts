import path from 'node:path'
import url from 'node:url'
import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { createMiddleware } from 'hono/factory'
import { logger } from 'hono/logger'
import { type ServerBuild, createRequestHandler } from 'react-router'
import { cache } from './middleware/cache'

const app = new Hono({ strict: false })

app.use('*', logger())

const buildPath = path.resolve('./build/server')
const build: ServerBuild = await import(url.pathToFileURL(buildPath).href)

app.use(
	`${path.posix.join(build.publicPath, 'assets')}/*`,
	cache(60 * 60 * 24 * 365),
	serveStatic({
		root: path.join(build.assetsBuildDirectory, 'assets'),
	}),
)

app.use(
	'*',
	cache(60 * 60),
	serveStatic({
		root: build.assetsBuildDirectory,
	}),
)

app.use(async (c, next) => {
	return createMiddleware(async (c) => {
		return createRequestHandler(build, Bun.env.NODE_ENV)(c.req.raw)
	})(c, next)
})

const port = Bun.env.PORT ? Number.parseInt(Bun.env.PORT) : 8080

export default {
	port,
	fetch: app.fetch,
} satisfies Bun.ServeOptions
