import { Hono } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { healthServices } from '~/services'

export const healthRoutes = new Hono().get('/', async (c) => {
	const health = await healthServices.getHealth()
	const status = health.status as ContentfulStatusCode

	return c.json(health, status)
})
