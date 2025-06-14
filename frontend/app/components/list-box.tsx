import React from 'react'
import {
	type ListBoxItemProps,
	ListBox as RACListBox,
	ListBoxItem as RACListBoxItem,
	type ListBoxProps as RACListBoxProps,
	composeRenderProps,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'
import { composeTailwindRenderProps } from './utils'

export interface ListBoxProps<T> extends Omit<RACListBoxProps<T>, 'layout' | 'orientation'> {}

export const ListBox = React.forwardRef(
	<T extends object>(props: ListBoxProps<T>, ref: React.Ref<HTMLDivElement>) => {
		return (
			<RACListBox
				{...props}
				ref={ref}
				className={composeTailwindRenderProps(props.className, ['outline-hidden'])}
			/>
		)
	},
) as <T extends object>(
	props: ListBoxProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.JSX.Element

export const ListBoxItem = React.forwardRef(
	(props: ListBoxItemProps, ref: React.Ref<HTMLLIElement>) => {
		const textValue =
			props.textValue || (typeof props.children === 'string' ? props.children : undefined)

		return (
			<RACListBoxItem
				{...props}
				ref={ref}
				textValue={textValue}
				className={composeRenderProps(
					props.className,
					(className, { isFocusVisible, isDisabled }) =>
						twMerge(
							'group relative flex outline-0',
							isDisabled && 'opacity-50',
							isFocusVisible && 'outline-2 outline-ring outline-offset-2',
							className,
						),
				)}
			/>
		)
	},
) as (props: ListBoxItemProps & { ref?: React.Ref<HTMLLIElement> }) => React.JSX.Element
