import { Link } from 'react-router'
import { Button } from '~/components/button'
import { ArrowRightIcon } from '~/components/icons/outline/arrow-right'
import { EmailIcon } from '~/components/icons/outline/email'

type Props = {
	message: string
}

export function AuthConfirmation({ message }: Props) {
	return (
		<div className='flex flex-col items-center justify-center'>
			<EmailIcon className='size-9' />
			<h1 className='py-2 font-bold text-xl'>Check your email</h1>
			<div className='pb-4 text-center text-muted text-sm'>
				<p>{message}</p>
			</div>
			<Button asChild>
				<Link to='/login'>
					Go to Login <ArrowRightIcon />
				</Link>
			</Button>
		</div>
	)
}
