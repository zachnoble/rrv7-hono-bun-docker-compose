import { eq } from 'drizzle-orm'
import type { Context } from 'hono'
import { db } from '~/db'
import { emailVerificationTokens, passwordResetTokens, sessions, users } from '~/db/models'
import { env } from '~/lib/env'
import {
	BadRequestError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
	UnauthorizedError,
} from '~/lib/errors'
import { logger } from '~/lib/logger'
import { sendEmail } from '~/lib/resend'
import { redis } from '~/redis'
import { redisKeys } from '~/redis/keys'
import {
	getEmailVerificationToken,
	getPasswordResetToken,
	getUserByEmail,
	getUserByGoogleId,
	getUserById,
} from './auth-dal'
import {
	GOOGLE_USER_INFO_API_URL,
	TOKEN_EXPIRATION_TIME,
	comparePasswordHash,
	deleteSessionCookie,
	generateSecureToken,
	getSessionIdFromCookie,
	hashPassword,
	passwordResetEmailHtml,
	setSessionCookie,
	verificationEmailHtml,
} from './auth-fns'
import { googleUserInfoSchema } from './auth-schemas'
import type {
	ChangePassword,
	CreateSession,
	CreateUser,
	GoogleLogin,
	Login,
	ResetPassword,
	SendPasswordResetEmail,
	SendVerificationEmail,
	VerifyUser,
} from './auth-types'

export async function generateVerificationToken(userId: string) {
	await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, userId))

	const token = generateSecureToken()
	const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_TIME)

	await db.insert(emailVerificationTokens).values({
		token,
		userId,
		expiresAt,
	})

	return token
}

export async function generatePasswordResetToken(email: string) {
	const user = await getUserByEmail(email)

	if (!user) throw new NotFoundError(`Account not found with email ${email}`)

	const token = generateSecureToken()
	const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_TIME)

	await db.insert(passwordResetTokens).values({
		token,
		userId: user.id,
		expiresAt,
	})

	return token
}

export async function validateCredentials({ email, password }: Login) {
	const user = await getUserByEmail(email)
	if (!user) throw new UnauthorizedError('Invalid username or password')

	if (!user.passwordHash) {
		throw new UnauthorizedError('Please sign in with Google or reset your password')
	}

	const passwordMatch = await comparePasswordHash({ password, passwordHash: user.passwordHash })
	if (!passwordMatch) {
		throw new UnauthorizedError('Invalid username or password')
	}

	if (!user.isVerified) {
		throw new ForbiddenError(
			'Email not verified. Please check your email for a verification link, or register again.',
		)
	}

	return user
}

export async function createSession({ userId, c }: CreateSession) {
	const sessionId = generateSecureToken()

	const [session] = await db
		.insert(sessions)
		.values({
			userId,
			sessionId,
		})
		.returning()

	if (c) await setSessionCookie(c, sessionId)

	return session
}

export async function createUser({
	email,
	name,
	password,
	isVerified = false,
	googleId,
}: CreateUser) {
	const existingUser = await getUserByEmail(email)

	// Block registering an account with an email that already exists
	if (existingUser?.isVerified) {
		throw new ConflictError('Sorry, that email address is already taken.')
	}

	// If the account exists but is not verified, delete the account and any verification tokens
	// We can then re-register the new account with that same email address
	if (existingUser && !existingUser.isVerified) {
		await db.transaction(async (tx) => {
			await tx
				.delete(emailVerificationTokens)
				.where(eq(emailVerificationTokens.userId, existingUser.id))
			await tx.delete(users).where(eq(users.email, email))
		})
	}

	// ensure either googleId or password is provided
	if (!googleId && !password) {
		throw new BadRequestError('Either Google ID or password must be provided')
	}

	const passwordHash = password ? await hashPassword(password) : null
	const [user] = await db
		.insert(users)
		.values({ email, name, passwordHash, isVerified, googleId })
		.returning()

	return user
}

export async function logout(c: Context) {
	const sessionId = await getSessionIdFromCookie(c)
	if (!sessionId) return

	// Includes a set cookie header to clear session cookie
	deleteSessionCookie(c)

	// Delete session from DB + Redis
	await Promise.all([
		db.delete(sessions).where(eq(sessions.sessionId, sessionId)),
		redis.del(redisKeys.session(sessionId)),
	])
}

export async function resetPassword({ token, email, password }: ResetPassword) {
	const message = 'Invalid or expired password reset link. Please request a new one.'

	const resetToken = await getPasswordResetToken(token)

	if (!resetToken) {
		throw new UnauthorizedError(message)
	}

	if (resetToken.expiresAt < new Date()) {
		throw new UnauthorizedError(message)
	}

	const user = await getUserByEmail(email)
	if (!user || user.email !== email) {
		throw new UnauthorizedError(message)
	}

	const passwordHash = await hashPassword(password)
	await db.update(users).set({ passwordHash }).where(eq(users.id, user.id))
	await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token))
}

export async function changePassword({ currentPassword, newPassword, userId }: ChangePassword) {
	const user = await getUserById(userId)
	if (!user) {
		throw new NotFoundError('User not found')
	}

	if (!user.passwordHash) {
		throw new BadRequestError(
			'Cannot change password for Google sign-in users. Please contact support.',
		)
	}

	const passwordMatch = await comparePasswordHash({
		password: currentPassword,
		passwordHash: user.passwordHash,
	})
	if (!passwordMatch) {
		throw new UnauthorizedError('You did not provide the correct current password')
	}

	const passwordHash = await hashPassword(newPassword)
	await db.update(users).set({ passwordHash }).where(eq(users.id, user.id))
}

export async function verifyUser({ token, email }: VerifyUser) {
	const [user, verificationToken] = await Promise.all([
		getUserByEmail(email),
		getEmailVerificationToken(token),
	])

	// User is already verified, return early
	if (user?.isVerified) return

	if (!verificationToken) {
		throw new UnauthorizedError(
			"Unable to verify email. If you haven't already verified your account, try to register again.",
		)
	}

	// If the token is expired, send a new verification email.
	if (verificationToken.expiresAt < new Date()) {
		await sendVerificationEmail({ email, userId: verificationToken.userId })

		// throw an error to let the client know that the token is expired, but we still sent a new one
		throw new BadRequestError(
			'Verification email expired. We sent a new one to your email address!',
		)
	}

	await db.update(users).set({ isVerified: true }).where(eq(users.id, verificationToken.userId))
	await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.token, token))
}

export async function sendPasswordResetEmail({ email }: SendPasswordResetEmail) {
	try {
		const token = await generatePasswordResetToken(email)
		const resetUrl = `${env.ORIGIN}/reset-password?token=${token}&email=${email}`

		await sendEmail({
			to: email,
			subject: 'Reset Your Password',
			html: passwordResetEmailHtml(resetUrl),
		})
	} catch (error) {
		// if the email is not found, we don't want to throw an error
		if (error instanceof NotFoundError) {
			logger.error(error)
			return
		}
		throw error
	}
}

export async function sendVerificationEmail({ userId, email }: SendVerificationEmail) {
	const token = await generateVerificationToken(userId)
	const verificationUrl = `${env.ORIGIN}/verify-user?token=${token}&email=${email}`

	await sendEmail({
		to: email,
		subject: 'Verify Your Email Address',
		html: verificationEmailHtml(verificationUrl),
	})
}

export async function authWithGoogle({ googleToken }: GoogleLogin) {
	// Validate the token by calling Google's userinfo endpoint
	const response = await fetch(GOOGLE_USER_INFO_API_URL, {
		headers: {
			Authorization: `Bearer ${googleToken}`,
		},
	})

	// Parse the response to get the user's email, name, and sub (Google ID)
	const { sub: googleId, email, name } = googleUserInfoSchema.parse(await response.json())

	// Check if user already exists with this Google ID
	let user = await getUserByGoogleId(googleId)
	if (user) return user

	// Check if user exists with this email
	user = await getUserByEmail(email)
	if (user) {
		// User exists with email but no Google ID - link the accounts
		await db.update(users).set({ googleId, isVerified: true }).where(eq(users.id, user.id))
		return { ...user, googleId }
	}

	// Create new user with Google credentials
	return await createUser({ email, name, googleId, isVerified: true })
}
