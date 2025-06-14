import NProgress from 'nprogress'
import { useEffect } from 'react'
import { type Navigation, useNavigation } from 'react-router'

const config = {
	color: '#ff2056',
	startFrom: 20,
	delay: 0,
	height: 2,
	easing: 'linear',
	speed: 200,
	trickle: true,
	trickleSpeed: 200,
}

function isNavigating(navigation: Navigation) {
	return navigation.state !== 'idle' && navigation.location.pathname !== window.location.pathname
}

export function NavProgress() {
	const navigation = useNavigation()

	useEffect(() => {
		let timeOut: NodeJS.Timeout | null = null

		if (isNavigating(navigation)) {
			timeOut = setTimeout(() => NProgress.start(), config.delay)
		} else if (!isNavigating(navigation)) {
			if (timeOut) clearTimeout(timeOut)
			NProgress.done()
		}

		return () => {
			if (timeOut) clearTimeout(timeOut)
		}
	}, [navigation])

	useEffect(() => {
		NProgress.configure({
			minimum: config.startFrom / 100,
			easing: config.easing,
			speed: config.speed,
			trickle: config.trickle,
			trickleSpeed: config.trickleSpeed,
		})
	}, [])

	return (
		<style>
			{`
				#nprogress {
					pointer-events: none;
				}
				
				#nprogress .bar {
					background: ${config.color};
					position: fixed;
					z-index: 1031;
					top: 0;
					left: 0;
					width: 100%;
					height: ${config.height}px;
				}
				
				.nprogress-custom-parent {
					overflow: hidden;
					position: relative;
				}
				
				.nprogress-custom-parent #nprogress .bar {
					position: absolute;
				}
			`}
		</style>
	)
}
