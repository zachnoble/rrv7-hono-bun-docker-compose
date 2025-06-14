export type Params = Record<string, string | number | null | undefined>

export type RequestOptions = Omit<RequestInit, 'body'> & {
	params?: Params
	body?: unknown
	signal?: AbortSignal
}

export type ClientResponse<T> = {
	data: T
	response: Response
}

export type APIErrorResponse = {
	error: {
		message: string
	}
}

export type Client = {
	get: <T>(path: string, options?: RequestOptions) => Promise<ClientResponse<T>>
	post: <T>(path: string, body?: unknown, options?: RequestOptions) => Promise<ClientResponse<T>>
	put: <T>(path: string, body?: unknown, options?: RequestOptions) => Promise<ClientResponse<T>>
	patch: <T>(path: string, body?: unknown, options?: RequestOptions) => Promise<ClientResponse<T>>
	delete: <T>(path: string, options?: RequestOptions) => Promise<ClientResponse<T>>
}
