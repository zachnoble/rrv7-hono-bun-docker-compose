import { zodResolver } from '@hookform/resolvers/zod'
import { GoogleReCaptcha } from 'react-google-recaptcha-v3'
import { data } from 'react-router'
import { parseFormData, useRemixForm } from 'remix-hook-form'
import { z } from 'zod'
import { Button } from '~/components/button'
import { Form } from '~/components/form'
import { Input } from '~/components/input'
import { AuthConfirmation } from '~/features/auth/components/auth-confirmation'
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
import type { Route } from './+types/register'

export const meta = routeMeta({
	title: 'Register',
	description: 'Create an account',
})

const registerSchema = z.object({
	name: authSchemas.name,
	email: authSchemas.email,
	password: authSchemas.password,
	recaptchaToken: authSchemas.recaptchaToken,
	intent: authSchemas.intent,
})

export async function action({ request, context }: Route.ActionArgs) {
	try {
		const api = client(context)
		const formData = await parseFormData<z.infer<typeof registerSchema>>(request)

		if (formData.intent === 'googleAuth') {
			const {
				response: { headers },
			} = await api.post('/auth/google', formData)

			return data(null, {
				headers,
			})
		}

		await api.post('/auth/register', formData)

		return {
			email: formData.email,
		}
	} catch (err) {
		return handleError(err, context)
	}
}

export function loader({ context }: Route.LoaderArgs) {
	return requireGuest(context)
}

export default function Register({ actionData }: Route.ComponentProps) {
	const { submitting } = useLoading()

	const email = actionData && 'email' in actionData ? actionData.email : null

	const {
		handleSubmit,
		formState: { errors },
		register,
		setValue,
	} = useRemixForm({
		resolver: zodResolver(registerSchema),
	})

	if (email) {
		return <AuthConfirmation message={`We just sent a verification link to ${email}.`} />
	}

	return (
		<>
			<AuthTitle title='Create an account' description='Sign up to get started' />
			<Form method='post' onSubmit={handleSubmit} className='flex flex-col gap-4'>
				<Input {...register('name')} placeholder='Name' error={errors.name?.message} />
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
				<Button type='submit' isDisabled={submitting} isPending={submitting}>
					Register
				</Button>
			</Form>
			<AuthDivider />
			<GoogleAuthButton flow='register' />
			<AuthLinks links={[{ label: 'Already have an account? Login', to: '/login' }]} />
		</>
	)
}
