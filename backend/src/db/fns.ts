import { timestamp } from 'drizzle-orm/pg-core'

export function timestamptz(columnName: string) {
	return timestamp(columnName, { withTimezone: true })
}

export function defaultColumns() {
	return {
		createdAt: timestamptz('created_at').notNull().defaultNow(),
		updatedAt: timestamptz('updated_at')
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	}
}
