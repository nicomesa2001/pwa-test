import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Page from '@/components/page'
import ProtectedRoute from '@/components/protected-route'
import { useAuth } from '@/context/AuthContext'
import { useBank } from '@/context/BankContext'

const ProfilePage = () => {
  const { user, logout } = useAuth()
  const { getBalance } = useBank()
  const totalBalance = getBalance()

  // Estado para mostrar confirmación de cierre de sesión
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    logout()
  }

  return (
    <ProtectedRoute>
      <Page title="Perfil">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
          
          {/* Tarjeta de perfil */}
          <div className="bg-white rounded-lg border border-zinc-200 shadow-md p-4 sm:p-6 dark:bg-zinc-800 dark:border-zinc-700">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-2xl sm:text-3xl font-bold text-indigo-700 dark:text-indigo-300 shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              
              <div className="text-center sm:text-left w-full">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white truncate">
                  {user?.name || 'Usuario'}
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm truncate max-w-full">
                  {user?.email || 'usuario@ejemplo.com'}
                </p>
                
                <div className="mt-3 sm:mt-4 bg-zinc-50 dark:bg-zinc-700/50 p-3 rounded-lg">
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">Balance Total:</p>
                  <p className={`text-lg sm:text-xl font-bold ${totalBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    ${totalBalance.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Opciones de perfil */}
          <div className="bg-white rounded-lg border border-zinc-200 shadow-md overflow-hidden dark:bg-zinc-800 dark:border-zinc-700">
            <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
              <Link 
                href="/banks"
                className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-zinc-500 dark:text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18"></path>
                    <path d="M3 7V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"></path>
                    <path d="M6 10v7"></path>
                    <path d="M12 10v7"></path>
                    <path d="M18 10v7"></path>
                    <path d="M3 7h18"></path>
                  </svg>
                  <span className="font-medium text-zinc-900 dark:text-white">Mis Bancos</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </Link>
              
              <Link 
                href="/transactions"
                className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-zinc-500 dark:text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                    <path d="M18 9l3 3-3 3"></path>
                    <path d="M6 15l-3-3 3-3"></path>
                  </svg>
                  <span className="font-medium text-zinc-900 dark:text-white">Mis Transacciones</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </Link>
              
              <button 
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-left"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span className="font-medium text-red-600 dark:text-red-400">Cerrar Sesión</span>
                </div>
              </button>
            </div>
          </div>
          
          {/* Información de la app */}
          <div className="bg-white rounded-lg border border-zinc-200 shadow-md p-6 dark:bg-zinc-800 dark:border-zinc-700">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
              Acerca de la App
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Banco App v1.0.0
            </p>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
              Una aplicación PWA para gestionar tus bancos y transacciones
            </p>
          </div>
        </div>
        
        {/* Modal de confirmación de cierre de sesión */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-5 sm:p-6 max-w-sm w-full dark:bg-zinc-800 shadow-xl animate-fadeIn">
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-3 sm:mb-4">
                ¿Cerrar sesión?
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-5 sm:mb-6 text-sm sm:text-base">
                ¿Estás seguro de que deseas cerrar sesión en tu cuenta?
              </p>
              <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
        
        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
          }
        `}</style>
      </Page>
    </ProtectedRoute>
  )
}

export default ProfilePage
