import { eq } from 'drizzle-orm'
import { serializeSigned } from 'hono/utils/cookie'
import { db } from '~/db'
import { sessions, users } from '~/db/models'
import { env } from '~/lib/env'
import { app } from '~/server/app'
import { SESSION_COOKIE_NAME, generateSecureToken, hashPassword } from '~/services/auth/auth-fns'

type Params = Record<string, string | number | boolean>

type RequestOptions = {
	method?: string
	headers?: Record<string, string>
	body?: string
	cookie?: string
	params?: Params
}

type TestResponse = {
	status: number
	headers: Headers
	// biome-ignore lint/suspicious/noExplicitAny: allow any type for tests
	data: any
}

type AuthenticatedUser = {
	id: string
	email: string
	name: string
	passwordHash: string | null
	isVerified: boolean
	createdAt: Date
	updatedAt: Date
}

export const DEFAULT_TEST_USER = {
	email: 'authenticated@domain.com',
	password: 'authenticated123$%',
}

export class TestClient {
	// the user which is making requests to authenticated routes within test runs
	// can access information about the user by calling `getUser()`
	// can override the user by calling `authenticate({ userId: 'some-user-id' })`
	// can clear the user by calling `clearAuthentication()`
	private user: AuthenticatedUser | null = null

	// the auth session which is being used for tests which call authenticated routes
	// session can be reset / overridden by calling `clearAuthentication()` and `authenticate()`
	private session: {
		id: string
	} | null = null

	private async createSessionForUser(userId: string) {
		const sessionId = generateSecureToken()
		await db.insert(sessions).values({
			sessionId,
			userId,
		})
		return sessionId
	}

	private async createSignedSessionCookie(sessionId: string) {
		const signedCookie = await serializeSigned(SESSION_COOKIE_NAME, sessionId, env.SIGNATURE)
		return signedCookie.split(';')[0]
	}

	private buildUrl(url: string, params?: Params) {
		let finalUrl = url === '/' ? '' : url

		if (params && Object.keys(params).length > 0) {
			const searchParams = new URLSearchParams()
			for (const [key, value] of Object.entries(params)) {
				searchParams.append(key, value.toString())
			}
			finalUrl = `${finalUrl}?${searchParams.toString()}`
		}

		return finalUrl
	}

	private buildHeaders(options: RequestOptions) {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			...options.headers,
		}

		if (options.cookie) {
			headers.Cookie = options.cookie
		}

		return headers
	}

	private async parseResponseData(response: Response) {
		const contentType = response.headers.get('content-type')
		return contentType?.includes('application/json') ? await response.json() : undefined
	}

	async makeRequest(url: string, options: RequestOptions = {}) {
		if (this.session) {
			options.cookie =
				options.cookie ?? (await this.createSignedSessionCookie(this.session.id))
		}

		const headers = this.buildHeaders(options)
		const finalUrl = this.buildUrl(url, options.params)

		const response = await app.request(finalUrl, {
			method: options.method ?? 'GET',
			headers,
			body: options.body,
		})

		const data = await this.parseResponseData(response)

		return {
			status: response.status,
			headers: response.headers,
			data,
		} as TestResponse
	}

	async get(path: string, params?: Params) {
		return this.makeRequest(path, { method: 'GET', params })
	}

	async post(path: string, body: unknown = {}, params?: Params) {
		return this.makeRequest(path, {
			method: 'POST',
			body: JSON.stringify(body),
			params,
		})
	}

	async patch(path: string, body: unknown = {}, params?: Params) {
		return this.makeRequest(path, {
			method: 'PATCH',
			body: JSON.stringify(body),
			params,
		})
	}

	async delete(path: string, params?: Params) {
		return this.makeRequest(path, {
			method: 'DELETE',
			params,
		})
	}

	getUser() {
		if (!this.user) {
			throw new Error('There is no authenticated user. Try calling `authenticate()`')
		}
		return this.user
	}

	async authenticate({ userId }: { userId?: string } = {}) {
		if (userId) {
			const sessionId = await this.createSessionForUser(userId)
			this.session = { id: sessionId }

			const user = (await db.select().from(users).where(eq(users.id, userId))).at(0)
			if (!user) throw new Error(`User with ID ${userId} not found`)

			this.user = user
		} else {
			const passwordHash = await hashPassword(DEFAULT_TEST_USER.password)

			const [user] = await db
				.insert(users)
				.values({
					email: DEFAULT_TEST_USER.email,
					name: 'Test User',
					passwordHash,
					isVerified: true,
				})
				.returning()

			const sessionId = await this.createSessionForUser(user.id)

			this.user = user
			this.session = { id: sessionId }
		}

		if (!this.user) throw new Error('Failed to authenticate user')

		return this.user
	}

	async clearAuthentication() {
		if (this.user) {
			await db.delete(sessions).where(eq(sessions.userId, this.user.id))
		}
		this.session = null
		this.user = null
	}
}
