import { afterEach, beforeAll, describe, expect, it, mock } from 'bun:test'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '~/db'
import { emailVerificationTokens, passwordResetTokens, sessions, users } from '~/db/models'
import { env } from '~/lib/env'
import { comparePasswordHash } from '~/services/auth/auth-fns'
import {
	basicEmailVerificationToken,
	basicPasswordResetToken,
	basicSession,
	basicUser,
} from './lib/fixtures'
import { DEFAULT_TEST_USER, TestClient } from './lib/test-client'

describe('Auth Routes', () => {
	const client = new TestClient()

	let sendEmailMock: ReturnType<typeof mock>

	beforeAll(async () => {
		// mock sending emails
		sendEmailMock = mock()
		mock.module('~/lib/resend', () => {
			return {
				sendEmail: sendEmailMock,
			}
		})

		mock.module('~/services/auth/auth-fns', () => {
			return {
				// mock with 2 salt rounds (min in bcrypt) to speed up test runs
				hashPassword: async (password: string) => await bcrypt.hash(password, 2),
			}
		})
	})

	afterEach(async () => {
		sendEmailMock.mockReset()
	})

	describe('POST /auth/login', () => {
		it('should login with valid credentials', async () => {
			const user = await basicUser()

			// Login with valid credentials
			const res = await client.post('/auth/login', {
				email: user.email,
				password: user.password,
			})
			expect(res.status).toBe(200)

			// Should set a session cookie with the name sessionId
			const cookieHeader = res.headers.get('set-cookie')
			expect(cookieHeader).toContain('sessionId=')

			// Get the signed session ID from the cookie header
			const signedSessionId = cookieHeader?.split('sessionId=')[1]?.split(';')[0]

			// The signed session ID should be longer than the raw session ID (includes a signature)
			const sessionIdLength = 128
			expect(signedSessionId?.length).toBeGreaterThan(sessionIdLength)

			// Should create a session in the database
			const [session] = await db.select().from(sessions).where(eq(sessions.userId, user.id))
			expect(session).toBeDefined()

			// The raw session ID in the database should be a 64-byte hex string (128 characters)
			expect(session.sessionId.length).toBe(sessionIdLength)
			expect(session.userId).toBe(user.id)
		})

		it('should not login if user is not verified', async () => {
			const user = await basicUser({ isVerified: false })

			const res = await client.post('/auth/login', {
				email: user.email,
				password: user.password,
			})
			expect(res.status).toBe(403)

			// Should not create a session in the database
			const allSessions = await db.select().from(sessions)
			expect(allSessions.length).toBe(0)
		})

		it('should not login with invalid password', async () => {
			const user = await basicUser()

			const res = await client.post('/auth/login', {
				email: user.email,
				password: 'wrongpassword', // wrong password
			})
			expect(res.status).toBe(401)

			// Should not create a session in the database
			const allSessions = await db.select().from(sessions)
			expect(allSessions.length).toBe(0)
		})

		it('should not login with invalid email', async () => {
			const user = await basicUser()

			const res = await client.post('/auth/login', {
				email: 'incorrect@email.com', // invalid email
				password: user.password,
			})
			expect(res.status).toBe(401)
		})

		it('should not login with missing fields', async () => {
			const user = await basicUser()

			// missing password
			const res = await client.post('/auth/login', {
				email: user.email,
			})
			expect(res.status).toBe(422)

			// missing email
			const res2 = await client.post('/auth/login', {
				password: user.password,
			})
			expect(res2.status).toBe(422)

			// missing both email and password
			const res3 = await client.post('/auth/login', {})
			expect(res3.status).toBe(422)

			// email & password empty strings
			const res4 = await client.post('/auth/login', {
				email: '',
				password: '',
			})
			expect(res4.status).toBe(422)
		})

		it('should handle logins with several users and mixed up fields', async () => {
			const user1 = await basicUser({
				name: 'User 1',
				email: 'user1@example.com',
				password: 'password123!user1',
			})
			const user2 = await basicUser({
				name: 'User 2',
				email: 'user2@example.com',
				password: 'password123!user2',
			})
			const user3 = await basicUser({
				name: 'User 3',
				email: 'user3@example.com',
				password: 'password123!user3',
			})

			const res = await client.post('/auth/login', {
				email: user2.email,
				password: user1.password,
			})
			expect(res.status).toBe(401)

			const res2 = await client.post('/auth/login', {
				email: user3.email,
				password: user1.password,
			})
			expect(res2.status).toBe(401)

			const res3 = await client.post('/auth/login', {
				email: user1.email,
				password: user2.password,
			})
			expect(res3.status).toBe(401)

			const res4 = await client.post('/auth/login', {
				email: user2.email,
				password: user3.password,
			})
			expect(res4.status).toBe(401)

			// finally login with the correct credentials
			const res5 = await client.post('/auth/login', {
				email: user2.email,
				password: user2.password,
			})
			expect(res5.status).toBe(200)
		})
	})

	describe('POST /auth/register', () => {
		it('should register a new user and send a verification email', async () => {
			// Register a new user
			const data = {
				email: 'test@example.com',
				password: 'Test123!@#$',
				name: 'Test User',
			}
			const res = await client.post('/auth/register', data)
			expect(res.status).toBe(200)

			// Verify the user is created in the database
			const [user] = await db.select().from(users).where(eq(users.email, data.email))
			expect(user).toBeDefined()
			expect(user.id).toBeString()
			expect(user.email).toBe(data.email)
			expect(user.name).toBe(data.name)
			expect(user.isVerified).toBe(false)
			expect(
				await comparePasswordHash({
					password: data.password,
					// biome-ignore lint/style/noNonNullAssertion: <explanation>
					passwordHash: user.passwordHash!,
				}),
			).toBe(true)

			// Verify the verification token is created in the database
			const [verificationToken] = await db
				.select()
				.from(emailVerificationTokens)
				.where(eq(emailVerificationTokens.userId, user.id))
			expect(verificationToken).toBeDefined()
			expect(verificationToken.token).toBeDefined()
			expect(verificationToken.expiresAt).toBeDefined()
			expect(verificationToken.expiresAt > new Date()).toBe(true)

			// Verify that sendEmail was called
			expect(sendEmailMock).toHaveBeenCalledTimes(1)
			expect(sendEmailMock).toHaveBeenCalledWith({
				to: data.email,
				subject: 'Verify Your Email Address',
				html: expect.stringContaining(
					`${env.ORIGIN}/verify-user?token=${verificationToken.token}&email=${data.email}`,
				),
			})
		})

		it('should not register user with existing verified email', async () => {
			const user = await basicUser()

			const res = await client.post('/auth/register', {
				email: user.email, // already registered
				password: 'Test123!@#$',
				name: 'Test User',
			})

			expect(res.status).toBe(409)

			expect(sendEmailMock).not.toHaveBeenCalled()
		})

		it('should allow re-registration with existing unverified email', async () => {
			const unverifiedUser = {
				email: 'unverified@example.com',
				password: 'Test123!@#$',
				name: 'Unverified User',
			}

			// Register a new user, should succeed
			const res1 = await client.post('/auth/register', unverifiedUser)
			expect(res1.status).toBe(200)

			// Register the same user again, should be allowed since the user is unverified
			const res2 = await client.post('/auth/register', unverifiedUser)
			expect(res2.status).toBe(200)

			// Verify the user is still unverified
			const [user] = await db
				.select()
				.from(users)
				.where(eq(users.email, unverifiedUser.email))
			expect(user.isVerified).toBe(false)

			// Verify the verification token is created in the database
			const [verificationToken] = await db
				.select()
				.from(emailVerificationTokens)
				.where(eq(emailVerificationTokens.userId, user.id))
			expect(verificationToken).toBeDefined()
			expect(verificationToken.token).toBeDefined()
			expect(verificationToken.expiresAt).toBeDefined()
			expect(verificationToken.expiresAt > new Date()).toBe(true)

			// Verify that sendEmail was called twice
			expect(sendEmailMock).toHaveBeenCalledTimes(2)
			expect(sendEmailMock).toHaveBeenCalledWith({
				to: unverifiedUser.email,
				subject: 'Verify Your Email Address',
				html: expect.stringContaining(
					`${env.ORIGIN}/verify-user?token=${verificationToken.token}&email=${unverifiedUser.email}`,
				),
			})
		})

		it('should allow registration with duplicate name', async () => {
			const user1 = await basicUser()

			const res = await client.post('/auth/register', {
				email: 'different_email@example.com',
				name: user1.name,
				password: 'Test123!@#$',
			})
			expect(res.status).toBe(200)
		})

		it('should reject registration with invalid email', async () => {
			const res = await client.post('/auth/register', {
				email: 'invalid-email', // invalid email, should be rejected
				password: 'Test123!@#$',
				name: 'Test User',
			})
			expect(res.status).toBe(422)
		})

		it('should reject registration with weak password', async () => {
			const res = await client.post('/auth/register', {
				email: 'weakpass@example.com',
				password: '123', // Too short
				name: 'Test User',
			})
			expect(res.status).toBe(422)
		})

		it('should reject registration with missing name', async () => {
			const res = await client.post('/auth/register', {
				email: 'noname@example.com',
				password: 'Test123!@#$',
				name: '', // Empty name
			})
			expect(res.status).toBe(422)
		})

		it('should reject registration with missing fields', async () => {
			const res = await client.post('/auth/register', {
				email: 'incomplete@example.com',
				// Missing password and name
			})
			expect(res.status).toBe(422)
		})
	})

	describe('POST /auth/forgot-password', () => {
		it('should send password reset email for existing user', async () => {
			const user = await basicUser()

			const res = await client.post('/auth/forgot-password', {
				email: user.email,
			})
			expect(res.status).toBe(200)

			// Verify the password reset token is created in the database
			const [passwordResetToken] = await db
				.select()
				.from(passwordResetTokens)
				.where(eq(passwordResetTokens.userId, user.id))
			expect(passwordResetToken).toBeDefined()
			expect(passwordResetToken.token).toBeDefined()

			// Verify that sendEmail was called
			expect(sendEmailMock).toHaveBeenCalledTimes(1)
			expect(sendEmailMock).toHaveBeenCalledWith({
				to: user.email,
				subject: 'Reset Your Password',
				html: expect.stringContaining(
					`${env.ORIGIN}/reset-password?token=${passwordResetToken.token}&email=${user.email}`,
				),
			})
		})

		it('should not reveal if email exists', async () => {
			const res = await client.post('/auth/forgot-password', {
				email: 'nonexistent@example.com',
			})
			expect(res.status).toBe(200)

			// Verify the password reset token is not created in the database
			const [passwordResetToken] = await db.select().from(passwordResetTokens).limit(1)
			expect(passwordResetToken).toBeUndefined()

			// Verify that sendPasswordResetEmail was not called
			expect(sendEmailMock).not.toHaveBeenCalled()
		})
	})

	describe('POST /auth/logout', () => {
		it('should logout user and clear session', async () => {
			const user = await client.authenticate()

			const res = await client.post('/auth/logout')
			expect(res.status).toBe(200)

			// Verify the response headers have a set cookie directive
			expect(res.headers.get('set-cookie')).toContain('sessionId=;')

			// Verify the session was deleted
			const [session] = await db.select().from(sessions).where(eq(sessions.userId, user.id))
			expect(session).toBeUndefined()
		})

		it('should succeed even if session does not exist', async () => {
			await db.delete(sessions)
			const res = await client.post('/auth/logout')
			expect(res.status).toBe(200)
		})
	})

	describe('GET /auth/user', () => {
		it('should return user data when authenticated', async () => {
			// Create and authenticate a user
			const user = await client.authenticate()
			const res = await client.get('/auth/user')

			// Should return the authenticated user
			expect(res.status).toBe(200)
			expect(res.data.email).toBe(user.email)
			expect(res.data.name).toBe(user.name)
			expect(res.data.id).toBe(user.id)
			expect(res.data.passwordHash).toBeUndefined()
		})

		it('should get the correct user when there are multiple authenticated users', async () => {
			// Create an authenticated user which will be used in the test
			const user = await client.authenticate()

			// Create other users, should be ignored
			const [user1, user2, user3] = await Promise.all([
				basicUser({ email: 'user1@example.com' }),
				basicUser({ email: 'user2@example.com' }),
				basicUser({ email: 'user3@example.com' }),
			])

			// Create sessions for the other users, should be ignored
			await Promise.all([
				basicSession({ userId: user1.id }),
				basicSession({ userId: user2.id }),
				basicSession({ userId: user3.id }),
			])

			// Get the authenticated user
			const res = await client.get('/auth/user')

			// Should return the correct authenticated user
			expect(res.status).toBe(200)
			expect(res.data.email).toBe(user.email)
			expect(res.data.name).toBe(user.name)
			expect(res.data.id).toBe(user.id)
			expect(res.data.passwordHash).toBeUndefined()
		})

		it('should return 401 when not authenticated', async () => {
			const res = await client.get('/auth/user')
			expect(res.status).toBe(401)
		})
	})

	describe('POST /auth/verify-user', () => {
		it('should verify email with valid token', async () => {
			// Unverified user
			const user = await basicUser({ isVerified: false })
			const verificationToken = await basicEmailVerificationToken({ userId: user.id })

			// use the verification token to verify the email
			const res = await client.post('/auth/verify-user', {
				token: verificationToken.token,
				email: user.email,
			})
			expect(res.status).toBe(200)

			// Verify the user is now verified in database
			const [verifiedUser] = await db.select().from(users).where(eq(users.email, user.email))
			expect(verifiedUser.isVerified).toBe(true)

			// Verify the token was deleted
			const [deletedToken] = await db
				.select()
				.from(emailVerificationTokens)
				.where(eq(emailVerificationTokens.token, verificationToken.token))
			expect(deletedToken).toBeUndefined()

			// Verify that sendEmail was not called
			expect(sendEmailMock).not.toHaveBeenCalled()
		})

		it('should not verify email with invalid token', async () => {
			const user = await basicUser({ isVerified: false })
			await basicEmailVerificationToken({ userId: user.id })

			const res = await client.post('/auth/verify-user', {
				token: 'invalid-token',
				email: user.email,
			})
			expect(res.status).toBe(401)

			// Verify that sendEmail was not called
			expect(sendEmailMock).not.toHaveBeenCalled()
		})

		it('should not verify email with expired token', async () => {
			const user = await basicUser({ isVerified: false })
			const emailVerificationToken = await basicEmailVerificationToken({
				userId: user.id,
				expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
			})

			// Try to verify with an expired token
			const res = await client.post('/auth/verify-user', {
				token: emailVerificationToken.token,
				email: user.email,
			})
			expect(res.status).toBe(400)

			// Verify the expired token was deleted
			const [deletedToken] = await db
				.select()
				.from(emailVerificationTokens)
				.where(eq(emailVerificationTokens.token, emailVerificationToken.token))
			expect(deletedToken).toBeUndefined()

			// Verify a new token was created
			const [newToken] = await db
				.select()
				.from(emailVerificationTokens)
				.where(eq(emailVerificationTokens.userId, user.id))
			expect(newToken).toBeDefined()
			expect(newToken.token).toBeDefined()
			expect(newToken.expiresAt > new Date()).toBe(true)

			// Verify that sendEmail was called with the new token
			expect(sendEmailMock).toHaveBeenCalledTimes(1)
			expect(sendEmailMock).toHaveBeenCalledWith({
				to: user.email,
				subject: 'Verify Your Email Address',
				html: expect.stringContaining(
					`${env.ORIGIN}/verify-user?token=${newToken.token}&email=${user.email}`,
				),
			})
		})
	})

	describe('POST /auth/reset-password', () => {
		it('should reset password with valid token', async () => {
			// Create a user and a password reset token
			const user = await basicUser()
			const passwordResetToken = await basicPasswordResetToken({ userId: user.id })

			// new password to set
			const newPassword = 'NewPassword123!@#'

			// Use the password reset token to reset the password
			const res = await client.post('/auth/reset-password', {
				token: passwordResetToken.token,
				email: user.email,
				password: newPassword,
			})
			expect(res.status).toBe(200)

			// Verify password was changed by comparing the password hash
			const [updatedUser] = await db.select().from(users).where(eq(users.id, user.id))
			expect(updatedUser.passwordHash).not.toBe(user.passwordHash)
			expect(
				await comparePasswordHash({
					password: newPassword,
					// biome-ignore lint/style/noNonNullAssertion: <explanation>
					passwordHash: updatedUser.passwordHash!,
				}),
			).toBe(true)

			// Verify the token was deleted
			const [deletedToken] = await db
				.select()
				.from(passwordResetTokens)
				.where(eq(passwordResetTokens.token, passwordResetToken.token))
			expect(deletedToken).toBeUndefined()

			// Verify that sendEmail was not called
			expect(sendEmailMock).not.toHaveBeenCalled()
		})

		it('should not reset password with invalid token', async () => {
			const user = await basicUser()
			const passwordResetToken = await basicPasswordResetToken({ userId: user.id })

			// Try to reset with an invalid token
			const res = await client.post('/auth/reset-password', {
				token: 'invalid-token',
				email: user.email,
				password: 'NewPassword123!@#',
			})
			expect(res.status).toBe(401)

			// Verify the password reset token is not deleted
			const [existingToken] = await db
				.select()
				.from(passwordResetTokens)
				.where(eq(passwordResetTokens.token, passwordResetToken.token))
			expect(existingToken).toBeDefined()
		})

		it('should not reset password with expired token', async () => {
			const user = await basicUser()
			const passwordResetToken = await basicPasswordResetToken({
				userId: user.id,
				expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
			})

			const res = await client.post('/auth/reset-password', {
				token: passwordResetToken.token,
				email: user.email,
				password: 'NewPassword123!@#',
			})

			expect(res.status).toBe(401)
		})

		it('should not reset password with mismatched email', async () => {
			const user = await basicUser()
			const passwordResetToken = await basicPasswordResetToken({
				userId: user.id,
				expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
			})

			// Try to reset with different email
			const res = await client.post('/auth/reset-password', {
				token: passwordResetToken.token,
				email: 'different@example.com',
				password: 'NewPassword123!@#',
			})
			expect(res.status).toBe(401)
		})
	})

	describe('POST /auth/change-password', () => {
		it('should not change password if not authenticated', async () => {
			const res = await client.post('/auth/change-password', {
				currentPassword: 'test-password123!@#$',
				newPassword: 'NewPassword123!@#',
			})
			expect(res.status).toBe(401)
		})

		it('should change password with valid credentials', async () => {
			const user = await client.authenticate()
			const newPassword = 'NewPassword123!@#'

			const res = await client.post('/auth/change-password', {
				currentPassword: DEFAULT_TEST_USER.password,
				newPassword,
			})
			expect(res.status).toBe(200)

			// Verify the password was changed
			const [updatedUser] = await db.select().from(users).where(eq(users.id, user.id))
			expect(updatedUser.passwordHash).not.toBe(user.passwordHash)
			expect(
				await comparePasswordHash({
					password: newPassword,
					// biome-ignore lint/style/noNonNullAssertion: <explanation>
					passwordHash: updatedUser.passwordHash!,
				}),
			).toBe(true)
		})

		it('should not change password with invalid current password', async () => {
			const user = await client.authenticate()

			const res = await client.post('/auth/change-password', {
				currentPassword: 'invalid-password', // invalid current password
				newPassword: 'NewPassword123!@#',
			})
			expect(res.status).toBe(401)

			// Verify the password was not changed
			const [updatedUser] = await db.select().from(users).where(eq(users.id, user.id))
			expect(updatedUser.passwordHash).toBe(user.passwordHash)
		})

		it('should not change password with weak new password', async () => {
			await client.authenticate()

			const res = await client.post('/auth/change-password', {
				currentPassword: DEFAULT_TEST_USER.password,
				newPassword: '123', // weak password
			})
			expect(res.status).toBe(422)
		})
	})

	describe('E2E Auth Flow', () => {
		it('should register -> verify -> login -> forgot password -> reset password -> login -> change password -> login', async () => {
			// Register
			const data = {
				email: 'e2etest@example.com',
				password: 'Test123!@#$',
				name: 'E2E Test User',
			}
			const registerRes = await client.post('/auth/register', {
				email: data.email,
				name: data.name,
				password: data.password,
			})
			expect(registerRes.status).toBe(200)

			// Verify email
			const [user] = await db.select().from(users).where(eq(users.email, data.email))
			const [verificationToken] = await db
				.select()
				.from(emailVerificationTokens)
				.where(eq(emailVerificationTokens.userId, user.id))

			const verifyEmailRes = await client.post('/auth/verify-user', {
				token: verificationToken.token,
				email: user.email,
			})
			expect(verifyEmailRes.status).toBe(200)
			expect(sendEmailMock).toHaveBeenCalledTimes(1)
			expect(sendEmailMock).toHaveBeenCalledWith({
				to: user.email,
				subject: 'Verify Your Email Address',
				html: expect.stringContaining(
					`${env.ORIGIN}/verify-user?token=${verificationToken.token}&email=${user.email}`,
				),
			})

			// Login
			const loginRes = await client.post('/auth/login', {
				email: user.email,
				password: data.password,
			})
			expect(loginRes.status).toBe(200)

			// Logout
			await client.authenticate({ userId: user.id })
			const logoutRes = await client.post('/auth/logout')
			expect(logoutRes.status).toBe(200)

			// Forgot password
			const forgotPasswordRes = await client.post('/auth/forgot-password', {
				email: user.email,
			})
			expect(forgotPasswordRes.status).toBe(200)

			// Reset password
			const newPassword = 'NewPassword123!@#'
			const [passwordResetToken] = await db
				.select()
				.from(passwordResetTokens)
				.where(eq(passwordResetTokens.userId, user.id))

			const resetPasswordRes = await client.post('/auth/reset-password', {
				token: passwordResetToken.token,
				email: user.email,
				password: newPassword,
			})
			expect(resetPasswordRes.status).toBe(200)
			expect(sendEmailMock).toHaveBeenCalledTimes(2) // 1 for verification, 1 for reset password
			expect(sendEmailMock).toHaveBeenCalledWith({
				to: user.email,
				subject: 'Reset Your Password',
				html: expect.stringContaining(
					`${env.ORIGIN}/reset-password?token=${passwordResetToken.token}&email=${user.email}`,
				),
			})

			// Login
			const loginRes2 = await client.post('/auth/login', {
				email: user.email,
				password: newPassword,
			})
			expect(loginRes2.status).toBe(200)

			// Change password
			await client.authenticate({ userId: user.id })
			const changedPassword = 'ChangedPassword123!@#'
			const changePasswordRes = await client.post('/auth/change-password', {
				currentPassword: newPassword,
				newPassword: changedPassword,
			})
			expect(changePasswordRes.status).toBe(200)

			// Login
			const loginRes3 = await client.post('/auth/login', {
				email: user.email,
				password: changedPassword,
			})
			expect(loginRes3.status).toBe(200)
		})
	})
})
