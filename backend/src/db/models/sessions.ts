import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { defaultColumns } from '../fns'
import { users } from './users'

export const sessions = pgTable(
	'sessions',
	{
		sessionId: text('session_id').primaryKey(),
		userId: uuid('user_id').references(() => users.id),
		...defaultColumns(),
	},
	(table) => [index('sessions_user_id_idx').on(table.userId)],
)
