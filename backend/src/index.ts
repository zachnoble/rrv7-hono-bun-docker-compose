import { env } from './lib/env'
import { app } from './server/app'

export default {
	port: env.PORT,
	fetch: app.fetch,
} satisfies Bun.ServeOptions
