import type { unstable_RouterContextProvider } from 'react-router'
import { setToast } from 'remix-toast/middleware'
import { logger } from '~/lib/logger.server'
import { parseError } from './parse-error'

export function handleError(error: unknown, context: unstable_RouterContextProvider) {
	// Log the error on the server
	logger.error(error)

	// Parse the error
	const errorMessage = parseError(error)

	// Toast an error message to the user
	setToast(context, {
		type: 'error',
		message: errorMessage,
	})

	// Return the error
	return { error: errorMessage }
}
