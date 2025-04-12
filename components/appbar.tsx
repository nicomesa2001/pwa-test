import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'

const links = [
	{ label: 'Bancos', href: '/banks' },
	{ label: 'Transacciones', href: '/transactions' },
]

const Appbar = () => {
	const router = useRouter()
	const { user, logout } = useAuth()

	// No mostrar la barra en las páginas de login y registro
	if (!user && (router.pathname === '/login' || router.pathname === '/register')) {
		return null
	}

	// Determinar el título de la página según la ruta actual
	let pageTitle = 'Banco App'
	if (router.pathname === '/banks') {
		pageTitle = 'Bancos'
	} else if (router.pathname.startsWith('/banks/')) {
		pageTitle = 'Detalle de Banco'
	} else if (router.pathname === '/transactions') {
		pageTitle = 'Transacciones'
	} else if (router.pathname === '/profile') {
		pageTitle = 'Perfil'
	}

	return (
		<div className='fixed top-0 left-0 z-20 w-full bg-zinc-900 pt-safe'>
			<header className='border-b bg-zinc-100 px-safe dark:border-zinc-800 dark:bg-zinc-900'>
				<div className='mx-auto flex h-20 max-w-screen-md items-center justify-between px-6'>
					{/* Botón de retroceso para páginas internas */}
					{router.pathname !== '/banks' && router.pathname !== '/login' && router.pathname !== '/register' ? (
						<button 
							onClick={() => router.back()}
							className="sm:hidden text-indigo-600 dark:text-indigo-400"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M15 18l-6-6 6-6"/>
							</svg>
						</button>
					) : (
						<Link href={user ? '/banks' : '/login'} className="font-medium text-lg">
							<h1>Banco App</h1>
						</Link>
					)}

					{/* Título de la página para móviles */}
					<div className="sm:hidden text-center">
						<h1 className="font-medium">{pageTitle}</h1>
					</div>

					<nav className='flex items-center space-x-6'>
						{/* Enlaces de navegación para escritorio */}
						<div className='hidden sm:block'>
							<div className='flex items-center space-x-6'>
								{links.map(({ label, href }) => (
									<Link
										key={label}
										href={href}
										className={`text-sm ${
											router.pathname === href || 
											(href === '/banks' && router.pathname.startsWith('/banks/')) ||
											(href === '/transactions' && router.pathname.startsWith('/transactions/'))
												? 'text-indigo-500 dark:text-indigo-400'
												: 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
										}`}
									>
										{label}
									</Link>
								))}
							</div>
						</div>

						{/* Avatar del usuario */}
						{user && (
							<div
								title={user.name || 'Usuario'}
								className='h-10 w-10 rounded-full bg-indigo-200 bg-cover bg-center shadow-inner dark:bg-indigo-800 flex items-center justify-center'
							>
								<span className="text-indigo-700 dark:text-indigo-300 font-medium">
									{user.name ? user.name.charAt(0).toUpperCase() : 'U'}
								</span>
							</div>
						)}
					</nav>
				</div>
			</header>
		</div>
	)
}

export default Appbar
