import { zodResolver } from '@hookform/resolvers/zod'
import { parseFormData, useRemixForm } from 'remix-hook-form'
import { redirectWithToast } from 'remix-toast'
import { z } from 'zod'
import { Button } from '~/components/button'
import { Form } from '~/components/form'
import { AuthLinks } from '~/features/auth/components/auth-links'
import { AuthTitle } from '~/features/auth/components/auth-title'
import { PasswordInput } from '~/features/auth/components/password-input'
import { authSchemas } from '~/features/auth/schemas'
import { client } from '~/lib/api/middleware.server'
import { handleError } from '~/lib/errors/handle-error.server'
import { routeMeta } from '~/lib/route-meta'
import { getSearchParams } from '~/lib/search-params'
import { useLoading } from '~/lib/use-loading'
import type { Route } from './+types/reset-password'

export const meta = routeMeta({
	title: 'Reset Password',
	description: 'Set your new password',
})

const resetPasswordSchema = z.object({
	email: authSchemas.email,
	password: authSchemas.password,
	token: authSchemas.token,
})

export async function action({ request, context }: Route.ActionArgs) {
	try {
		const api = client(context)

		await api.post('/auth/reset-password', await parseFormData(request))

		return redirectWithToast('/login', {
			type: 'success',
			message: 'You can now login with your new password.',
		})
	} catch (error) {
		return handleError(error, context)
	}
}

export function loader({ request }: Route.LoaderArgs) {
	const { token, email } = getSearchParams(request)

	if (!token || !email) {
		return redirectWithToast('/login', {
			type: 'error',
			message: 'Invalid reset link, please request a new one.',
		})
	}

	return {
		email,
		token,
	}
}

export default function ResetPassword({ loaderData: { email, token } }: Route.ComponentProps) {
	const { submitting } = useLoading()

	const {
		handleSubmit,
		formState: { errors },
		register,
	} = useRemixForm({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: { email, token },
	})

	return (
		<>
			<AuthTitle title='Reset Password' description='Enter your new password below.' />
			<Form method='post' onSubmit={handleSubmit} className='flex flex-col gap-4'>
				<input type='hidden' {...register('email')} />
				<input type='hidden' {...register('token')} />
				<PasswordInput
					{...register('password')}
					placeholder='New Password'
					error={errors.password?.message}
				/>
				<Button type='submit' isPending={submitting} isDisabled={submitting}>
					Reset Password
				</Button>
			</Form>
			<AuthLinks links={[{ label: 'Back to Login', to: '/login' }]} />
		</>
	)
}
