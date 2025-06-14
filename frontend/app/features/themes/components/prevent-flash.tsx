import { useTheme } from '../hooks/use-theme'
import { prefersLightMQ } from '../utils'

type Props = {
	ssrTheme: boolean
	nonce?: string
}

export function PreventFlashOnWrongTheme({ ssrTheme, nonce }: Props) {
	const [theme] = useTheme()

	return (
		<>
			<meta name='color-scheme' content={theme === 'light' ? 'light dark' : 'dark light'} />

			{ssrTheme ? null : (
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: this is safe
					dangerouslySetInnerHTML={{
						__html: String.raw`
                        (() => {
                          const theme = window.matchMedia(${JSON.stringify(prefersLightMQ)}).matches
                            ? 'light'
                            : 'dark';
                          
                          const cl = document.documentElement.classList;
                          const dataAttr = document.documentElement.dataset.theme;
                        
                          if (dataAttr != null) {
                            const themeAlreadyApplied = dataAttr === 'light' || dataAttr === 'dark';
                            if (!themeAlreadyApplied) {
                              document.documentElement.dataset.theme = theme;
                            }
                          } else {
                            const themeAlreadyApplied = cl.contains('light') || cl.contains('dark');
                            if (!themeAlreadyApplied) {
                              cl.add(theme);
                            }
                          }
                          
                          const meta = document.querySelector('meta[name=color-scheme]');
                          if (meta) {
                            if (theme === 'dark') {
                              meta.content = 'dark light';
                            } else if (theme === 'light') {
                              meta.content = 'light dark';
                            }
                          }
                        })();
                        `,
					}}
					nonce={nonce}
					suppressHydrationWarning
				/>
			)}
		</>
	)
}
