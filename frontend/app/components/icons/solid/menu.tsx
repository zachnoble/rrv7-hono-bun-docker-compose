import { Icon } from '../../icon'

export function MenuIcon({
	'aria-label': arialLabel,
	...props
}: React.JSX.IntrinsicElements['svg']) {
	return (
		<Icon aria-label={arialLabel}>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				viewBox='0 0 24 24'
				stroke='currentColor'
				{...props}
			>
				<path d='M4 12h16' />
				<path d='M4 18h16' />
				<path d='M4 6h16' />
			</svg>
		</Icon>
	)
}
