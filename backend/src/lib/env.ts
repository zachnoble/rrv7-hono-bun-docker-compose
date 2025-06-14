import { z } from 'zod'

type Env = z.infer<typeof schema>

type Environment = Env['NODE_ENV']

// Environment-specific defaults
const environmentDefaults: Record<Environment, Partial<Env>> = {
	test: {
		PORT: 8080,
		ORIGIN: 'http://localhost:5173',
		DB_USER: 'postgres',
		DB_PASSWORD: 'postgres',
		DB_NAME: 'postgres',
		DB_HOST: 'localhost',
		DB_PORT: 5432,
		REDIS_HOST: 'localhost',
		REDIS_PORT: 6379,
		RESEND_API_KEY: 'test-key',
		EMAIL_FROM: 'test@domain.com',
		SIGNATURE: 'test-signature',
	},
	development: {
		PORT: 8080,
		ORIGIN: 'http://localhost:5173',
		DB_USER: 'postgres',
		DB_PASSWORD: 'postgres',
		DB_NAME: 'postgres',
		DB_HOST: 'localhost',
		DB_PORT: 5432,
		REDIS_HOST: 'localhost',
		REDIS_PORT: 6379,
	},
	production: {
		PORT: 8080,
	},
}

// Get environment with defaults applied
function getEnvironmentWithDefaults() {
	const nodeEnv = Bun.env.NODE_ENV as Environment
	const defaults = environmentDefaults[nodeEnv]

	// Merge defaults with actual environment variables (env vars take precedence)
	return {
		...defaults,
		...Bun.env,
	}
}

const schema = z
	.object({
		// Environment
		NODE_ENV: z.enum(['test', 'development', 'production']),

		// PORT
		PORT: z.coerce.number(),

		// Frontend URL
		ORIGIN: z.string().min(1),

		// Signature
		SIGNATURE: z.string().min(1),

		// Postgres
		DB_USER: z.string().min(1),
		DB_PASSWORD: z.string().min(1),
		DB_HOST: z.string().min(1),
		DB_NAME: z.string().min(1),
		DB_PORT: z.coerce.number(),

		// Redis
		REDIS_HOST: z.string().min(1),
		REDIS_PORT: z.coerce.number(),

		// GCP config
		GCP_INSTANCE_CONNECTION_NAME: z.string().optional(),
		GCP_PROJECT_ID: z.string().optional(),
		GCP_RECAPTCHA_API_KEY: z.string().optional(),
		GCP_RECAPTCHA_SITE_KEY: z.string().optional(),

		// Email with Resend
		RESEND_API_KEY: z.string().min(1),
		EMAIL_FROM: z.string().email(),
	})
	.superRefine((data, ctx) => {
		if (data.NODE_ENV === 'production') {
			if (!data.GCP_INSTANCE_CONNECTION_NAME) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'GCP_INSTANCE_CONNECTION_NAME is required in production',
					path: ['GCP_INSTANCE_CONNECTION_NAME'],
				})
			}
			if (!data.GCP_PROJECT_ID) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'GCP_PROJECT_ID is required in production',
					path: ['GCP_PROJECT_ID'],
				})
			}
			if (!data.GCP_RECAPTCHA_API_KEY) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'GCP_RECAPTCHA_API_KEY is required in production',
					path: ['GCP_RECAPTCHA_API_KEY'],
				})
			}
			if (!data.GCP_RECAPTCHA_SITE_KEY) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'GCP_RECAPTCHA_SITE_KEY is required in production',
					path: ['GCP_RECAPTCHA_SITE_KEY'],
				})
			}
		}
	})

export const env = schema.parse(getEnvironmentWithDefaults())
