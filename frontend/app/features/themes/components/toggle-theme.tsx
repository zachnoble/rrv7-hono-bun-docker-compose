import { Button } from '~/components/button'
import { MoonIcon } from '~/components/icons/outline/moon'
import { SpinnerIcon } from '~/components/icons/outline/spinner'
import { SunIcon } from '~/components/icons/outline/sun'
import { useTheme } from '~/features/themes/hooks/use-theme'
import { Theme } from '~/features/themes/types'
import { ClientOnly } from '~/lib/client-only'

function ToggleThemeInner() {
	const [theme, setTheme] = useTheme()

	return (
		<Button
			onClick={() => setTheme(theme === Theme.DARK ? Theme.LIGHT : Theme.DARK)}
			variant='outline'
			className='py-2.5!'
		>
			{theme === Theme.DARK ? <SunIcon /> : <MoonIcon />}
		</Button>
	)
}

export function ToggleTheme() {
	return (
		<ClientOnly
			fallback={
				<Button variant='outline' className='py-2.5!' isDisabled={true}>
					<SpinnerIcon />
				</Button>
			}
		>
			{() => <ToggleThemeInner />}
		</ClientOnly>
	)
}
