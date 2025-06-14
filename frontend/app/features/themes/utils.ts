import { Theme } from './types'

export const themeAction = '/set-theme'

export const themes = Object.values(Theme)

export const prefersLightMQ = '(prefers-color-scheme: light)'

export const mediaQuery = typeof window !== 'undefined' ? window.matchMedia(prefersLightMQ) : null

export function getPreferredTheme() {
	return window.matchMedia(prefersLightMQ).matches ? Theme.LIGHT : Theme.DARK
}

export function isTheme(value: unknown) {
	return typeof value === 'string' && themes.includes(value as Theme)
}
