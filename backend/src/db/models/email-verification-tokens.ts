import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { defaultColumns } from '../fns'
import { users } from './users'

export const emailVerificationTokens = pgTable(
	'email_verification_tokens',
	{
		token: text('token').primaryKey(),
		userId: uuid('user_id')
			.references(() => users.id)
			.notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		...defaultColumns(),
	},
	(table) => [index('email_verification_tokens_user_id_idx').on(table.userId)],
)
