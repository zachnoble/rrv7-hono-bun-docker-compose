import { type TokenResponse, useGoogleLogin } from '@react-oauth/google'
import { useSubmit } from 'react-router'
import { Button } from '~/components/button'
import { GoogleIcon } from '~/components/icons/solid/google'
import { toast } from '~/components/utils/toast'

type Props = {
	flow: 'login' | 'register'
}

export function GoogleAuthButton({ flow }: Props) {
	const submit = useSubmit()

	function onSuccess(tokenResponse: TokenResponse) {
		const formData = new FormData()

		formData.append('intent', 'googleAuth')
		formData.append('googleToken', tokenResponse.access_token)

		submit(formData, { method: 'post' })
	}

	function onError() {
		toast({
			title: 'Google Auth Failed',
			message: 'Please try again, or sign in using your email.',
			type: 'error',
		})
	}

	const login = useGoogleLogin({
		onSuccess,
		onError,
	})

	const message = {
		login: 'Sign in with Google',
		register: 'Sign up with Google',
	}

	return (
		<Button type='button' onClick={() => login()} variant='outline' className='w-full'>
			<GoogleIcon className='mr-1 h-5 w-5' />
			{message[flow]}
		</Button>
	)
}
