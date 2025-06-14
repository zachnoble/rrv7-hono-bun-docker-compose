import { z } from 'zod'

const name = z.string().min(2, 'Please enter your name')
const email = z.string().email('Please enter a valid email address')
const password = z.string().min(10, 'Password must be at least 10 characters')
const existingPassword = z.string().min(1, 'Please enter your password')
const recaptchaToken = z.string().optional()
const token = z.string()
const intent = z.enum(['googleAuth', 'emailPassword']).optional()

export const authSchemas = {
	name,
	email,
	password,
	existingPassword,
	recaptchaToken,
	token,
	intent,
}
