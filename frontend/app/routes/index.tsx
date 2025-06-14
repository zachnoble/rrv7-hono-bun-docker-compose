import { Link, useFetcher } from 'react-router'
import { Button } from '~/components/button'
import { getUser } from '~/features/auth/middleware.server'
import { ToggleTheme } from '~/features/themes/components/toggle-theme'
import { routeMeta } from '~/lib/route-meta'
import type { Route } from './+types/index'

export const meta = routeMeta({
	title: 'App Name',
	description: 'App Description',
})

export async function loader({ context }: Route.LoaderArgs) {
	const user = getUser(context)

	return {
		user,
	}
}

export default function Index({ loaderData: { user } }: Route.ComponentProps) {
	const fetcher = useFetcher()

	return (
		<div className='flex min-h-[100dvh] w-full items-center justify-center'>
			<div className='flex w-full max-w-[500px] flex-col gap-4 px-10'>
				<div>
					<ToggleTheme />
				</div>
				{!user && (
					<>
						<Button asChild variant='outline'>
							<Link to='/login'>Login</Link>
						</Button>
						<Button asChild>
							<Link to='/register'>Register</Link>
						</Button>
					</>
				)}
				{user && (
					<fetcher.Form method='post' action='/logout'>
						<Button
							type='submit'
							className='w-full'
							isDisabled={fetcher.state !== 'idle'}
						>
							Logout
						</Button>
					</fetcher.Form>
				)}
			</div>
		</div>
	)
}
