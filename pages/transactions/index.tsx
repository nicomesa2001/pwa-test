import { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Page from '@/components/page'
import ProtectedRoute from '@/components/protected-route'
import { useBank } from '@/context/BankContext'
import { useRouter } from 'next/router'
import { transactionService } from '@/services/transactionService'
import { Transaction } from '@/services/belvoService'

const TransactionsPage = () => {
  const { transactions, banks, getBalance, loading, error, refreshData, addTransaction } = useBank()
  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false)
  const [showAddTransactionForm, setShowAddTransactionForm] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([])
  const [newTransaction, setNewTransaction] = useState({
    bankId: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    description: ''
  })
  
  // Detectar estado de conexión para funcionalidad offline
  useEffect(() => {
    // Verificar estado de conexión inicial
    setIsOnline(navigator.onLine)
    
    // Cargar transacciones pendientes del almacenamiento local
    setPendingTransactions(transactionService.getPendingTransactions())
    
    // Configurar event listeners para cambios en el estado de la conexión
    const handleOnline = () => {
      setIsOnline(true)
      // Intentar sincronizar cuando vuelva la conexión
      refreshData()
    }
    
    const handleOffline = () => {
      setIsOnline(false)
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Manejar el envío del formulario de nueva transacción
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTransaction.bankId || !newTransaction.amount || !newTransaction.description) {
      return
    }
    
    // Usar el servicio para agregar la transacción
    addTransaction({
      bankId: newTransaction.bankId,
      amount: parseFloat(newTransaction.amount),
      type: newTransaction.type,
      description: newTransaction.description
    })
    
    // Actualizar la lista de pendientes si estamos offline
    if (!isOnline) {
      setPendingTransactions(transactionService.getPendingTransactions())
    }
    
    // Limpiar el formulario y cerrarlo
    setNewTransaction({
      bankId: '',
      amount: '',
      type: 'expense',
      description: ''
    })
    setShowAddTransactionForm(false)
  }

  // Agrupar transacciones por categoría (para análisis)
  const transactionsByCategory = useMemo(() => {
    const categories: Record<string, number> = {}
    
    transactions.forEach(transaction => {
      const category = transaction.category || 'Sin categoría'
      if (!categories[category]) {
        categories[category] = 0
      }
      
      if (transaction.type === 'income') {
        categories[category] += transaction.amount
      } else {
        categories[category] -= transaction.amount
      }
    })
    
    return Object.entries(categories)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
  }, [transactions])

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Calculate total balance
  const totalBalance = getBalance()

  return (
    <ProtectedRoute>
      <Page title="Transacciones">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">Transacciones</h1>
              {/* Indicador de estado de conexión */}
              <div className="ml-3 flex items-center">
                <span className={`inline-block h-3 w-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} mr-1`}></span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <Link
              href="/banks"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Volver a bancos
            </Link>
          </div>
          
          {/* Estado de carga y errores */}
          {loading && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 dark:bg-blue-900/30 dark:border-blue-600">
              <div className="flex items-center">
                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="ml-3 text-sm text-blue-700 dark:text-blue-300">
                  Cargando datos de tus cuentas bancarias...
                </p>
              </div>
            </div>
          )}
          
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
              <div className="mt-2 pl-8">
                <button 
                  onClick={() => refreshData()}
                  className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 underline"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}
          
          {/* Mostrar mensaje si está offline */}
          {!isOnline && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 dark:bg-yellow-900/30 dark:border-yellow-600">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm text-yellow-700 dark:text-yellow-300">
                  Estás navegando sin conexión. Algunas funciones pueden estar limitadas.
                </p>
              </div>
            </div>
          )}
          
          {/* Mostrar mensaje si hay transacciones pendientes */}
          {pendingTransactions.length > 0 && (
            <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 dark:bg-indigo-900/30 dark:border-indigo-600">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm text-indigo-700 dark:text-indigo-300">
                  Tienes {pendingTransactions.length} transacción(es) pendiente(s) de sincronizar.
                </p>
              </div>
              {isOnline && (
                <div className="mt-2 pl-8">
                  <button 
                    onClick={() => refreshData()}
                    className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
                  >
                    Sincronizar ahora
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* KPI Balance Card */}
          <div className="bg-white rounded-lg border border-zinc-200 shadow-md p-4 sm:p-6 dark:bg-zinc-800 dark:border-zinc-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-medium text-zinc-900 dark:text-white mb-1 sm:mb-2">
                  Balance Total
                </h2>
                <p className={`text-2xl sm:text-4xl font-bold ${totalBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  ${totalBalance.toFixed(2)}
                </p>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 sm:mt-2">
                  Suma de ingresos - Suma de egresos
                </p>
              </div>
              
              <div className="flex flex-col sm:items-end mt-3 sm:mt-0 space-y-2">
                {/* Botón de actualizar datos */}
                <button 
                  onClick={() => refreshData()}
                  disabled={loading || !isOnline}
                  className={`flex items-center justify-center px-3 py-1.5 text-xs border rounded-md ${loading || !isOnline 
                    ? 'border-zinc-300 text-zinc-400 bg-zinc-100 dark:border-zinc-700 dark:text-zinc-500 dark:bg-zinc-800 cursor-not-allowed' 
                    : 'border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-700 dark:text-indigo-300 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {loading ? 'Actualizando...' : 'Actualizar datos'}
                </button>
                
                {/* Botón de compartir (usando Web Share API) */}
                {navigator && navigator.share && (
                  <button 
                    onClick={() => {
                      navigator.share({
                        title: 'Mi Balance Bancario',
                        text: `Mi balance actual es $${totalBalance.toFixed(2)}`,
                        url: window.location.href
                      }).catch(err => console.log('Error al compartir:', err))
                    }}
                    className="flex items-center justify-center px-3 py-1.5 text-xs border border-zinc-300 rounded-md text-zinc-700 bg-white hover:bg-zinc-50 dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    Compartir
                  </button>
                )}
              </div>
            </div>
            
            {/* Categorías de transacciones (de Belvo) */}
            {transactionsByCategory.length > 0 && (
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Distribución por categoría</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {transactionsByCategory.slice(0, 6).map(category => (
                    <div key={category.name} className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-700/50 rounded-md">
                      <span className="text-xs text-zinc-700 dark:text-zinc-300 truncate mr-2">{category.name}</span>
                      <span className={`text-xs font-medium ${category.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        ${Math.abs(category.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Botones flotantes */}
          <div className="fixed sm:relative bottom-20 sm:bottom-auto right-4 sm:right-auto z-10 sm:z-0 sm:mt-4 flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-3">
            {/* Botón de información */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center justify-center h-14 w-14 sm:h-auto sm:w-auto sm:px-4 sm:py-2 rounded-full sm:rounded-md shadow-lg sm:shadow-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {showAddForm ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:hidden" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:hidden" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
              <span className="hidden sm:inline">{showAddForm ? 'Cerrar' : 'Ver resumen'}</span>
            </button>
            
            {/* Botón de agregar transacción */}
            <button
              onClick={() => setShowAddTransactionForm(!showAddTransactionForm)}
              className="flex items-center justify-center h-14 w-14 sm:h-auto sm:w-auto sm:px-4 sm:py-2 rounded-full sm:rounded-md shadow-lg sm:shadow-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {showAddTransactionForm ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:hidden" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:hidden" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              )}
              <span className="hidden sm:inline">{showAddTransactionForm ? 'Cancelar' : 'Agregar transacción'}</span>
            </button>
          </div>
          
          {/* Modal de detalles de transacción (solo visualización) */}
          {showAddForm && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-0">
              <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl w-full max-w-md mx-auto overflow-hidden animate-fadeIn">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                  <h2 className="text-base sm:text-lg font-medium text-zinc-900 dark:text-white">
                    Información de Transacciones
                  </h2>
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                    className="text-zinc-400 hover:text-zinc-500 dark:text-zinc-500 dark:hover:text-zinc-400 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 sm:p-4 rounded-lg">
                    <h3 className="text-xs sm:text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-1 sm:mb-2">Modo Solo Lectura</h3>
                    <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed">
                      Esta aplicación está configurada en modo de solo lectura. Puedes visualizar todas las transacciones pero no crear nuevas.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Resumen de Transacciones</h3>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                        <p className="text-xs text-green-700 dark:text-green-400">Total Ingresos</p>
                        <p className="text-base sm:text-lg font-bold text-green-700 dark:text-green-400">
                          ${transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
                        <p className="text-xs text-red-700 dark:text-red-400">Total Egresos</p>
                        <p className="text-base sm:text-lg font-bold text-red-700 dark:text-red-400">
                          ${transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Bancos con Transacciones</h3>
                    <div className="space-y-1.5 sm:space-y-2 max-h-40 sm:max-h-60 overflow-y-auto pr-1">
                      {banks.map(bank => {
                        const bankTransactions = transactions.filter(t => t.bankId === bank.id);
                        if (bankTransactions.length === 0) return null;
                        
                        return (
                          <div key={bank.id} className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-700/50 rounded-md">
                            <div className="flex items-center">
                              <img src={bank.logo} alt={bank.name} className="h-5 w-5 sm:h-6 sm:w-6 rounded-full mr-2" />
                              <span className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 truncate max-w-[120px] sm:max-w-[180px]">{bank.name}</span>
                            </div>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">{bankTransactions.length} transacciones</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="w-full inline-flex justify-center py-2.5 sm:py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Transactions List */}
          <div>
            <h2 className="text-base sm:text-lg font-medium text-zinc-900 dark:text-white mb-3 sm:mb-4">
              Historial de transacciones
            </h2>
            
            {sortedTransactions.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {sortedTransactions.map((transaction) => {
                  const bank = banks.find(b => b.id === transaction.bankId)
                  
                  return (
                    <div 
                      key={transaction.id}
                      className="flex justify-between items-center p-3 sm:p-4 bg-white rounded-lg border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 hover:shadow-md transition-shadow animate-fadeIn"
                    >
                      <div className="flex items-center overflow-hidden">
                        <div className="flex-shrink-0 mr-2 sm:mr-4">
                          <img
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                            src={bank?.logo || 'https://via.placeholder.com/150'}
                            alt={bank?.name || 'Banco'}
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0"> {/* Permite truncar contenido */}
                          <p className="font-medium text-zinc-900 dark:text-white text-sm sm:text-base truncate max-w-[150px] sm:max-w-full">
                            {transaction.description}
                          </p>
                          <div className="flex flex-wrap text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                            <p className="truncate max-w-[80px] sm:max-w-full">{bank?.name || 'Banco desconocido'}</p>
                            <span className="mx-1 hidden sm:inline">•</span>
                            <p className="text-xs">{new Date(transaction.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      <p className={`font-medium text-sm sm:text-base whitespace-nowrap ml-2 ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-zinc-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-zinc-500 dark:text-zinc-400 text-center">
                  No hay transacciones para mostrar.
                </p>
              </div>
            )}
          </div>
        </div>
        
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

export default TransactionsPage
