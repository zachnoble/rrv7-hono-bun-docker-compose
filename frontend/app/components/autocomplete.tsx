import { useCallback, useState } from 'react'
import type { Key } from 'react-aria'
import { useAsyncList } from 'react-stately'
import {
	ComboBox,
	ComboBoxButton,
	ComboBoxClearButton,
	ComboBoxGroup,
	ComboBoxInput,
	ComboBoxListBox,
	ComboBoxListItem,
	ComboBoxListItemLabel,
	ComboBoxPopover,
} from './combobox'
import { EmptyState, EmptyStateDescription, EmptyStateHeading } from './empty-state'
import { FieldError } from './field'
import { SearchIcon } from './icons/outline/search'
import { SpinnerIcon } from './icons/outline/spinner'
import type { Option } from './types/option'

export interface AutocompleteProps<T extends Option> {
	fetcher: (params: { signal: AbortSignal; filterText: string }) => Promise<{ items: T[] }>
	selectedItem: T | null
	onSelectionChange: (item: T | null) => void
	placeholder?: string
	errorMessage?: string
	className?: string
}

export function Autocomplete<T extends Option>({
	fetcher,
	selectedItem,
	onSelectionChange,
	placeholder,
	errorMessage,
	className,
}: AutocompleteProps<T>) {
	const [inputValue, setInputValue] = useState(selectedItem?.name ?? '')

	const list = useAsyncList<T>({
		initialFilterText: '',
		async load({ signal, filterText }) {
			if (selectedItem && filterText === selectedItem.name) {
				return { items: [selectedItem] }
			}
			return fetcher({ signal, filterText: filterText ?? '' })
		},
	})

	const handleInputChange = useCallback(
		(value: string) => {
			setInputValue(value)
			list.setFilterText(value)
			if (!value) {
				onSelectionChange(null)
			}
		},
		[list, onSelectionChange],
	)

	const handleSelectionChange = useCallback(
		(key: Key | null) => {
			const item = list.items.find((item) => item.id === key?.toString()) ?? null
			onSelectionChange(item)
			setInputValue(item?.name ?? '')
		},
		[list.items, onSelectionChange],
	)

	const handleClear = useCallback(() => {
		setInputValue('')
		onSelectionChange(null)
		list.setFilterText('')
	}, [list, onSelectionChange])

	return (
		<ComboBox
			inputValue={inputValue}
			onInputChange={handleInputChange}
			items={list.items}
			onSelectionChange={handleSelectionChange}
			selectedKey={selectedItem ? selectedItem.id : null}
			allowsEmptyCollection={true}
			isInvalid={Boolean(errorMessage)}
			aria-label={placeholder}
			className={className}
			menuTrigger='focus'
		>
			<ComboBoxGroup>
				{list.isLoading ? <SpinnerIcon /> : <SearchIcon />}
				<ComboBoxInput placeholder={placeholder} />
				<ComboBoxClearButton isDisabled={list.isLoading} onPress={handleClear} />
				<ComboBoxButton />
			</ComboBoxGroup>
			<ComboBoxPopover>
				<ComboBoxListBox<T>
					renderEmptyState={() => (
						<EmptyState>
							<EmptyStateHeading elementType='div' displayLevel={2}>
								No results found
							</EmptyStateHeading>
							<EmptyStateDescription>
								Try searching for something else
							</EmptyStateDescription>
						</EmptyState>
					)}
				>
					{(item) => (
						<ComboBoxListItem textValue={item.name}>
							<ComboBoxListItemLabel>{item.name}</ComboBoxListItemLabel>
						</ComboBoxListItem>
					)}
				</ComboBoxListBox>
			</ComboBoxPopover>
			<FieldError>{errorMessage}</FieldError>
		</ComboBox>
	)
}
