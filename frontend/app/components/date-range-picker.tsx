import React from 'react'
import {
	DateRangePicker as AriaDateRangePicker,
	type DateRangePickerProps as AriaDateRangePickerProps,
	DateRangePickerStateContext,
	type DateValue,
	Group,
	useLocale,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'
import { Button } from './button'
import { DateInput } from './date-field'
import { Dialog } from './dialog'
import { CalendarIcon } from './icons/outline/calendar'
import { Popover } from './popover'
import { RangeCalendar } from './range-calendar'
import { composeTailwindRenderProps, inputField } from './utils'

export interface DateRangePickerProps<T extends DateValue> extends AriaDateRangePickerProps<T> {}

export function DateRangePicker<T extends DateValue>({ ...props }: DateRangePickerProps<T>) {
	return (
		<AriaDateRangePicker
			{...props}
			className={composeTailwindRenderProps(props.className, inputField)}
		/>
	)
}

export function DateRangePickerInput() {
	return (
		<>
			<Group
				data-ui='control'
				className={({ isFocusWithin }) =>
					twMerge(
						'grid grid-cols-[auto_16px_auto_1fr] items-center',
						'group relative rounded-md border border-input shadow-xs',
						'group-data-invalid:border-red-600',
						'[&:has(_input[data-disabled=true])]:border-border/50',
						'[&:has([data-ui=date-segment][aria-readonly])]:bg-zinc-800/5',
						'dark:[&:has([data-ui=date-segment][aria-readonly])]:bg-white/10',
						isFocusWithin
							? 'border-ring ring-1 ring-ring group-data-invalid:border-ring'
							: '[&:has([data-ui=date-segment][aria-readonly])]:border-transparent',
					)
				}
			>
				<DateInput
					slot='start'
					className={[
						'flex min-w-fit border-none shadow-none focus-within:ring-0',
						'[&:has([data-ui=date-segment][aria-readonly])]:bg-transparent',
						'dark:[&:has([data-ui=date-segment][aria-readonly])]:bg-transparent',
					].join(' ')}
				/>
				<span
					aria-hidden='true'
					className='place-self-center text-muted group-data-disabled:opacity-50'
				>
					–
				</span>
				<DateInput
					slot='end'
					className={[
						'flex min-w-fit border-none opacity-100 shadow-none focus-within:ring-0',
						'[&:has([data-ui=date-segment][aria-readonly])]:bg-transparent',
						'dark:[&:has([data-ui=date-segment][aria-readonly])]:bg-transparent',
					].join(' ')}
				/>
				<Button
					variant='plain'
					isIconOnly
					size='sm'
					className='focus-visible:-outline-offset-1 me-1 justify-self-end text-muted/75 hover:bg-transparent group-hover:text-foreground'
				>
					<CalendarIcon />
				</Button>
			</Group>
			<Popover placement='bottom' className='rounded-xl'>
				<Dialog>
					<RangeCalendar />
				</Dialog>
			</Popover>
		</>
	)
}

export function DateRangePickerButton({
	className,
	children,
}: {
	className?: string
	children?: React.ReactNode
}) {
	const { locale } = useLocale()
	const state = React.useContext(DateRangePickerStateContext)
	const formattedValue = state?.formatValue(locale, {})

	return (
		<>
			<Group data-ui='control'>
				<Button
					variant='outline'
					className={twMerge(
						'w-full min-w-64 border-input px-0 font-normal sm:px-0',
						className,
					)}
				>
					<div
						className={twMerge(
							'grid w-full items-center',
							formattedValue
								? 'grid grid-cols-[1fr_16px_1fr_36px]'
								: 'grid-cols-[1fr_36px]',
						)}
					>
						{formattedValue ? (
							<>
								<span className='min-w-fit px-3 text-base/6 sm:text-sm/6'>
									{formattedValue.start}
								</span>
								<span
									aria-hidden='true'
									className='place-self-center text-muted group-data-disabled:opacity-50'
								>
									–
								</span>
								<span className='min-w-fit px-3 text-base/6 sm:text-sm/6'>
									{formattedValue.end}
								</span>
							</>
						) : (
							<span className='justify-self-start px-3 text-muted'>{children}</span>
						)}

						<CalendarIcon className='place-self-center text-muted group-hover:text-foreground' />
					</div>
				</Button>

				<DateInput slot='start' aria-hidden className='hidden' />
				<DateInput slot='end' aria-hidden className='hidden' />
			</Group>
			<Popover placement='bottom' className='rounded-xl'>
				<Dialog>
					<RangeCalendar />
				</Dialog>
			</Popover>
		</>
	)
}
