import { Hono } from 'hono'
import { z } from 'zod'
import { success } from '~/lib/responses'
import { authServices } from '~/services'
import { authenticate, recaptcha, validate } from '../middleware'

export const authRoutes = new Hono()
	.post(
		'/login',
		recaptcha,
		validate(
			'json',
			z.object({
				email: z.string().email(),
				password: z.string().min(1),
			}),
		),
		async (c) => {
			const body = c.req.valid('json')

			const user = await authServices.validateCredentials(body)

			await authServices.createSession({
				userId: user.id,
				c,
			})

			return success(c)
		},
	)
	.post(
		'/google',
		validate(
			'json',
			z.object({
				googleToken: z.string().min(1),
			}),
		),
		async (c) => {
			const { googleToken } = c.req.valid('json')

			const user = await authServices.authWithGoogle({ googleToken })

			await authServices.createSession({
				userId: user.id,
				c,
			})

			return success(c)
		},
	)
	.post(
		'/register',
		recaptcha,
		validate(
			'json',
			z.object({
				email: z.string().email(),
				password: z.string().min(10),
				name: z.string().min(2),
			}),
		),
		async (c) => {
			const body = c.req.valid('json')

			const user = await authServices.createUser(body)

			await authServices.sendVerificationEmail({
				email: user.email,
				userId: user.id,
			})

			return success(c)
		},
	)
	.post(
		'/verify-user',
		validate(
			'json',
			z.object({
				email: z.string().email(),
				token: z.string().min(1),
			}),
		),
		async (c) => {
			const body = c.req.valid('json')

			await authServices.verifyUser(body)

			return success(c)
		},
	)
	.post(
		'/forgot-password',
		recaptcha,
		validate(
			'json',
			z.object({
				email: z.string().email(),
			}),
		),
		async (c) => {
			const body = c.req.valid('json')

			await authServices.sendPasswordResetEmail(body)

			return success(c)
		},
	)
	.post(
		'/reset-password',
		validate(
			'json',
			z.object({
				email: z.string().email(),
				password: z.string().min(10),
				token: z.string().min(1),
			}),
		),
		async (c) => {
			const body = c.req.valid('json')

			await authServices.resetPassword(body)

			return success(c)
		},
	)
	.post(
		'/change-password',
		authenticate,
		recaptcha,
		validate(
			'json',
			z.object({
				newPassword: z.string().min(10),
				currentPassword: z.string().min(1),
			}),
		),
		async (c) => {
			const body = c.req.valid('json')
			const user = c.get('user')

			await authServices.changePassword({ ...body, userId: user.id })

			return success(c)
		},
	)
	.post('/logout', async (c) => {
		await authServices.logout(c)

		return success(c)
	})
	.get('/user', authenticate, (c) => c.json(c.get('user')))
