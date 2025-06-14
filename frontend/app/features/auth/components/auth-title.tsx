type Props = {
	title: string
	description: string
}

export function AuthTitle({ title, description }: Props) {
	return (
		<div className='mb-8 text-center'>
			<h1 className='font-bold text-2xl'>{title}</h1>
			<p className='mt-2 text-muted text-sm'>{description}</p>
		</div>
	)
}
