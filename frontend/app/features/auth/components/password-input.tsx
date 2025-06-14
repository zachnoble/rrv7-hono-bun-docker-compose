import React from 'react'
import { Group, type InputProps } from 'react-aria-components'
import { ToggleButton } from '~/components/button'
import { FieldError, FieldInput, TextField } from '~/components/field'
import { EyeIcon } from '~/components/icons/solid/eye'
import { EyeOffIcon } from '~/components/icons/solid/eye-off'
import { composeTailwindRenderProps } from '~/components/utils'

type Props = InputProps & {
	error?: string
	label?: string
}

export function PasswordInput({ className, error, label, ...props }: Props) {
	const [isPasswordVisible, setIsPasswordVisible] = React.useState(false)

	return (
		<TextField isInvalid={Boolean(error)} aria-label={label ?? props.placeholder}>
			<Group
				data-ui='control'
				className={[
					'grid',
					'grid-cols-[1fr_calc(theme(size.5)+20px)]',
					'sm:grid-cols-[1fr_calc(theme(size.4)+20px)]',
				].join(' ')}
			>
				<FieldInput
					{...props}
					className={composeTailwindRenderProps(className, [
						'peer',
						'col-span-full',
						'row-start-1',
						'pe-10 sm:pe-9',
					])}
					type={isPasswordVisible ? 'text' : 'password'}
				/>
				<ToggleButton
					isIconOnly
					size='sm'
					variant='plain'
					aria-label='Show password'
					isSelected={isPasswordVisible}
					onChange={setIsPasswordVisible}
					className={[
						'group/toggle-password',
						'focus-visible:-outline-offset-1',
						'row-start-1',
						'-col-end-1',
						'place-self-center',
						'hover:bg-transparent',
					].join(' ')}
				>
					{isPasswordVisible ? (
						<EyeOffIcon className='text-muted/75 group-hover/toggle-password:text-foreground' />
					) : (
						<EyeIcon className='text-muted/75 group-hover/toggle-password:text-foreground' />
					)}
				</ToggleButton>
			</Group>
			<FieldError>{error}</FieldError>
		</TextField>
	)
}
