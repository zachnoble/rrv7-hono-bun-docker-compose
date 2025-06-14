import type { ReactNode } from 'react'
import { Links, Meta, Scripts, ScrollRestoration } from 'react-router'

type Props = {
	className?: string
	headSlot?: ReactNode
	bodySlot?: ReactNode
}

export function Document({ className, headSlot, bodySlot }: Props) {
	return (
		<html lang='en' className={className}>
			<head>
				<meta charSet='utf-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<Meta />
				<Links />
				{headSlot}
			</head>
			<body>
				{bodySlot}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	)
}
