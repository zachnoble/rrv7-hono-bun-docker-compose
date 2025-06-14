import type { StatusCode } from 'hono/utils/http-status'
import type { ZodError } from 'zod'

export class AppError extends Error {
	constructor(
		message: string,
		public status: StatusCode,
		public cause?: ZodError,
	) {
		super(message)
	}
}

export class BadRequestError extends AppError {
	constructor(message: string) {
		super(message, 400)
	}
}

export class UnauthorizedError extends AppError {
	constructor(message: string) {
		super(message, 401)
	}
}

export class ForbiddenError extends AppError {
	constructor(message: string) {
		super(message, 403)
	}
}

export class NotFoundError extends AppError {
	constructor(message: string) {
		super(message, 404)
	}
}

export class ConflictError extends AppError {
	constructor(message: string) {
		super(message, 409)
	}
}

export class UnprocessableEntityError extends AppError {
	constructor(message: string, cause?: ZodError) {
		super(message, 422, cause)
	}
}

export class InternalServerError extends AppError {
	constructor(message: string) {
		super(message, 500)
	}
}
