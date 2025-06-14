import type { Context } from 'hono'

export type Login = {
	email: string
	password: string
}

export type GoogleLogin = {
	googleToken: string
}

export type ChangePassword = {
	userId: string
	currentPassword: string
	newPassword: string
}

export type ForgotPassword = {
	email: string
}

export type CreateSession = {
	userId: string
	c?: Context
}

export type CreateUser = {
	email: string
	name: string
	password?: string
	isVerified?: boolean
	googleId?: string
}

export type VerifyUser = {
	email: string
	token: string
}

export type ResetPassword = {
	email: string
	password: string
	token: string
}

export type SendPasswordResetEmail = {
	email: string
}

export type SendVerificationEmail = {
	email: string
	userId: string
}

export type VerifyPassword = {
	password: string
	passwordHash: string
}
