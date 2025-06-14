import { zodResolver } from '@hookform/resolvers/zod'
import { GoogleReCaptcha } from 'react-google-recaptcha-v3'
import { data } from 'react-router'
import { parseFormData, useRemixForm } from 'remix-hook-form'
import { z } from 'zod'
import { Button } from '~/components/button'
import { Form } from '~/components/form'
import { Input } from '~/components/input'
import { AuthDivider } from '~/features/auth/components/auth-divider'
import { AuthLinks } from '~/features/auth/components/auth-links'
import { AuthTitle } from '~/features/auth/components/auth-title'
import { GoogleAuthButton } from '~/features/auth/components/google-auth-button'
import { PasswordInput } from '~/features/auth/components/password-input'
import { requireGuest } from '~/features/auth/middleware.server'
import { authSchemas } from '~/features/auth/schemas'
import { client } from '~/lib/api/middleware.server'
import { handleError } from '~/lib/errors/handle-error.server'
import { routeMeta } from '~/lib/route-meta'
import { useLoading } from '~/lib/use-loading'
import type { Route } from './+types/login'

export const meta = routeMeta({
	title: 'Login',
	description: 'Login to your account',
})

const loginSchema = z.object({
	email: authSchemas.email,
	password: authSchemas.existingPassword,
	recaptchaToken: authSchemas.recaptchaToken,
	intent: authSchemas.intent,
})

export async function action({ request, context }: Route.ActionArgs) {
	try {
		const api = client(context)
		const formData = await parseFormData<z.infer<typeof loginSchema>>(request)

		if (formData.intent === 'googleAuth') {
			const {
				response: { headers },
			} = await api.post('/auth/google', formData)

			return data(null, { headers })
		}

		const {
			response: { headers },
		} = await api.post('/auth/login', formData)

		return data(null, { headers })
	} catch (error) {
		return handleError(error, context)
	}
}

export function loader({ context }: Route.LoaderArgs) {
	return requireGuest(context)
}

export default function Login() {
	const { submitting } = useLoading()

	const {
		handleSubmit,
		formState: { errors },
		register,
		setValue,
	} = useRemixForm({
		resolver: zodResolver(loginSchema),
	})

	return (
		<>
			<AuthTitle title='Login' description='Sign in to your account' />
			<Form method='post' onSubmit={handleSubmit} className='flex flex-col gap-4'>
				<Input
					{...register('email')}
					type='email'
					placeholder='Email'
					error={errors.email?.message}
				/>
				<PasswordInput
					{...register('password')}
					placeholder='Password'
					error={errors.password?.message}
				/>
				<GoogleReCaptcha onVerify={(token) => setValue('recaptchaToken', token)} />
				<Button type='submit' isPending={submitting} isDisabled={submitting}>
					Login
				</Button>
			</Form>
			<AuthDivider />
			<GoogleAuthButton flow='login' />
			<AuthLinks
				links={[
					{ label: "Don't have an account? Register", to: '/register' },
					{ label: 'Forgot your password?', to: '/forgot-password' },
				]}
			/>
		</>
	)
}
