import React from 'react'
import {
	DatePickerStateContext,
	type DateValue,
	Group,
	DatePicker as RACDatePicker,
	type DatePickerProps as RACDatePickerProps,
	composeRenderProps,
	useLocale,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'
import { Button } from './button'
import { Calendar, type YearRange } from './calendar'
import { DateInput, type DateInputProps } from './date-field'
import { Dialog } from './dialog'
import { CalendarIcon } from './icons/outline/calendar'
import { Popover } from './popover'
import { inputField } from './utils'

export interface DatePickerProps<T extends DateValue> extends RACDatePickerProps<T> {}

export function DatePicker<T extends DateValue>(props: DatePickerProps<T>) {
	return (
		<RACDatePicker
			{...props}
			className={composeRenderProps(props.className, (className) => {
				return twMerge(inputField, className)
			})}
		/>
	)
}

export function DatePickerInput({
	yearRange,
	...props
}: DateInputProps & { yearRange?: YearRange }) {
	return (
		<>
			<Group
				data-ui='control'
				{...props}
				className={['group', 'grid w-auto min-w-52', 'grid-cols-[1fr_auto]'].join(' ')}
			>
				<DateInput
					{...props}
					className={composeRenderProps(props.className, (className) =>
						twMerge('col-span-full', 'row-start-1', 'sm:pe-8', 'pe-9', className),
					)}
				/>
				<Button
					variant='plain'
					size='sm'
					isIconOnly
					data-ui='trigger'
					className={[
						'me-1',
						'focus-visible:-outline-offset-1',
						'row-start-1',
						'-col-end-1',
						'place-self-center',
						'hover:bg-transparent',
						'text-muted/75 group-hover:text-foreground',
					].join(' ')}
				>
					<CalendarIcon />
				</Button>
			</Group>

			<Popover placement='bottom' className='rounded-xl'>
				<Dialog>
					<Calendar yearRange={yearRange} />
				</Dialog>
			</Popover>
		</>
	)
}

export function DatePickerButton({
	className,
	children,
}: {
	className?: string
	children?: React.ReactNode
}) {
	const { locale } = useLocale()
	const state = React.useContext(DatePickerStateContext)
	const formattedDate = state?.formatValue(locale, {})

	return (
		<>
			<Group data-ui='control'>
				<Button
					className={twMerge(
						'w-full min-w-52 flex-1 justify-between border-input px-3 font-normal leading-6',
						className,
					)}
					variant='outline'
				>
					{formattedDate === '' ? (
						<span className='text-muted'>{children}</span>
					) : (
						<span>{formattedDate}</span>
					)}

					<CalendarIcon className='text-muted group-hover:text-foreground' />
				</Button>

				<DateInput className='hidden' aria-hidden />
			</Group>

			<Popover placement='bottom' className='rounded-xl'>
				<Dialog>
					<Calendar />
				</Dialog>
			</Popover>
		</>
	)
}
