import { data, redirect } from 'react-router'
import { client } from '~/lib/api/middleware.server'
import { parseError } from '~/lib/errors/parse-error'
import type { Route } from './+types/logout'

export async function action({ context }: Route.ActionArgs) {
	try {
		const api = client(context)

		const {
			response: { headers },
		} = await api.post('/auth/logout')

		return data(null, {
			headers,
		})
	} catch (error) {
		return {
			error: parseError(error),
		}
	}
}

export function loader() {
	return redirect('/')
}
