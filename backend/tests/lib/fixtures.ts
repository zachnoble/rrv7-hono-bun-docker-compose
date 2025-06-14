import { db } from '~/db'
import { emailVerificationTokens, passwordResetTokens, sessions, users } from '~/db/models'
import { generateSecureToken, hashPassword } from '~/services/auth/auth-fns'

export async function basicUser(
	overrides: Partial<typeof users.$inferInsert> & { password?: string } = {},
) {
	const password = overrides.password ?? 'test-password123!@#$'
	const passwordHash = await hashPassword(password, 2)

	const [user] = await db
		.insert(users)
		.values({
			email: 'test@example.com',
			name: 'Test User',
			password,
			passwordHash,
			isVerified: true,
			...overrides,
		})
		.returning()

	return {
		...user,
		password,
	}
}

export async function basicEmailVerificationToken(
	overrides: Partial<typeof emailVerificationTokens.$inferInsert> & { userId: string },
) {
	const [emailVerificationToken] = await db
		.insert(emailVerificationTokens)
		.values({
			token: generateSecureToken(),
			expiresAt: new Date(Date.now() + 1000),
			...overrides,
		})
		.returning()
	return emailVerificationToken
}

export async function basicPasswordResetToken(
	overrides: Partial<typeof passwordResetTokens.$inferInsert> & { userId: string },
) {
	const [passwordResetToken] = await db
		.insert(passwordResetTokens)
		.values({
			token: generateSecureToken(),
			expiresAt: new Date(Date.now() + 1000),
			...overrides,
		})
		.returning()
	return passwordResetToken
}

export async function basicSession(
	overrides: Partial<typeof sessions.$inferInsert> & { userId: string },
) {
	const [session] = await db
		.insert(sessions)
		.values({
			sessionId: generateSecureToken(),
			...overrides,
		})
		.returning()
	return session
}
