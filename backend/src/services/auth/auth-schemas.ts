import { z } from 'zod'

export const googleUserInfoSchema = z.object({
	sub: z.string().min(1),
	email: z.string().email(),
	name: z.string().min(1),
})
