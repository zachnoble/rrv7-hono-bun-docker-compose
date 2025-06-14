import { redirect } from 'react-router'
import { themeSessionResolver } from '~/features/themes/session.server'
import { isTheme } from '~/features/themes/utils'
import type { Route } from './+types/set-theme'

export async function action({ request }: Route.ActionArgs) {
	const session = await themeSessionResolver(request)
	const { theme } = await request.json()

	if (!theme) {
		return Response.json(
			{ success: true },
			{ headers: { 'Set-Cookie': await session.destroy() } },
		)
	}

	if (!isTheme(theme)) {
		return Response.json({
			success: false,
			message: `${theme} is not a valid theme`,
		})
	}

	session.setTheme(theme)

	return Response.json(
		{
			success: true,
		},
		{
			headers: {
				'Set-Cookie': await session.commit(),
			},
		},
	)
}

export function loader() {
	return redirect('/')
}
