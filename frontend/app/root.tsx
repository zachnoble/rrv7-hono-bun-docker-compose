import './styles/tailwind.css'
import { Outlet } from 'react-router'
import { getToast, unstable_toastMiddleware } from 'remix-toast/middleware'
import { twMerge } from 'tailwind-merge'
import type { Route } from './+types/root'
import { Toaster } from './components/toaster'
import { authMiddleware } from './features/auth/middleware.server'
import { PreventFlashOnWrongTheme } from './features/themes/components/prevent-flash'
import { ThemeProvider } from './features/themes/context'
import { useTheme } from './features/themes/hooks/use-theme'
import { themeSessionResolver } from './features/themes/session.server'
import { apiClientMiddleware } from './lib/api/middleware.server'
import { Document } from './lib/document'
import { envClient } from './lib/env.server'
import { ErrorFallback } from './lib/errors/error-fallback'
import { NavProgress } from './lib/nav-progress'

export const unstable_middleware = [
	apiClientMiddleware(),
	authMiddleware(),
	unstable_toastMiddleware(),
]

export async function loader({ request, context }: Route.LoaderArgs) {
	const { getTheme } = await themeSessionResolver(request)

	return {
		envClient,
		theme: getTheme(),
		toast: getToast(context),
	}
}

export function ErrorBoundary() {
	return (
		<Document
			className='dark'
			headSlot={<title>Unexpected Error</title>}
			bodySlot={
				<ErrorFallback
					title='Something went wrong...'
					message='An unexpected error occured. Please try refreshing the page.'
				/>
			}
		/>
	)
}

function App({ loaderData: { envClient, toast } }: Route.ComponentProps) {
	const [theme] = useTheme()

	return (
		<Document
			className={twMerge(theme)}
			headSlot={<PreventFlashOnWrongTheme ssrTheme={Boolean(theme)} />}
			bodySlot={
				<>
					<NavProgress />
					<Toaster toastData={toast} />
					<Outlet />
					<script
						// biome-ignore lint/security/noDangerouslySetInnerHtml: this is safe
						dangerouslySetInnerHTML={{
							__html: `window.ENV = ${JSON.stringify(envClient)}`,
						}}
					/>
				</>
			}
		/>
	)
}

export default function Root(props: Route.ComponentProps) {
	const {
		loaderData: { theme },
	} = props

	return (
		<ThemeProvider specifiedTheme={theme}>
			<App {...props} />
		</ThemeProvider>
	)
}
