import type { Client, ClientResponse, RequestOptions } from './types'
import {
	combineHeaders,
	createURL,
	defaultHeaders,
	getDataFromResponse,
	handleResponseError,
	stringifiedBody,
} from './utils'

async function fetcher<T>(
	path: string,
	method: string,
	options: RequestOptions = {},
): Promise<ClientResponse<T>> {
	const url = createURL(path, options.params)
	const body = stringifiedBody(options.body)
	const headers = combineHeaders(options.headers, defaultHeaders)
	const { signal } = options

	const init: RequestInit = {
		method,
		headers,
		body,
		signal,
		credentials: 'include',
	}

	const response = await fetch(url, init)

	// If the response is a 4xx or 5xx, throw an error
	await handleResponseError(response)

	// Get the data from the response, automatically handle json vs text
	const data = await getDataFromResponse<T>(response)

	// Return the data and raw response object
	return { data, response }
}

function createBodyMethod(method: string, headers?: Headers) {
	return <T>(
		path: string,
		body?: unknown,
		options?: RequestOptions,
	): Promise<ClientResponse<T>> =>
		fetcher<T>(path, method, {
			...options,
			body,
			headers: combineHeaders(headers, options?.headers),
		})
}

function createNoBodyMethod(method: string, headers?: Headers) {
	return <T>(path: string, options?: RequestOptions): Promise<ClientResponse<T>> =>
		fetcher<T>(path, method, {
			...options,
			headers: combineHeaders(headers, options?.headers),
		})
}

function initMethods(headers?: Headers) {
	return {
		get: createNoBodyMethod('GET', headers),
		post: createBodyMethod('POST', headers),
		put: createBodyMethod('PUT', headers),
		patch: createBodyMethod('PATCH', headers),
		delete: createNoBodyMethod('DELETE', headers),
	}
}

export function createAPIClient(request?: Request): Client {
	if (request) {
		const headers = new Headers()

		const cookie = request.headers.get('cookie')
		if (cookie) {
			headers.set('Cookie', cookie)
		}

		return initMethods(headers)
	}
	return initMethods()
}

export const api = createAPIClient()
