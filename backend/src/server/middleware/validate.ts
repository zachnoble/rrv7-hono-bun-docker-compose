import { zValidator } from '@hono/zod-validator'
import type { ValidationTargets } from 'hono'
import type { ZodSchema } from 'zod'
import { UnprocessableEntityError } from '~/lib/errors'

export function validate<T extends ZodSchema, Target extends keyof ValidationTargets>(
	target: Target,
	schema: T,
) {
	return zValidator(target, schema, (result) => {
		if (!result.success) {
			throw new UnprocessableEntityError('One or more fields are invalid', result.error)
		}
	})
}
