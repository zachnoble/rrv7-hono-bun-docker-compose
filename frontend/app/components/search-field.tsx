import {
	Group,
	type InputProps,
	SearchField as RACSearchField,
	type SearchFieldProps as RACSearchFieldProps,
} from 'react-aria-components'
import { Button } from './button'
import { FieldInput } from './field'
import { SearchIcon } from './icons/outline/search'
import { SpinnerIcon } from './icons/outline/spinner'
import { XIcon } from './icons/outline/x'
import { composeTailwindRenderProps, inputField } from './utils'

export interface SearchFieldProps extends RACSearchFieldProps {}

export function SearchField(props: SearchFieldProps) {
	return (
		<RACSearchField
			{...props}
			className={composeTailwindRenderProps(props.className, inputField)}
		/>
	)
}

export function SearchInput({ isPending, ...props }: InputProps & { isPending?: boolean }) {
	return (
		<Group
			data-ui='control'
			className={[
				'isolate',
				'grid',
				'grid-cols-[calc(theme(size.5)+20px)_1fr_calc(theme(size.5)+20px)]',
				'sm:grid-cols-[calc(theme(size.4)+20px)_1fr_calc(theme(size.4)+20px)]',
			].join(' ')}
		>
			{isPending ? (
				<SpinnerIcon className='z-10 col-start-1 row-start-1 size-5 place-self-center text-muted sm:size-4' />
			) : (
				<SearchIcon className='z-10 col-start-1 row-start-1 size-5 place-self-center text-muted sm:size-4' />
			)}

			<FieldInput
				{...props}
				className={composeTailwindRenderProps(props.className, [
					'[&::-webkit-search-cancel-button]:hidden',
					'col-span-full row-start-1 ps-10 pe-10 sm:ps-8 sm:pe-9',
				])}
			/>
			<Button
				isIconOnly
				variant='plain'
				size='sm'
				className='-col-end-1 row-start-1 place-self-center hover:bg-transparent group-data-empty:invisible'
			>
				<XIcon aria-label='Clear' />
			</Button>
		</Group>
	)
}
