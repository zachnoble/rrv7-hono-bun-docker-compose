import { boolean, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { defaultColumns } from '../fns'

export const users = pgTable('users', {
	id: uuid().defaultRandom().primaryKey(),
	email: text().notNull().unique(),
	name: text().notNull(),
	passwordHash: text('password_hash'),
	googleId: text('google_id').unique(),
	isVerified: boolean('is_verified').notNull().default(false),
	...defaultColumns(),
})
