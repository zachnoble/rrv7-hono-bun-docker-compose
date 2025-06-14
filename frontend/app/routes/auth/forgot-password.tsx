import { zodResolver } from '@hookform/resolvers/zod'
import { GoogleReCaptcha } from 'react-google-recaptcha-v3'
import { parseFormData, useRemixForm } from 'remix-hook-form'
import { z } from 'zod'
import { Button } from '~/components/button'
import { Form } from '~/components/form'
import { Input } from '~/components/input'
import { AuthConfirmation } from '~/features/auth/components/auth-confirmation'
import { AuthLinks } from '~/features/auth/components/auth-links'
import { AuthTitle } from '~/features/auth/components/auth-title'
import { requireGuest } from '~/features/auth/middleware.server'
import { authSchemas } from '~/features/auth/schemas'
import { client } from '~/lib/api/middleware.server'
import { handleError } from '~/lib/errors/handle-error.server'
import { routeMeta } from '~/lib/route-meta'
import { useLoading } from '~/lib/use-loading'
import type { Route } from './+types/forgot-password'

export const meta = routeMeta({
	title: 'Forgot your password?',
	description: 'Request a password reset',
})

const forgotPasswordSchema = z.object({
	email: authSchemas.email,
	recaptchaToken: authSchemas.recaptchaToken,
})

export async function action({ request, context }: Route.ActionArgs) {
	try {
		const api = client(context)

		const data = await parseFormData<z.infer<typeof forgotPasswordSchema>>(request)
		await api.post('/auth/forgot-password', data)

		return {
			email: data.email,
		}
	} catch (error) {
		return handleError(error, context)
	}
}

export function loader({ context }: Route.LoaderArgs) {
	return requireGuest(context)
}

export default function ForgotPassword({ actionData }: Route.ComponentProps) {
	const { submitting } = useLoading()

	const email = actionData && 'email' in actionData ? actionData.email : undefined

	const {
		handleSubmit,
		formState: { errors },
		register,
		setValue,
	} = useRemixForm({
		resolver: zodResolver(forgotPasswordSchema),
	})

	if (email) {
		return (
			<AuthConfirmation message={`We just sent a link to reset your password to ${email}.`} />
		)
	}

	return (
		<>
			<AuthTitle
				title='Forgot your password?'
				description="Enter your email and we'll send you a link to reset your password."
			/>
			<Form method='post' onSubmit={handleSubmit} className='flex flex-col gap-4'>
				<Input
					{...register('email')}
					type='email'
					placeholder='Email'
					error={errors.email?.message}
				/>
				<GoogleReCaptcha onVerify={(token) => setValue('recaptchaToken', token)} />
				<Button type='submit' isPending={submitting} isDisabled={submitting}>
					Reset Password
				</Button>
			</Form>
			<AuthLinks links={[{ label: 'Back to Login', to: '/login' }]} />
		</>
	)
}
