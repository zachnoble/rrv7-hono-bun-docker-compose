export type Option = {
	id: string
	name: string
	description?: string
	icon?: React.ReactNode
	disabled?: boolean
}

export type OptionGroup = {
	title: string
	options: Option[]
}
