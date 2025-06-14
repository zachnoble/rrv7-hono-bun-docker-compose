import { Hono } from 'hono'
import { cors, errorHandler, loggerMiddleware, notFound } from './middleware'
import { routes } from './routes'

export const app = new Hono()
	.use(cors)
	.use(loggerMiddleware)
	.onError(errorHandler)
	.notFound(notFound)
	.route('/', routes)
