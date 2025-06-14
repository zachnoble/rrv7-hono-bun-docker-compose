import { APIError } from '~/lib/api/api-error'

export const genericErrorMessage = 'An unexpected error occured'

export function parseError(error: unknown) {
	// null or undefined
	if (error === null || error === undefined) {
		return genericErrorMessage
	}

	// APIError object
	if (error instanceof APIError) {
		return error.message
	}

	// Error object
	// Generally don't want to show error.message, as it is not typically user-facing
	if (error instanceof Error) {
		return genericErrorMessage
	}

	// '...'
	if (typeof error === 'string') {
		return error
	}

	// { message: '...' }
	if (error instanceof Object && 'message' in error && typeof error.message === 'string') {
		return error.message
	}

	// { error: '...' }
	if (error instanceof Object && 'error' in error && typeof error.error === 'string') {
		return error.error
	}

	// { error: { message: '...' } }
	if (
		error instanceof Object &&
		'error' in error &&
		typeof error.error === 'object' &&
		error.error !== null &&
		'message' in error.error &&
		typeof error.error.message === 'string'
	) {
		return error.error.message
	}

	// Fallback
	return genericErrorMessage
}
