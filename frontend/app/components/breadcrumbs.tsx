import {
	Breadcrumb as RACBreadcrumb,
	type BreadcrumbProps as RACBreadcrumbProps,
	Breadcrumbs as RACBreadcrumbs,
	type BreadcrumbsProps as RACBreadcrumbsProps,
	composeRenderProps,
} from 'react-aria-components'
import { Link, type LinkProps } from 'react-router'
import { twMerge } from 'tailwind-merge'
import { ChevronRightIcon } from './icons/outline/chevron-right'

export function Breadcrumbs<T extends object>({ className, ...props }: RACBreadcrumbsProps<T>) {
	return <RACBreadcrumbs {...props} className={twMerge('flex gap-1', className)} />
}

type BreadcrumbProps = RACBreadcrumbProps & LinkProps

export function Breadcrumb(props: BreadcrumbProps) {
	return (
		<RACBreadcrumb
			{...props}
			className={composeRenderProps(
				props.className as RACBreadcrumbProps['className'],
				(className) => {
					return twMerge('flex items-center gap-1', className)
				},
			)}
		>
			<Link {...props} className='underline underline-offset-4' />
			{props.to && <ChevronRightIcon className='size-4 text-muted' />}
		</RACBreadcrumb>
	)
}
