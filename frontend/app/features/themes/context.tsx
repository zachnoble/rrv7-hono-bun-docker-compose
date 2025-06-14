import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { createContext, useState } from 'react'
import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { useCallback } from 'react'
import { Theme, type ThemeMetadata } from './types'
import { getPreferredTheme, mediaQuery, themeAction, themes } from './utils'

function useBroadcastChannel<T = string>(
	channelName: string,
	handleMessage?: (event: MessageEvent) => void,
	handleMessageError?: (event: MessageEvent) => void,
): (data: T) => void {
	const channelRef = useRef(
		typeof window !== 'undefined' && 'BroadcastChannel' in window
			? new BroadcastChannel(`${channelName}-channel`)
			: null,
	)

	useChannelEventListener(channelRef, 'message', handleMessage)
	useChannelEventListener(channelRef, 'messageerror', handleMessageError)

	return useCallback((data: T) => {
		channelRef?.current?.postMessage(data)
	}, [])
}

function useChannelEventListener<K extends keyof BroadcastChannelEventMap>(
	channelRef: RefObject<BroadcastChannel | null>,
	event: K,
	handler: (e: BroadcastChannelEventMap[K]) => void = () => {},
) {
	// biome-ignore lint/correctness/useExhaustiveDependencies: exclude channelRef
	useEffect(() => {
		const channel = channelRef.current
		if (channel) {
			channel.addEventListener(event, handler)
			return () => channel.removeEventListener(event, handler)
		}
	}, [event, handler])
}

type ThemeContextType = [Theme | null, Dispatch<SetStateAction<Theme | null>>, ThemeMetadata]

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

type ThemeProviderProps = {
	children: ReactNode
	specifiedTheme: Theme | null
}

export function ThemeProvider({ children, specifiedTheme }: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme | null>(() => {
		// On the server, if we don't have a specified theme then we should
		// return null and the clientThemeCode will set the theme for us
		// before hydration. Then (during hydration), this code will get the same
		// value that clientThemeCode got so hydration is happy.
		if (specifiedTheme) {
			return themes.includes(specifiedTheme) ? specifiedTheme : null
		}

		// there's no way for us to know what the theme should be in this context
		// the client will have to figure it out before hydration.
		if (typeof window !== 'object') return null

		return getPreferredTheme()
	})

	const [themeDefinedBy, setThemeDefinedBy] = useState<ThemeMetadata['definedBy']>(
		specifiedTheme ? 'USER' : 'SYSTEM',
	)

	const broadcastThemeChange = useBroadcastChannel<{
		theme: Theme
		definedBy: ThemeMetadata['definedBy']
	}>('themes', (e) => {
		setTheme(e.data.theme)
		setThemeDefinedBy(e.data.definedBy)
	})

	useEffect(() => {
		if (themeDefinedBy === 'USER') {
			return () => {}
		}

		const handleChange = (ev: MediaQueryListEvent) => {
			setTheme(ev.matches ? Theme.LIGHT : Theme.DARK)
		}
		mediaQuery?.addEventListener('change', handleChange)
		return () => mediaQuery?.removeEventListener('change', handleChange)
	}, [themeDefinedBy])

	const handleThemeChange = useCallback<Dispatch<SetStateAction<Theme | null>>>(
		(value) => {
			const nextTheme = typeof value === 'function' ? value(theme) : value

			if (nextTheme === null) {
				const preferredTheme = getPreferredTheme()

				setTheme(preferredTheme)
				setThemeDefinedBy('SYSTEM')
				broadcastThemeChange({ theme: preferredTheme, definedBy: 'SYSTEM' })

				fetch(`${themeAction}`, {
					method: 'POST',
					body: JSON.stringify({ theme: null }),
				})
			} else {
				setTheme(nextTheme)
				setThemeDefinedBy('USER')

				broadcastThemeChange({ theme: nextTheme, definedBy: 'USER' })

				fetch(`${themeAction}`, {
					method: 'POST',
					body: JSON.stringify({ theme: nextTheme }),
				})
			}
		},
		[broadcastThemeChange, theme],
	)

	return (
		<ThemeContext.Provider value={[theme, handleThemeChange, { definedBy: themeDefinedBy }]}>
			{children}
		</ThemeContext.Provider>
	)
}
