import { parseError } from '~/lib/errors/parse-error'
import { APIError } from './api-error'
import type { Params } from './types'

const baseUrl = typeof window === 'undefined' ? Bun.env.API_URL : window.ENV.API_URL

export const defaultHeaders = {
	'Content-Type': 'application/json',
}

export function combineHeaders(...headers: (HeadersInit | null | undefined)[]) {
	const combined = new Headers()
	for (const header of headers) {
		if (!header) continue

		for (const [key, value] of new Headers(header).entries()) {
			combined.append(key, value)
		}
	}
	return combined
}

export function createURL(path: string, params?: Params) {
	const url = new URL(path, baseUrl)
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== null && value !== undefined) {
				url.searchParams.append(key, String(value))
			}
		}
	}
	return url.toString()
}

export function stringifiedBody(body: unknown) {
	return body ? JSON.stringify(body) : undefined
}

export async function handleResponseError(response: Response) {
	if (!response.ok) {
		const data = await response.json()
		const message = parseError(data)
		throw new APIError(message)
	}
}

export async function getDataFromResponse<T>(response: Response) {
	const contentType = response.headers.get('content-type') ?? ''
	const data = contentType.includes('application/json')
		? await response.json()
		: await response.text()
	return data as T
}
