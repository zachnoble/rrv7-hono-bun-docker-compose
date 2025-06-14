import type { MetaDescriptor } from 'react-router'

type Options = {
	title?: string
	description?: string
}

export function routeMeta({ title, description }: Options) {
	const meta: MetaDescriptor[] = []

	if (title) {
		meta.push({
			title,
		})
	}

	if (description) {
		meta.push({
			name: 'description',
			content: description,
		})
	}

	return () => meta
}
