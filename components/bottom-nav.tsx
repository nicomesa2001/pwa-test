import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'

const BottomNav = () => {
	const router = useRouter()
	const { user } = useAuth()

	// Si el usuario no está autenticado, no mostrar la barra de navegación en login/register
	if (!user && (router.pathname === '/login' || router.pathname === '/register')) {
		return null
	}

	return (
		<div className='sm:hidden'>
			<nav className='fixed bottom-0 w-full border-t bg-zinc-100 pb-safe dark:border-zinc-800 dark:bg-zinc-900 shadow-lg z-50'>
				<div className='mx-auto flex h-16 max-w-md items-center justify-around px-4'>
					{links.map(({ href, label, icon }) => (
						<Link
							key={label}
							href={href}
							className={`flex h-full w-full flex-col items-center justify-center space-y-1 py-1 ${
								router.pathname === href || 
								(href === '/banks' && router.pathname.startsWith('/banks/')) ||
								(href === '/transactions' && router.pathname.startsWith('/transactions/'))
									? 'text-indigo-500 dark:text-indigo-400 relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-0.5 after:bg-indigo-500 dark:after:bg-indigo-400 after:rounded-full'
									: 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
							}`}
						>
							<div className="w-6 h-6 flex items-center justify-center">
								{icon}
							</div>
							<span className='text-xs font-medium'>
								{label}
							</span>
						</Link>
					))}
				</div>
			</nav>
		</div>
	)
}

export default BottomNav

const links = [
	{
		label: 'Bancos',
		href: '/banks',
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M3 21h18"/>
				<path d="M3 7V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"/>
				<path d="M6 10v7"/>
				<path d="M12 10v7"/>
				<path d="M18 10v7"/>
				<path d="M3 7h18"/>
			</svg>
		),
	},
	{
		label: 'Transacciones',
		href: '/transactions',
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
				<path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
				<path d="M18 9l3 3-3 3"/>
				<path d="M6 15l-3-3 3-3"/>
			</svg>
		),
	},
	{
		label: 'Perfil',
		href: '/profile',
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
				<circle cx="12" cy="7" r="4"/>
			</svg>
		),
	},
]
