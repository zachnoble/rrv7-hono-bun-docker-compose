type SearchParams = Record<string, string | undefined>

type RequestOrUrl = Request | Request['url']

export function getSearchParams(request: RequestOrUrl): SearchParams {
	const url = request instanceof Request ? request.url : request
	return Object.fromEntries(new URL(url).searchParams)
}
