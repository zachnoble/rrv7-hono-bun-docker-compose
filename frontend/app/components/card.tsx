import { twMerge } from 'tailwind-merge'

type Props = {
	children: React.ReactNode
	className?: string
}

export function Card({ children, className }: Props) {
	return (
		<div className={twMerge('overflow-hidden rounded-sm border bg-muted/2 p-4', className)}>
			{children}
		</div>
	)
}
