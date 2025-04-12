import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Page from '@/components/page'
import ProtectedRoute from '@/components/protected-route'
import { useBank } from '@/context/BankContext'
import { useAuth } from '@/context/AuthContext'
import * as belvoAPI from '@/services/belvoEndpoints'

const BanksPage = () => {
  const { banks, loading, error, refreshData } = useBank()
  const { user } = useAuth()
  const router = useRouter()
  const [isInstalled, setIsInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [institutions, setInstitutions] = useState<belvoAPI.BelvoInstitution[]>([])
  const [loadingInstitutions, setLoadingInstitutions] = useState(false)

  // Cargar instituciones financieras disponibles
  useEffect(() => {
    const loadInstitutions = async () => {
      if (!user) return
      
      setLoadingInstitutions(true)
      try {
        const data = await belvoAPI.getInstitutions()
        setInstitutions(data)
      } catch (error) {
        console.error('Error al cargar instituciones:', error)
      } finally {
        setLoadingInstitutions(false)
      }
    }
    
    loadInstitutions()
  }, [user])
  
  // Detectar si la app está instalada o puede ser instalada
  useEffect(() => {
    // Verificar si ya está instalada (en modo standalone o fullscreen)
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.matchMedia('(display-mode: fullscreen)').matches) {
      setIsInstalled(true)
    }

    // Capturar el evento beforeinstallprompt para la instalación de PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir que Chrome muestre automáticamente el diálogo
      e.preventDefault()
      // Guardar el evento para usarlo después
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  // Función para instalar la PWA
  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Mostrar el diálogo de instalación
    deferredPrompt.prompt()
    
    // Esperar a que el usuario responda al diálogo
    const { outcome } = await deferredPrompt.userChoice
    
    // Limpiar el evento guardado
    setDeferredPrompt(null)
    
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
  }

  return (
    <ProtectedRoute>
      <Page title="Bancos">
        <div className="space-y-6">
          {/* Banner de instalación de PWA */}
          {!isInstalled && deferredPrompt && (
            <div className="bg-indigo-50 dark:bg-indigo-900/70 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 animate-fadeIn">
              <div className="flex-1 text-center sm:text-left">
                <p className="text-indigo-700 dark:text-indigo-300 font-medium text-sm sm:text-base">¡Instala esta app en tu dispositivo!</p>
                <p className="text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm">Accede más rápido y trabaja sin conexión</p>
              </div>
              <button 
                onClick={handleInstallClick}
                className="w-full sm:w-auto ml-0 sm:ml-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
              >
                Instalar
              </button>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">Mis Bancos</h1>
              {loading && (
                <div className="ml-3">
                  <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => refreshData()}
                disabled={loading}
                className={`inline-flex items-center px-3 py-1.5 text-sm border rounded-md ${loading 
                  ? 'border-zinc-300 text-zinc-400 bg-zinc-100 dark:border-zinc-700 dark:text-zinc-500 dark:bg-zinc-800 cursor-not-allowed' 
                  : 'border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-700 dark:text-indigo-300 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
              
              <Link
                href="/transactions"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
                  <path d="M18 9l3 3-3 3"/>
                  <path d="M6 15l-3-3 3-3"/>
                </svg>
                Ver transacciones
              </Link>
            </div>
          </div>
          
          {/* Mensajes de error */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 dark:bg-red-900/30 dark:border-red-600">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          )}
          
          {loading && banks.length === 0 ? (
            <div className="flex justify-center py-12">
              <svg className="animate-spin h-12 w-12 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : banks.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {banks.map((bank) => (
                <Link
                  key={bank.id}
                  href={`/banks/${bank.id}`}
                  className="block p-4 sm:p-6 bg-white rounded-lg border border-zinc-200 shadow-md hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700 transition-all duration-200 transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-12 w-12 rounded-full object-cover"
                        src={bank.logo}
                        alt={bank.name}
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-medium text-zinc-900 dark:text-white">
                        {bank.name}
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {bank.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-zinc-200 shadow-md dark:bg-zinc-800 dark:border-zinc-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-white">No tienes bancos conectados</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Conecta tus cuentas bancarias para ver tus transacciones y balances.
              </p>
            </div>
          )}
          
          {/* Instituciones disponibles */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Instituciones Disponibles</h2>
            {loadingInstitutions ? (
              <div className="flex justify-center py-6">
                <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : institutions.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {institutions.slice(0, 10).map((institution) => (
                  <div key={institution.id} className="bg-white rounded-lg border border-zinc-200 p-3 flex flex-col items-center text-center dark:bg-zinc-800 dark:border-zinc-700">
                    <img 
                      src={institution.logo || 'https://via.placeholder.com/80'} 
                      alt={institution.name} 
                      className="h-16 w-16 object-contain mb-2"
                    />
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-white truncate w-full">{institution.display_name || institution.name}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{institution.country_codes?.[0] || 'MX'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 dark:text-zinc-400 text-center py-4">No se pudieron cargar las instituciones disponibles.</p>
            )}
          </div>
        </div>
      </Page>
    </ProtectedRoute>
  )
}

export default BanksPage
