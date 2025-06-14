import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { defaultColumns } from '../fns'
import { users } from './users'

export const passwordResetTokens = pgTable(
	'password_reset_tokens',
	{
		token: text('token').primaryKey(),
		userId: uuid('user_id')
			.references(() => users.id)
			.notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		...defaultColumns(),
	},
	(table) => [index('password_reset_tokens_user_id_idx').on(table.userId)],
)
