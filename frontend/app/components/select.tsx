import React from 'react'
import type { Key } from 'react-aria'
import {
	Button,
	Collection,
	Header,
	type ListBoxItemProps,
	ListBoxItem as RACListBoxItem,
	ListBoxSection as RACListBoxSection,
	type ListBoxSectionProps as RACListBoxSectionProps,
	Select as RACSelect,
	type SelectProps as RACSelectProps,
	SelectValue,
	composeRenderProps,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'
import { FieldError } from './field'
import { CheckIcon } from './icons/outline/check'
import { ChevronDownIcon } from './icons/outline/chevron-down'
import { ListBox, type ListBoxProps } from './list-box'
import { Popover, type PopoverProps } from './popover'
import { Small } from './text'
import type { Option, OptionGroup } from './types/option'
import { composeTailwindRenderProps, inputField } from './utils'

export function SelectRoot<T extends object>(props: RACSelectProps<T>) {
	return (
		<RACSelect
			{...props}
			data-ui='select'
			className={composeTailwindRenderProps(props.className, ['w-full min-w-56', inputField])}
		/>
	)
}

export function SelectButton(props: {
	className?: string
	children?: React.ReactNode
}) {
	return (
		<Button
			data-ui='control'
			className={composeRenderProps(
				props.className,
				(className, { isFocusVisible, isPressed, isHovered, isDisabled }) => {
					return twMerge(
						'group relative flex w-full cursor-default items-center gap-x-2 rounded-md border border-input text-start shadow-xs outline-hidden transition',
						'ps-3.5 pe-2.5',
						'py-[calc(--spacing(2.5)-1px)]',
						'sm:py-[calc(--spacing(1.5)-1px)]',
						'text-base/6 sm:text-sm/6',
						'group-data-invalid:border-red-600',
						isDisabled && 'cursor-not-allowed opacity-50',
						isHovered && ['bg-zinc-50 dark:bg-zinc-800'],
						isPressed && ['bg-zinc-50 dark:bg-zinc-800'],
						isHovered && isPressed && ['dark:bg-zinc-800'],
						isFocusVisible &&
							'border-ring ring-1 ring-ring group-data-invalid:border-ring',
						className,
					)
				},
			)}
		>
			{!!props.children && (
				<span className='flex items-center gap-x-2'>{props.children}</span>
			)}
			<SelectValue
				data-ui='select-value'
				className={twMerge([
					'flex-1 truncate data-placeholder:text-muted dark:data-placeholder:text-white',
					// Selected Item style
					'*:data-[ui=content]:flex',
					'*:data-[ui=content]:items-center',
					'*:data-[ui=content]:gap-x-1',
					'[&>[data-ui=content]_[data-ui=description]]:sr-only',
					'[&>[data-ui=content]:not(:hover)_[data-ui=icon]:not([class*=text-])]:text-muted',
					'[&>[data-ui=content]_[data-ui=icon]:not([class*=size-])]:size-5',
					'[&>[data-ui=content]_[role=img]]:size-6',
					'sm:[&>[data-ui=content]_[data-ui=icon]:not([class*=size-])]:size-4',
					'sm:[&>[data-ui=content]_[role=img]]:size-5',
				])}
			/>

			<ChevronDownIcon className='size-5 group-[&:not(:hover)]:text-muted/75 sm:size-4' />
		</Button>
	)
}

export const SelectPopover = React.forwardRef(
	(
		{ className, placement = 'bottom', ...props }: PopoverProps,
		ref: React.Ref<HTMLDivElement>,
	) => {
		return (
			<Popover
				{...props}
				ref={ref}
				className={composeTailwindRenderProps(className, ['w-(--trigger-width)'])}
				placement={placement}
			/>
		)
	},
)

export interface SelectListBoxProps<T>
	extends ListBoxProps<T>,
		React.RefAttributes<HTMLDivElement> {
	checkIconPlacement?: 'start' | 'end'
}

export const SelectListBox = React.forwardRef(
	<T extends object>(
		{ checkIconPlacement = 'end', ...props }: SelectListBoxProps<T>,
		ref: React.Ref<HTMLDivElement>, // Adjust ref type if ListBox renders something else
	) => {
		return (
			<ListBox
				{...props}
				ref={ref} // Forward the ref to ListBox
				data-check-icon-placement={checkIconPlacement}
				className={composeTailwindRenderProps(props.className, [
					'max-h-[inherit] overflow-auto',
					'flex flex-col',
					'p-1 has-[header]:pt-0',

					// Listbox item
					'**:data-[ui=content]:grid',
					'**:data-[ui=content]:grid-cols-[minmax(--spacing(4),max-content)_1fr]',
					'[&:has([data-ui=content]>[role=img])_[data-ui=content]]:grid-cols-[minmax(--spacing(5),max-content)_1fr]',
					'[&:has([data-ui=content]>[role=img]+[data-ui=label]+[data-ui=description])_[data-ui=content]]:grid-cols-[minmax(--spacing(7),max-content)_1fr]',

					'**:data-[ui=content]:items-center',
					'**:data-[ui=content]:gap-x-2',

					// Icon
					// '[&_[data-ui=content]>[data-ui=icon]:not([class*=size-])]:size-4',
					// '[&_[data-ui=content]:not(:hover)>[data-ui=icon]:not([class*=text-])]:text-muted',

					// Label
					'**:data-[ui=label]:col-span-full',
					'[&:has(:is([data-ui=icon],[role=img])+[data-ui=label])_[data-ui=label]]:col-start-2',
					'[&:has([data-ui=icon]+[data-ui=label])_[data-ui=content]:not(:has([data-ui=label]))]:ps-6',
					'[&_[data-ui=label]:has(+[data-ui=description])]:leading-5',

					// Description
					'[&:has(:is([data-ui=icon],[role=img])+[data-ui=label])_[data-ui=description]]:col-start-2',

					// Image
					'[&_[role=img]]:size-5',
					'[&:has([data-ui=description])_[role=img]]:size-7',
					'[&_[role=img]]:self-start',
					'[&_[role=img]]:mt-0.5',
					'[&_[role=img]]:row-start-1',
					'[&:has([data-ui=description])_[role=img]]:row-end-3',
				])}
			/>
		)
	},
) as <T extends object>(
	props: SelectListBoxProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.JSX.Element

export interface SectionProps<T> extends RACListBoxSectionProps<T> {
	title?: string | React.ReactNode
}

export function SelectSection<T extends object>(props: SectionProps<T>) {
	return (
		<RACListBoxSection
			className={twMerge(
				'not-first:mt-1.5',
				'border-border/75 not-first:border-t',
				props.className,
			)}
		>
			<Header
				className={twMerge(
					'sticky z-10 truncate bg-background ps-8 pt-2 text-muted text-xs/6',
					'inset-0 rounded-sm',
					'in-data-[check-icon-placement=end]:px-2',
				)}
			>
				{props.title}
			</Header>
			<Collection items={props.items}>{props.children}</Collection>
		</RACListBoxSection>
	)
}

interface SelectListItemProps extends ListBoxItemProps {
	destructive?: true
	checkIcon?: React.ReactNode
}

export const SelectListItem = React.forwardRef(
	({ destructive, checkIcon, ...props }: SelectListItemProps, ref: React.Ref<HTMLLIElement>) => {
		const textValue =
			props.textValue || (typeof props.children === 'string' ? props.children : undefined)

		return (
			<RACListBoxItem
				{...props}
				ref={ref}
				textValue={textValue}
				className={composeRenderProps(
					props.className,
					(className, { isFocused, isDisabled, isHovered }) =>
						twMerge(
							'group flex cursor-default select-none items-center gap-x-1.5 rounded-sm outline-hidden',
							'px-2 py-2.5 text-base/6 sm:py-1.5 sm:text-sm/6',
							'[&_[data-ui=icon]:not([class*=size-])]:size-4',
							isDisabled && 'opacity-50',
							(isFocused || isHovered) && 'bg-zinc-100 dark:bg-zinc-800',
							destructive
								? 'text-red-600'
								: '[&:not(:hover)_[data-ui=icon]:not([class*=text-])]:text-muted',

							className,
						),
				)}
			>
				{composeRenderProps(props.children, (children, { isSelected }) => {
					return (
						<>
							{checkIcon !== null && (
								<span
									className={twMerge(
										'flex h-[1lh] items-center self-start',
										'in-data-[check-icon-placement=end]:hidden',
										'in-data-[ui=select-value]:hidden',
										isSelected ? 'visible' : 'invisible',
									)}
								>
									{checkIcon ?? <CheckIcon className='size-4' />}
								</span>
							)}

							<div data-ui='content' className='w-full'>
								{children}
							</div>

							{checkIcon !== null && (
								<span
									className={twMerge(
										'flex h-[1lh] items-center self-start',
										'in-data-[ui=select-value]:hidden',
										'in-data-[check-icon-placement=start]:hidden',
										isSelected ? 'visible' : 'invisible',
									)}
								>
									{checkIcon ?? <CheckIcon className='size-4' />}
								</span>
							)}
						</>
					)
				})}
			</RACListBoxItem>
		)
	},
) as (props: SelectListItemProps & { ref?: React.Ref<HTMLLIElement> }) => React.JSX.Element

export function SelectListItemLabel({ className, ...props }: React.JSX.IntrinsicElements['span']) {
	return (
		<span
			{...props}
			slot='label'
			data-ui='label'
			className={twMerge('mb-0 w-full truncate', className)}
		/>
	)
}

export function SelectListItemDescription({
	className,
	...props
}: React.JSX.IntrinsicElements['span']) {
	return <Small {...props} slot='description' data-ui='description' className={className} />
}

interface SelectProps {
	name: string
	value: string
	onChange: (value: string) => void
	options: Option[] | OptionGroup[]
	className?: string
	disabled?: boolean
	error?: string
	placeholder?: string
}

export function Select({
	name,
	value,
	onChange,
	options,
	className,
	disabled,
	error,
	placeholder = 'Select an option',
}: SelectProps) {
	const handleSelectionChange = (selectedKey: Key | null) => {
		if (selectedKey !== null) {
			onChange?.(selectedKey.toString())
		}
	}

	const renderOptions = (options: Option[]) => {
		return options.map((option) => (
			<SelectListItem
				key={option.id}
				id={option.id}
				textValue={option.name}
				isDisabled={option.disabled}
			>
				{option.icon}
				<SelectListItemLabel>{option.name}</SelectListItemLabel>
				{option.description && (
					<SelectListItemDescription>{option.description}</SelectListItemDescription>
				)}
			</SelectListItem>
		))
	}

	const renderGroups = (groups: OptionGroup[]) => {
		return groups.map((group, index) => (
			<SelectSection key={index} title={group.title}>
				{renderOptions(group.options)}
			</SelectSection>
		))
	}

	const isGrouped = Array.isArray(options) && options.length > 0 && 'options' in options[0]

	return (
		<SelectRoot
			selectedKey={value ?? null}
			onSelectionChange={handleSelectionChange}
			name={name}
			className={className}
			isDisabled={disabled}
			isInvalid={!!error}
			placeholder={placeholder}
			aria-label={placeholder}
		>
			<SelectButton />
			<SelectPopover>
				<SelectListBox>
					{isGrouped
						? renderGroups(options as OptionGroup[])
						: renderOptions(options as Option[])}
				</SelectListBox>
			</SelectPopover>
			<FieldError>{error}</FieldError>
		</SelectRoot>
	)
}
