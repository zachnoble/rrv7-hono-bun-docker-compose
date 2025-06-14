import { FieldError, FieldInput, TextField } from './field'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string
	description?: string
	error?: string
}

export function Input({ label, description, error, ...props }: InputProps) {
	return (
		<TextField isInvalid={Boolean(error)} aria-label={label ?? props.placeholder}>
			<FieldInput {...props} />
			<FieldError>{error}</FieldError>
		</TextField>
	)
}
