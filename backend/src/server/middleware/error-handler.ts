import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { ZodError } from 'zod'
import { AppError } from '~/lib/errors'
import { logger } from '~/lib/logger'

function formatZodError(error: ZodError) {
	return error.errors
		.map((e) => {
			const fieldPath = e.path.join('.')
			return `${fieldPath}: ${e.message}`
		})
		.join('\n')
}

export function errorHandler(err: Error, c: Context) {
	logger.error(err)

	let message = 'An unexpected error occurred.'
	let status = 500

	if (err instanceof AppError || err instanceof HTTPException) {
		status = err.status
		message = err.cause instanceof ZodError ? formatZodError(err.cause) : err.message
	}

	return c.json(
		{
			error: {
				message,
				status,
			},
		},
		status as ContentfulStatusCode,
	)
}
