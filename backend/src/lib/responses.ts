import type { Context } from 'hono'

export function success(c: Context) {
	return c.text('Success')
}
