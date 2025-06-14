import { ErrorFallback } from '~/lib/errors/error-fallback'
import { routeMeta } from '~/lib/route-meta'

export const meta = routeMeta({
	title: '404 Not Found',
	description: 'The page you are looking for no longer exists.',
})

export default function NotFound() {
	return (
		<ErrorFallback
			title='404 Not Found'
			message='The page you are looking for no longer exists.'
		/>
	)
}
