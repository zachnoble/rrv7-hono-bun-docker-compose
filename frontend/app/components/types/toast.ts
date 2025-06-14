type Type = 'success' | 'error' | 'info' | 'warning'

export type Toast = {
	type?: Type
	title?: string
	message: string
}
