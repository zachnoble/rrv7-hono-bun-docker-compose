import { useEffect } from 'react'
import { Toaster as ToasterPrimitive, toast as rhToast, useToasterStore } from 'react-hot-toast'
import { ClientOnly } from '~/lib/client-only'
import type { Toast } from './types/toast'
import { toast } from './utils/toast'

const maxToasts = 4 // max number of toasts to show at once
const duration = 5000 // length a toast is visible

type Props = {
	toastData: Toast | null
}

export function Toaster({ toastData }: Props) {
	const { toasts } = useToasterStore()

	// render toasts which are received from the server in the root layout
	useEffect(() => {
		if (toastData) {
			toast(toastData)
		}
	}, [toastData])

	// auto dismiss toasts when maxToasts is reached
	useEffect(() => {
		const visibleToasts = toasts.filter((t) => t.visible)
		for (const toast of visibleToasts) {
			const index = visibleToasts.indexOf(toast)
			if (index + 1 >= maxToasts) {
				rhToast.dismiss(toast.id)
			}
		}
	}, [toasts])

	return (
		// only render on the client
		<ClientOnly>
			{() => <ToasterPrimitive position='top-center' toastOptions={{ duration }} />}
		</ClientOnly>
	)
}
