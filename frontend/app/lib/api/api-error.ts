export class APIError extends Error {
	constructor(public message: string) {
		super(message)
	}
}
