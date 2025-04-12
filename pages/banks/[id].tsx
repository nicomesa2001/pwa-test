import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Page from '@/components/page'
import ProtectedRoute from '@/components/protected-route'
import { useBank } from '@/context/BankContext'
import { formatCurrency, formatDate } from '@/utils/formatters'

const BankDetailPage = () => {
  const router = useRouter()
  const { id } = router.query
  const { getBank, getBankTransactions, fetchBankTransactions, loading, error, refreshData } = useBank()
  
  const [isSharing, setIsSharing] = useState(false)
  const [shareResult, setShareResult] = useState<{success: boolean, message: string} | null>(null)
  const [localTransactions, setLocalTransactions] = useState<any[]>([])
  const [localLoading, setLocalLoading] = useState(false)
  
  // Cargar las transacciones específicas del banco usando el linkId
  useEffect(() => {
    if (id) {
      const loadBankTransactions = async () => {
        setLocalLoading(true)
        try {
          // Obtener transacciones directamente de la API usando el linkId
          const txs = await fetchBankTransactions(id as string)
          setLocalTransactions(txs)
        } catch (error) {
          console.error('Error al cargar transacciones:', error)
        } finally {
          setLocalLoading(false)
        }
      }
      
      loadBankTransactions()
    }
  }, [id, fetchBankTransactions])
  
  const bank = getBank(id as string)
  // Usar las transacciones cargadas directamente o las del contexto como respaldo
  const transactions = localTransactions.length > 0 ? localTransactions : getBankTransactions(id as string)
  
  if (!bank) {
    return (
      <ProtectedRoute>
        <Page title="Banco no encontrado">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Banco no encontrado</h1>
            <p className="mt-2">El banco que estás buscando no existe.</p>
            <Link 
              href="/banks"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Volver al listado
            </Link>
          </div>
        </Page>
      </ProtectedRoute>
    )
  }

  // Calculate bank balance
  const bankBalance = transactions.reduce((total, transaction) => {
    return transaction.type === 'income' 
      ? total + transaction.amount 
      : total - transaction.amount
  }, 0)

  // Función para compartir el balance del banco
  const handleShareBalance = async () => {
    if (!bank) return
    
    setIsSharing(true)
    setShareResult(null)
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Balance de ${bank.name}`,
          text: `Mi balance actual en ${bank.name} es de ${formatCurrency(bankBalance)}`,
          url: window.location.href
        })
        setShareResult({ success: true, message: 'Compartido exitosamente' })
      } else {
        // Fallback para navegadores que no soportan Web Share API
        await navigator.clipboard.writeText(
          `Mi balance actual en ${bank.name} es de ${formatCurrency(bankBalance)}`
        )
        setShareResult({ success: true, message: 'Copiado al portapapeles' })
      }
    } catch (error) {
      console.error('Error al compartir:', error)
      setShareResult({ success: false, message: 'No se pudo compartir' })
    } finally {
      setIsSharing(false)
      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => setShareResult(null), 3000)
    }
  }

  return (
    <ProtectedRoute>
      <Page title={bank?.name || 'Detalles del banco'}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Link
              href="/banks"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Volver
            </Link>
            
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
          
          {loading && !bank ? (
            <div className="flex justify-center py-12 bg-white rounded-lg border border-zinc-200 shadow-md dark:bg-zinc-800 dark:border-zinc-700">
              <svg className="animate-spin h-12 w-12 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : bank ? (
            <div className="bg-white rounded-lg border border-zinc-200 shadow-md p-6 dark:bg-zinc-800 dark:border-zinc-700">
              <div className="flex items-center space-x-4 mb-6">
                <img
                  className="h-16 w-16 rounded-full object-cover"
                  src={bank.logo}
                  alt={bank.name}
                  loading="lazy"
                />
                <div>
                  <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {bank.name}
                  </h1>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    {bank.description}
                  </p>
                  {bank.account_number && (
                    <p className="text-xs mt-1 text-zinc-400 dark:text-zinc-500">
                      Cuenta: {bank.account_number}
                    </p>
                  )}
                </div>
              </div>
            
              <div className="bg-zinc-50 rounded-lg p-4 mb-6 dark:bg-zinc-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-zinc-900 dark:text-white">
                    Balance
                  </h2>
                  <button 
                    onClick={handleShareBalance}
                    disabled={isSharing}
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    {isSharing ? 'Compartiendo...' : 'Compartir'}
                  </button>
                </div>
                <p className={`text-3xl font-bold ${bankBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(bankBalance)}
                </p>
                {shareResult && (
                  <div className={`mt-2 text-sm ${shareResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {shareResult.message}
                  </div>
                )}
              </div>
            
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-zinc-900 dark:text-white">
                    Transacciones recientes
                  </h2>
                  <Link 
                    href="/transactions" 
                    className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Ver todas
                  </Link>
                </div>
                
                {(loading || localLoading) && transactions.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div 
                        key={transaction.id}
                        className="flex justify-between items-center p-4 bg-white rounded-lg border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-white">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            {formatDate(transaction.date)}
                          </p>
                          {transaction.status && transaction.status !== 'completed' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 mt-1">
                              {transaction.status === 'pending' ? 'Pendiente' : transaction.status}
                            </span>
                          )}
                        </div>
                        <p className={`font-medium ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    ))}
                    
                    {transactions.length > 5 && (
                      <div className="text-center pt-2">
                        <Link 
                          href="/transactions" 
                          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Ver {transactions.length - 5} transacciones más
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-zinc-50 rounded-lg dark:bg-zinc-700/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="mt-4 text-zinc-500 dark:text-zinc-400">
                      No hay transacciones para mostrar.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-zinc-200 shadow-md dark:bg-zinc-800 dark:border-zinc-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-white">Banco no encontrado</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                El banco que estás buscando no existe o no tienes acceso a él.
              </p>
              <Link 
                href="/banks"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Volver al listado
              </Link>
            </div>
          )}
        </div>
      </Page>
    </ProtectedRoute>
  )
}

export default BankDetailPage
