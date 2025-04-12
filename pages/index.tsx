import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'

const Index = () => {
	const router = useRouter()
	const { user, isLoading } = useAuth()

	useEffect(() => {
		if (!isLoading) {
			if (user) {
				router.push('/banks')
			} else {
				router.push('/login')
			}
		}
	}, [user, isLoading, router])

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-screen bg-zinc-100 dark:bg-zinc-900">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
			</div>
		)
	}

	return null
}

export default Index
