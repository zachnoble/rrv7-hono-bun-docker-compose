import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import type { Context } from 'hono'
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie'
import { env } from '~/lib/env'
import type { VerifyPassword } from './auth-types'

export const SESSION_COOKIE_NAME = 'sessionId'

export const TOKEN_EXPIRATION_TIME = 24 * 60 * 60 * 1000 // 24 hours in ms

export const SESSION_EXPIRATION_TIME = 60 * 60 * 24 * 365 // 1 year in ms

export const GOOGLE_USER_INFO_API_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

export async function setSessionCookie(c: Context, sessionId: string) {
	const isProduction = env.NODE_ENV === 'production'

	await setSignedCookie(c, SESSION_COOKIE_NAME, sessionId, env.SIGNATURE, {
		path: '/',
		secure: isProduction,
		httpOnly: true,
		sameSite: isProduction ? 'Strict' : 'Lax',
		maxAge: SESSION_EXPIRATION_TIME,
	})
}

export async function getSessionIdFromCookie(c: Context) {
	return await getSignedCookie(c, env.SIGNATURE, SESSION_COOKIE_NAME)
}

export function deleteSessionCookie(c: Context) {
	deleteCookie(c, SESSION_COOKIE_NAME)
}

export function generateSecureToken(bytes = 64) {
	return randomBytes(bytes).toString('hex')
}

export async function hashPassword(password: string, saltRounds = 12) {
	return await bcrypt.hash(password, saltRounds)
}

export async function comparePasswordHash({ password, passwordHash }: VerifyPassword) {
	return await bcrypt.compare(password, passwordHash)
}

export function passwordResetEmailHtml(resetUrl: string) {
	return `
	  <!DOCTYPE html>
	  <html>
	  <head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Reset Your Password</title>
		<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
	  </head>
	  <body style="margin:0; padding:0; background-color:#f5f5f7; font-family:'Inter', sans-serif; color:#1d1d1f;">
		<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f7; padding:60px 0;">
		  <tr>
			<td align="center">
			  <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.03); max-width:100%;">
				<!-- Logo Area -->
				<tr>
				  <td align="center" style="padding:50px 40px 30px 40px;">
					<div style="width:40px; height:40px; background-color:#ef476f; border-radius:50%; margin-bottom:25px;"></div>
					<h1 style="color:#1d1d1f; margin:0; font-weight:500; font-size:22px; letter-spacing:-0.5px;">Reset your password</h1>
				  </td>
				</tr>
				
				<!-- Content -->
				<tr>
				  <td style="padding:0 40px 30px 40px;">
					<p style="margin:0 0 25px 0; font-size:15px; line-height:1.6; color:#4b4b4f; text-align:center;">
					  We received a request to reset your password. Use the button below to set up a new password for your account.
					</p>
				  </td>
				</tr>
				
				<!-- Button -->
				<tr>
				  <td align="center" style="padding:0 40px 40px 40px;">
					<table cellpadding="0" cellspacing="0">
					  <tr>
						<td style="background-color:#ef476f; border-radius:8px;">
						  <a href="${resetUrl}" style="display:inline-block; padding:14px 36px; color:#ffffff; text-decoration:none; font-weight:500; font-size:15px; letter-spacing:-0.2px;">Reset Password</a>
						</td>
					  </tr>
					</table>
				  </td>
				</tr>
				
				<!-- Divider -->
				<tr>
				  <td style="padding:0 40px;">
					<div style="height:1px; background-color:#f0f0f2;"></div>
				  </td>
				</tr>
				
				<!-- Note -->
				<tr>
				  <td style="padding:30px 40px 50px 40px;">
					<p style="margin:0; font-size:13px; line-height:1.6; color:#8e8e93; text-align:center;">
					  If you didn't request a password reset, you can safely ignore this email.<br>
					  This link will expire in 1 hour.
					</p>
				  </td>
				</tr>
			  </table>
			  
			  <!-- Footer -->
			  <table width="560" cellpadding="0" cellspacing="0" style="max-width:100%;">
				<tr>
				  <td style="padding:30px 40px; text-align:center;">
					<p style="margin:0; font-size:12px; color:#8e8e93;">© ${new Date().getFullYear()} Your Company</p>
				  </td>
				</tr>
			  </table>
			</td>
		  </tr>
		</table>
	  </body>
	  </html>
	`
}

export function verificationEmailHtml(verificationUrl: string) {
	return `
	  <!DOCTYPE html>
	  <html>
	  <head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Verify Your Email</title>
		<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
	  </head>
	  <body style="margin:0; padding:0; background-color:#f5f5f7; font-family:'Inter', sans-serif; color:#1d1d1f;">
		<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f7; padding:60px 0;">
		  <tr>
			<td align="center">
			  <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.03); max-width:100%;">
				<!-- Logo Area -->
				<tr>
				  <td align="center" style="padding:50px 40px 30px 40px;">
					<div style="width:40px; height:40px; background-color:#ef476f; border-radius:50%; margin-bottom:25px;"></div>
					<h1 style="color:#1d1d1f; margin:0; font-weight:500; font-size:22px; letter-spacing:-0.5px;">Verify your email</h1>
				  </td>
				</tr>
				
				<!-- Content -->
				<tr>
				  <td style="padding:0 40px 30px 40px;">
					<p style="margin:0 0 25px 0; font-size:15px; line-height:1.6; color:#4b4b4f; text-align:center;">
					  Thanks for signing up. To complete your registration and access your account, please verify your email address.
					</p>
				  </td>
				</tr>
				
				<!-- Button -->
				<tr>
				  <td align="center" style="padding:0 40px 40px 40px;">
					<table cellpadding="0" cellspacing="0">
					  <tr>
						<td style="background-color:#ef476f; border-radius:8px;">
						  <a href="${verificationUrl}" style="display:inline-block; padding:14px 36px; color:#ffffff; text-decoration:none; font-weight:500; font-size:15px; letter-spacing:-0.2px;">Verify Email</a>
						</td>
					  </tr>
					</table>
				  </td>
				</tr>
				
				<!-- Divider -->
				<tr>
				  <td style="padding:0 40px;">
					<div style="height:1px; background-color:#f0f0f2;"></div>
				  </td>
				</tr>
				
				<!-- Note -->
				<tr>
				  <td style="padding:30px 40px 50px 40px;">
					<p style="margin:0; font-size:13px; line-height:1.6; color:#8e8e93; text-align:center;">
					  If you didn't create an account, no further action is required.<br>
					  This link will expire in 24 hours.
					</p>
				  </td>
				</tr>
			  </table>
			  
			  <!-- Footer -->
			  <table width="560" cellpadding="0" cellspacing="0" style="max-width:100%;">
				<tr>
				  <td style="padding:30px 40px; text-align:center;">
					<p style="margin:0; font-size:12px; color:#8e8e93;">© ${new Date().getFullYear()} Your Company</p>
				  </td>
				</tr>
			  </table>
			</td>
		  </tr>
		</table>
	  </body>
	  </html>
	`
}
