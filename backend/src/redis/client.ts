import { RedisClient } from 'bun'
import { env } from '~/lib/env'

export const client = new RedisClient(`redis://${env.REDIS_HOST}:${env.REDIS_PORT}`)

await client.connect()
