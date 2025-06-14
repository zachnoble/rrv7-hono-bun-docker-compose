import { Link } from 'react-router'

type Props = {
	links: {
		label: string
		to: string
	}[]
}

export function AuthLinks({ links }: Props) {
	return (
		<div className='mt-4 flex flex-col items-center gap-2'>
			{links.map((link) => (
				<Link
					key={link.to}
					to={link.to}
					className='text-muted text-xs underline-offset-4 hover:underline'
				>
					{link.label}
				</Link>
			))}
		</div>
	)
}
