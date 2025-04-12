import { Transaction } from './belvoService';

/**
 * Service to handle transaction operations, including offline functionality
 */
class TransactionService {
  private readonly STORAGE_KEY = 'pendingTransactions';
  
  /**
   * Get all pending transactions from local storage
   */
  getPendingTransactions(): Transaction[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading pending transactions:', error);
      return [];
    }
  }
  
  /**
   * Save a transaction to be synced later when online
   */
  savePendingTransaction(transaction: Omit<Transaction, 'id' | 'date'>): Transaction {
    const newTransaction: Transaction = {
      ...transaction,
      id: `local-${Date.now()}`,
      date: new Date().toISOString()
    };
    
    const pendingTransactions = this.getPendingTransactions();
    pendingTransactions.push(newTransaction);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pendingTransactions));
    
    // Show notification if available
    this.showOfflineNotification();
    
    return newTransaction;
  }
  
  /**
   * Clear all pending transactions
   */
  clearPendingTransactions(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
  
  /**
   * Show a notification about offline transaction
   */
  private showOfflineNotification(): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Transacción guardada offline', {
        body: 'Se sincronizará cuando vuelva la conexión a internet',
        icon: '/images/icon-192.png'
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Transacción guardada offline', {
            body: 'Se sincronizará cuando vuelva la conexión a internet',
            icon: '/images/icon-192.png'
          });
        }
      });
    }
  }
  
  /**
   * Format a transaction amount for display
   */
  formatAmount(amount: number, type: 'income' | 'expense'): string {
    return `${type === 'income' ? '+' : '-'}$${amount.toFixed(2)}`;
  }
  
  /**
   * Format a date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  /**
   * Calculate balance from a list of transactions
   */
  calculateBalance(transactions: Transaction[]): number {
    return transactions.reduce((total, transaction) => {
      if (transaction.type === 'income') {
        return total + transaction.amount;
      } else {
        return total - transaction.amount;
      }
    }, 0);
  }
}

// Export a singleton instance
export const transactionService = new TransactionService();
