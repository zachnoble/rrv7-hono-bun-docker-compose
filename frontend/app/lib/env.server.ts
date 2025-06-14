import { z } from 'zod'

declare global {
	interface Window {
		ENV: typeof envClient
	}
}

type Environment = Env['NODE_ENV']

// Environment-specific defaults
const environmentDefaults: Record<Environment, Partial<Env>> = {
	test: {
		PORT: 5173,
		API_URL: 'http://localhost:8080',
		SIGNATURE: 'test-signature',
		GCP_RECAPTCHA_SITE_KEY: '', // not required in test environment
		GCP_OAUTH_CLIENT_ID: '', // not required in test environment
	},
	development: {
		PORT: 5173,
		API_URL: 'http://localhost:8080',
		GCP_RECAPTCHA_SITE_KEY: '', // not required in development environment
		GCP_OAUTH_CLIENT_ID: '', // not required in development environment
	},
	production: {},
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

const schema = z.object({
	NODE_ENV: z.enum(['test', 'development', 'production']),
	PORT: z.coerce.number(),
	API_URL: z.string().min(1),
	SIGNATURE: z.string().min(1),
	GCP_RECAPTCHA_SITE_KEY: z.string(),
	GCP_OAUTH_CLIENT_ID: z.string(),
})

type Env = z.infer<typeof schema>

const { API_URL, NODE_ENV, PORT, SIGNATURE, GCP_RECAPTCHA_SITE_KEY, GCP_OAUTH_CLIENT_ID } =
	schema.parse(getEnvironmentWithDefaults())

// Only include ENV variables which are safe to send to the client
// to access the env variables in the client, use window.ENV
export const envClient = {
	GCP_RECAPTCHA_SITE_KEY,
	GCP_OAUTH_CLIENT_ID,
	// replace docker network name with localhost when in browser in dev
	API_URL:
		NODE_ENV === 'development'
			? API_URL.replace(/(http:\/\/)[^/:"]+(:\d+)/g, '$1localhost$2')
			: API_URL,
	NODE_ENV,
}

export const envServer = {
	...envClient,
	SIGNATURE,
	PORT,
}
