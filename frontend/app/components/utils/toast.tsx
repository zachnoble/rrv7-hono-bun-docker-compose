import { toast as rhToast } from 'react-hot-toast'
import { Toast as ToastComponent } from '../toast'
import type { Toast as ToastType } from '../types/toast'

export function toast(toast: ToastType) {
	rhToast.custom((t) => <ToastComponent toast={{ ...toast, id: t.id }} />)
}
