import { Resend } from 'resend'
import { env } from './env'

type Options = {
	from?: string
	to: string
	subject: string
	html: string
}

export const resend = new Resend(env.RESEND_API_KEY)

export function sendEmail(options: Options) {
	const { from = env.EMAIL_FROM, to, subject, html } = options

	return resend.emails.send({
		from,
		to,
		subject,
		html,
	})
}
