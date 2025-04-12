import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { transactionService } from '../services/transactionService'
import * as belvoAPI from '../services/belvoEndpoints'

// Definimos nuestras interfaces simplificadas para la app
export interface Bank {
  id: string
  name: string
  logo: string
  description: string
  linkId?: string
  account_number?: string
  balance?: number
  currency?: string
  institution?: string
}

export interface Transaction {
  id: string
  bankId: string
  amount: number
  type: 'income' | 'expense'
  description: string
  date: string
  category?: string
  reference?: string
  status?: 'pending' | 'completed' | 'failed' | string
  merchant?: string
  paymentMethod?: string
}

interface BankContextType {
  banks: Bank[]
  transactions: Transaction[]
  loading: boolean
  error: string | null
  getBank: (id: string) => Bank | undefined
  getBankTransactions: (bankId: string) => Transaction[]
  fetchBankTransactions: (bankId: string) => Promise<Transaction[]>
  getBalance: () => number
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void
  refreshData: () => Promise<void>
}

const BankContext = createContext<BankContextType | undefined>(undefined)

export const BankProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth()
  const [banks, setBanks] = useState<Bank[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)



  // Function to fetch data from Belvo API using our endpoints
  const fetchBelvoData = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Obtener todas las cuentas (con manejo de paginación)
      const belvoAccounts = await belvoAPI.getAllAccounts()
      
      if (belvoAccounts.length === 0) {
        console.warn('No se encontraron cuentas en Belvo')
      }
      
      // Mapear cuentas a nuestro formato de banco
      const mappedBanks: Bank[] = belvoAccounts.map(account => {
        // Determinar el logo basado en la institución
        const institutionLogo = getInstitutionLogo(account.institution.name)
        
        return {
          id: account.id,
          name: account.name || account.institution.name,
          logo: institutionLogo,
          description: `${account.type} - ${account.currency}`,
          linkId: account.link,
          account_number: account.number,
          balance: account.balance?.current || 0,
          currency: account.currency,
          institution: account.institution.name
        }
      })
      
      // Obtener todas las transacciones (con manejo de paginación)
      // Primero obtenemos los links para usarlos en las transacciones
      const links = await belvoAPI.getLinks()
      
      if (links.length === 0) {
        console.warn('No se encontraron links en Belvo')
        setError('No se encontraron cuentas bancarias conectadas. Por favor, conecta una cuenta primero.')
      }
      
      const belvoTransactions = await belvoAPI.getAllTransactions()
      
      if (belvoTransactions.length === 0) {
        console.warn('No se encontraron transacciones en Belvo')
      }
      
      // Mapear transacciones a nuestro formato
      const mappedTransactions: Transaction[] = belvoTransactions.map(transaction => ({
        id: transaction.id,
        bankId: transaction.account.id,
        amount: Math.abs(transaction.amount),
        type: transaction.amount < 0 ? 'expense' : 'income',
        description: transaction.description || 'Sin descripción',
        date: transaction.value_date || transaction.accounting_date,
        category: transaction.category,
        reference: transaction.reference,
        status: transaction.status
      }))
      
      // Cargar transacciones pendientes del almacenamiento local
      const pendingTransactions = transactionService.getPendingTransactions()
      
      // Combinar transacciones de Belvo con las pendientes
      const allTransactions = [...mappedTransactions, ...pendingTransactions]
      
      setBanks(mappedBanks)
      setTransactions(allTransactions)
    } catch (err: any) {
      console.error('Error fetching data from Belvo:', err)
      setError(`Error al obtener datos bancarios: ${err?.message || 'Por favor, intenta de nuevo más tarde.'}`)
      
      // Usar datos de ejemplo como respaldo si no hay datos presentes
      if (banks.length === 0 || transactions.length === 0) {
        const mockBanks: Bank[] = [
          {
            id: 'mock-1',
            name: 'Banco Nacional',
            logo: 'https://via.placeholder.com/150',
            description: 'Cuenta de Ahorros - MXN'
          },
          {
            id: 'mock-2',
            name: 'Banco Internacional',
            logo: 'https://via.placeholder.com/150',
            description: 'Cuenta Corriente - MXN'
          }
        ]
        
        const mockTransactions: Transaction[] = [
          {
            id: 'mock-tx-1',
            bankId: 'mock-1',
            amount: 1000,
            type: 'income',
            description: 'Depósito',
            date: new Date().toISOString(),
            category: 'ingresos'
          },
          {
            id: 'mock-tx-2',
            bankId: 'mock-1',
            amount: 500,
            type: 'expense',
            description: 'Retiro',
            date: new Date().toISOString(),
            category: 'gastos'
          }
        ]
        
        if (banks.length === 0) setBanks(mockBanks)
        if (transactions.length === 0) setTransactions(mockTransactions)
      }
    } finally {
      setLoading(false)
    }
  }
  
  // Función para obtener un logo basado en el nombre de la institución
  const getInstitutionLogo = (institutionName: string): string => {
    // Mapeo de nombres de instituciones a logos de alta calidad
    const logoMap: Record<string, string> = {
      // Logos de instituciones de Belvo (versión mejorada)
      'Erebor': 'https://i.imgur.com/FZe1YM3.png', // Logo mejorado de Erebor
      'Gringotts': 'https://i.imgur.com/4tKYMpj.png', // Logo mejorado de Gringotts
      'Moria': 'https://i.imgur.com/8LXoNbT.png', // Logo mejorado de Moria
      'Rivendell': 'https://i.imgur.com/qVdUOfs.png', // Logo mejorado de Rivendell
      
      // Logos de bancos reales en alta resolución
      'BBVA': 'https://i.imgur.com/OBN3VLz.png', // Logo BBVA grande
      'Santander': 'https://i.imgur.com/UxZCGbF.png', // Logo Santander grande
      'Banorte': 'https://i.imgur.com/9Hpwx2o.png', // Logo Banorte grande
      'Banamex': 'https://i.imgur.com/Ld3zzJV.png', // Logo Citibanamex grande
      'Bancomer': 'https://i.imgur.com/OBN3VLz.png', // Logo BBVA Bancomer grande
      'HSBC': 'https://i.imgur.com/NpKJJr8.png', // Logo HSBC grande
      'Scotiabank': 'https://i.imgur.com/Aqj2Yt4.png', // Logo Scotiabank grande
      'Banco Azteca': 'https://i.imgur.com/sDGC9Wd.png', // Logo Banco Azteca grande
      'BanCoppel': 'https://i.imgur.com/2XnDokY.png', // Logo BanCoppel grande
      'Inbursa': 'https://i.imgur.com/vQBSNrZ.png', // Logo Inbursa grande
      'Banco Nacional': '/images/banco-nacional.png',
      'Banco Internacional': '/images/banco-internacional.png'
    }
    
    // Buscar coincidencias parciales en el nombre de la institución
    for (const [key, url] of Object.entries(logoMap)) {
      if (institutionName.toLowerCase().includes(key.toLowerCase())) {
        return url
      }
    }
    
    // Logo por defecto
    return '/images/default-bank.png'
  }

  // Load data when user changes
  useEffect(() => {
    fetchBelvoData()
  }, [user])
  
  // Set up online/offline event listeners for syncing
  useEffect(() => {
    const handleOnline = () => {
      // When we come back online, refresh data to sync pending transactions
      refreshData();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [transactions])

  const getBank = (id: string) => {
    return banks.find(bank => bank.id === id)
  }

  const getBankTransactions = (bankId: string) => {
    // Primero buscamos el banco para obtener su linkId
    const bank = banks.find(b => b.id === bankId)
    
    if (!bank) {
      console.warn(`No se encontró el banco con ID ${bankId}`)
      return []
    }
    
    // Filtramos las transacciones por el ID del banco
    return transactions.filter(transaction => transaction.bankId === bankId)
  }
  
  // Función para obtener transacciones directamente de la API usando el linkId
  const fetchBankTransactions = async (bankId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Buscamos el banco para obtener su linkId
      const bank = banks.find(b => b.id === bankId)
      
      if (!bank || !bank.linkId) {
        console.warn(`No se encontró el banco con ID ${bankId} o no tiene linkId`)
        return []
      }
      
      // Obtenemos las transacciones usando el linkId
      const apiTransactions = await belvoAPI.getTransactions(bankId, bank.linkId)
      
      // Mapeamos las transacciones al formato de nuestra aplicación
      const mappedTransactions: Transaction[] = apiTransactions.map(transaction => ({
        id: transaction.id,
        bankId: transaction.account.id,
        amount: Math.abs(transaction.amount),
        type: transaction.amount < 0 ? 'expense' : 'income',
        description: transaction.description || 'Sin descripción',
        date: transaction.value_date || transaction.accounting_date,
        category: transaction.category,
        reference: transaction.reference,
        status: transaction.status
      }))
      
      // Actualizamos las transacciones en el estado
      setTransactions(prev => {
        // Filtramos las transacciones existentes para este banco
        const otherTransactions = prev.filter(t => t.bankId !== bankId)
        // Combinamos con las nuevas transacciones
        return [...otherTransactions, ...mappedTransactions]
      })
      
      return mappedTransactions
    } catch (error) {
      console.error(`Error al obtener transacciones para el banco ${bankId}:`, error)
      setError(`Error al obtener transacciones: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      return []
    } finally {
      setLoading(false)
    }
  }

  const getBalance = () => {
    return transactionService.calculateBalance(transactions);
  }
  
  // Add a new transaction (with offline functionality)
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    // Check if we're online
    const isOnline = navigator.onLine;
    
    if (isOnline) {
      // If online, we would normally send to API
      // For demo, we'll just add it locally
      const newTransaction: Transaction = {
        ...transaction,
        id: `online-${Date.now()}`,
        date: new Date().toISOString()
      }
      setTransactions(prev => [...prev, newTransaction])
    } else {
      // If offline, save to pending transactions
      const newTransaction = transactionService.savePendingTransaction(transaction);
      setTransactions(prev => [...prev, newTransaction])
    }
  }
  
  // Function to manually refresh data and sync pending transactions
  const refreshData = async () => {
    // Check for pending transactions
    const pendingTransactions = transactionService.getPendingTransactions();
    
    // If we're online and have pending transactions, sync them
    if (navigator.onLine && pendingTransactions.length > 0) {
      // In a real app, we would send these to the API
      // For demo, we'll just add them to our state if they're not already there
      const pendingIds = pendingTransactions.map(t => t.id);
      const existingIds = transactions.map(t => t.id);
      
      // Filter out transactions that are already in our state
      const newTransactions = pendingTransactions.filter(t => !existingIds.includes(t.id));
      
      if (newTransactions.length > 0) {
        setTransactions(prev => [...prev, ...newTransactions]);
      }
      
      // Clear pending transactions
      transactionService.clearPendingTransactions();
    }
    
    // Fetch fresh data
    await fetchBelvoData();
  }

  return (
    <BankContext.Provider value={{ 
      banks, 
      transactions, 
      loading,
      error,
      getBank, 
      getBankTransactions,
      fetchBankTransactions, 
      getBalance,
      addTransaction,
      refreshData
    }}>
      {children}
    </BankContext.Provider>
  )
}

export const useBank = () => {
  const context = useContext(BankContext)
  if (context === undefined) {
    throw new Error('useBank must be used within a BankProvider')
  }
  return context
}
