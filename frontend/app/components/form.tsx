import { type FormProps, Form as ReactRouterForm } from 'react-router'

export function Form(props: FormProps) {
	// noValidate by default as we use react-hook-form & zod
	// can override to use default browser validation by passing noValidate={false}
	return <ReactRouterForm noValidate {...props} />
}
