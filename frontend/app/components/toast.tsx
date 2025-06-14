import { toast as rhToast } from 'react-hot-toast'
import { XIcon } from './icons/outline/x'
import { CheckCircleIcon } from './icons/solid/check-circle'
import { ExclamationTriangleIcon } from './icons/solid/exclamation-triangle'
import { InformationCircleIcon } from './icons/solid/information-circle'
import { XCircleIcon } from './icons/solid/x-circle'
import type { Toast as ToastType } from './types/toast'

const toastConfig = {
	success: {
		icon: <CheckCircleIcon className='size-6' />,
		title: 'Success',
	},
	error: {
		icon: <XCircleIcon className='size-6 text-red-500' />,
		title: 'Error',
	},
	info: {
		icon: <InformationCircleIcon className='size-6 text-rose-400' />,
		title: 'Notice',
	},
	warning: {
		icon: <ExclamationTriangleIcon className='size-6 text-yellow-500' />,
		title: 'Warning',
	},
}

interface Props {
	toast: ToastType & { id: string }
}

export function Toast({ toast }: Props) {
	const { type = 'info', title, message, id } = toast

	return (
		<div className='fade-in pointer-events-auto animate-in rounded-md border border-border/80 bg-background duration-300'>
			<div className='flex h-full items-center'>
				<div className='flex items-center px-3 pt-2 pb-2.5'>
					<div>{toastConfig[type].icon}</div>
					<div className='mx-3 min-w-[175px] max-w-[275px]'>
						<p className='font-semibold text-sm'>{title ?? toastConfig[type].title}</p>
						<p className='text-muted text-xs'>{message}</p>
					</div>
				</div>

				<button
					type='button'
					onClick={() => rhToast.remove(id)}
					className='mr-2 rounded-[50%] p-2.5 font-medium text-muted text-xs hover:bg-muted/3'
				>
					<XIcon className='size-3.5' />
				</button>
			</div>
		</div>
	)
}
