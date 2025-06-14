import pino, { type LoggerOptions } from 'pino'
import { envServer } from '~/lib/env.server'

const developmentSettings: LoggerOptions = {
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
		},
	},
}

const productionSettings: LoggerOptions = {}

const testSettings: LoggerOptions = {
	level: 'silent',
}

const settings: Record<typeof envServer.NODE_ENV, LoggerOptions> = {
	development: developmentSettings,
	production: productionSettings,
	test: testSettings,
}

export const logger = pino(settings[envServer.NODE_ENV])
