import { cors as honoCors } from 'hono/cors'
import { env } from '~/lib/env'

export const cors = honoCors({
	origin: env.ORIGIN,
	allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
	credentials: true,
})
