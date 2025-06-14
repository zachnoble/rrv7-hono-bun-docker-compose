import { useNavigation } from 'react-router'

export function useLoading() {
	const navigation = useNavigation()

	return {
		submitting: navigation.state === 'submitting',
		loading: navigation.state === 'loading',
		idle: navigation.state === 'idle',
		pending: navigation.state === 'loading' || navigation.state === 'submitting',
	}
}
