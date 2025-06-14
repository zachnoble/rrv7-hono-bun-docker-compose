import {
	type unstable_MiddlewareFunction,
	type unstable_RouterContextProvider,
	unstable_createContext,
} from 'react-router'
import { createAPIClient } from '../api/client'
import type { Client } from './types'

type APIClientContext = {
	client: Client
}

export const apiClientContext = unstable_createContext<APIClientContext | null>(null)

export function apiClientMiddleware(): unstable_MiddlewareFunction {
	return async ({ context, request }, next) => {
		const client = createAPIClient(request)
		context.set(apiClientContext, { client })
		return await next()
	}
}

export function client(context: unstable_RouterContextProvider) {
	const client = context.get(apiClientContext)?.client
	if (!client) throw new Error('Client called outside of API Client Context')
	return client
}
