import { type ReactNode, useSyncExternalStore } from 'react'

function subscribe() {
	return () => {}
}

function useHydrated() {
	return useSyncExternalStore(
		subscribe,
		() => true,
		() => false,
	)
}

type Props = {
	children(): ReactNode
	fallback?: ReactNode
}

export function ClientOnly({ children, fallback = null }: Props) {
	return useHydrated() ? children() : fallback
}
