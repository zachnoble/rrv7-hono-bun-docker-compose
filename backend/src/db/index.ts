import { Connector, IpAddressTypes } from '@google-cloud/cloud-sql-connector'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env } from '~/lib/env'

const isProd = env.NODE_ENV === 'production'

let pool: Pool

if (isProd) {
	const instanceConnectionName = env.GCP_INSTANCE_CONNECTION_NAME

	if (!instanceConnectionName) {
		throw new Error('GCP_INSTANCE_CONNECTION_NAME is required in production')
	}

	const connector = new Connector()

	const clientOpts = await connector.getOptions({
		instanceConnectionName,
		ipType: IpAddressTypes.PUBLIC,
	})

	pool = new Pool({
		...clientOpts,
		user: env.DB_USER,
		password: env.DB_PASSWORD,
		database: env.DB_NAME,
	})
} else {
	pool = new Pool({
		user: env.DB_USER,
		password: env.DB_PASSWORD,
		host: env.DB_HOST,
		port: env.DB_PORT,
		database: env.DB_NAME,
	})
}

export const db = drizzle(pool)
