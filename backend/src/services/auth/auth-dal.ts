import { eq } from 'drizzle-orm'
import { db } from '~/db'
import { emailVerificationTokens, passwordResetTokens, sessions, users } from '~/db/models'

export async function getUserByEmail(email: string) {
	return (await db.select().from(users).where(eq(users.email, email)).limit(1)).at(0)
}

export async function getUserById(id: string) {
	return (await db.select().from(users).where(eq(users.id, id)).limit(1)).at(0)
}

export async function getUserByGoogleId(googleId: string) {
	return (await db.select().from(users).where(eq(users.googleId, googleId)).limit(1)).at(0)
}

export async function getUserBySessionId(sessionId: string) {
	return (
		await db
			.select({ id: users.id, name: users.name, email: users.email })
			.from(sessions)
			.innerJoin(users, eq(users.id, sessions.userId))
			.where(eq(sessions.sessionId, sessionId))
			.limit(1)
	).at(0)
}

export async function getEmailVerificationToken(token: string) {
	return (
		await db
			.select()
			.from(emailVerificationTokens)
			.where(eq(emailVerificationTokens.token, token))
			.limit(1)
	).at(0)
}

export async function getPasswordResetToken(token: string) {
	return (
		await db
			.select()
			.from(passwordResetTokens)
			.where(eq(passwordResetTokens.token, token))
			.limit(1)
	).at(0)
}
