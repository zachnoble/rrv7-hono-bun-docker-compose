import {
	replace,
	type unstable_MiddlewareFunction,
	type unstable_RouterContextProvider,
	unstable_createContext,
} from 'react-router'
import { client } from '~/lib/api/middleware.server'
import type { User } from './types/user'

type AuthContext = {
	user: User | null
}

const authContext = unstable_createContext<AuthContext | null>(null)

export function authMiddleware(): unstable_MiddlewareFunction {
	return async ({ context, request }, next) => {
		const cookie = request.headers?.get('Cookie')
		const hasSessionId = Boolean(cookie?.match(/sessionId=([^;]+)/))

		if (hasSessionId) {
			try {
				const api = client(context)
				const { data: user } = await api.get<User>('/auth/user')
				context.set(authContext, { user })
			} catch {
				context.set(authContext, null)
			}
		} else {
			context.set(authContext, null)
		}

		return await next()
	}
}

export function getUser(context: unstable_RouterContextProvider) {
	return context.get(authContext)?.user ?? null
}

export function requireAuth(context: unstable_RouterContextProvider) {
	const user = getUser(context)
	if (!user) throw replace('/login')
	return user
}

export function requireGuest(context: unstable_RouterContextProvider) {
	const user = getUser(context)
	if (user) throw replace('/')
	return null
}
