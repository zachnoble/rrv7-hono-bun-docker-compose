import { GoogleOAuthProvider } from '@react-oauth/google'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { Link, Outlet } from 'react-router'
import { Button } from '~/components/button'
import { Card } from '~/components/card'
import { ChevronLeftIcon } from '~/components/icons/outline/chevron-left'
import { envClient } from '~/lib/env.server'
import type { Route } from './+types/layout'

export function loader() {
	return {
		gcpRecaptchaSiteKey: envClient.GCP_RECAPTCHA_SITE_KEY,
		gcpOAuthClientId: envClient.GCP_OAUTH_CLIENT_ID,
	}
}

export default function AuthLayout({
	loaderData: { gcpRecaptchaSiteKey, gcpOAuthClientId },
}: Route.ComponentProps) {
	return (
		<GoogleReCaptchaProvider reCaptchaKey={gcpRecaptchaSiteKey} language='en'>
			<GoogleOAuthProvider clientId={gcpOAuthClientId}>
				<div className='flex min-h-[100dvh] w-full items-center justify-center py-12'>
					<div className='mx-auto w-full max-w-[475px]'>
						<div className='absolute top-3 left-3 sm:top-5 sm:left-5'>
							<Button asChild variant='plain'>
								<Link to='/' className=''>
									<div className='flex items-center gap-2 pr-1.5 text-muted'>
										<ChevronLeftIcon className='text-muted' /> Home
									</div>
								</Link>
							</Button>
						</div>
						<Card className='rounded-none p-12 md:rounded-sm'>
							<Outlet />
						</Card>
					</div>
				</div>
			</GoogleOAuthProvider>
		</GoogleReCaptchaProvider>
	)
}
