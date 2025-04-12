// Interfaces for Belvo API responses
export interface BelvoLink {
  id: string;
  institution: string;
  institution_name: string;
  status: string;
  created_at: string;
  last_accessed_at: string;
}

export interface BelvoAccount {
  id: string;
  link: string;
  institution: {
    name: string;
    type: string;
  };
  name: string;
  type: string;
  balance: {
    current: number;
    available: number;
  };
  category: string;
  currency: string;
  public_identification_name: string;
  public_identification_value: string;
}

export interface BelvoTransaction {
  id: string;
  account: {
    id: string;
    name: string;
    category: string;
  };
  amount: number;
  balance: number;
  currency: string;
  description: string;
  collected_at: string;
  value_date: string;
  accounting_date: string;
  status: string;
  type: string;
  reference: string;
  category: string;
}

// Our app's simplified interfaces
export interface Bank {
  id: string;
  name: string;
  logo: string;
  description: string;
  linkId?: string;
}

export interface Transaction {
  id: string;
  bankId: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  category?: string;
  reference?: string;
}

// Belvo API configuration
const BELVO_API_URL = 'https://sandbox.belvo.com';

// Bank logos mapping (since Belvo doesn't provide logos)
const bankLogos: Record<string, string> = {
  'erebor_mx_retail': 'https://cdn.belvo.io/institutions/erebor_mx_retail.png',
  'gringotts_mx_retail': 'https://cdn.belvo.io/institutions/gringotts_mx_retail.png',
  'moria_mx_retail': 'https://cdn.belvo.io/institutions/moria_mx_retail.png',
  'rivendell_mx_retail': 'https://cdn.belvo.io/institutions/rivendell_mx_retail.png',
  'default': 'https://via.placeholder.com/150'
};

/**
 * Service class to handle all Belvo API interactions
 */
class BelvoService {
  /**
   * Fetch links (connected bank accounts) from Belvo API
   */
  async fetchLinks(token: string): Promise<BelvoLink[]> {
    try {
      const response = await fetch(`${BELVO_API_URL}/api/links/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch links');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching links:', error);
      throw error;
    }
  }
  
  /**
   * Fetch accounts for a specific link from Belvo API
   */
  async fetchAccounts(token: string, linkId: string): Promise<BelvoAccount[]> {
    try {
      const response = await fetch(`${BELVO_API_URL}/api/accounts/?link=${linkId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  }
  
  /**
   * Fetch transactions for a specific account from Belvo API
   */
  async fetchTransactions(token: string, accountId: string): Promise<BelvoTransaction[]> {
    try {
      const response = await fetch(`${BELVO_API_URL}/api/transactions/?account=${accountId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }
  
  /**
   * Fetch all data from Belvo API and transform it to our app's format
   */
  async fetchAllData(token: string): Promise<{ banks: Bank[], transactions: Transaction[] }> {
    try {
      // Fetch links (connected bank accounts)
      const linksData = await this.fetchLinks(token);
      
      // Fetch accounts for each link
      const accountsPromises = linksData.map(link => this.fetchAccounts(token, link.id));
      const accountsData = await Promise.all(accountsPromises);
      
      // Flatten accounts and map to our Bank interface
      const flattenedAccounts = accountsData.flat();
      
      // Map accounts to banks
      const mappedBanks: Bank[] = flattenedAccounts.map((account) => {
        const link = linksData.find(l => l.id === account.link);
        const institutionKey = link?.institution || 'default';
        
        return {
          id: account.id,
          name: account.name || link?.institution_name || 'Unknown Bank',
          logo: bankLogos[institutionKey] || bankLogos.default,
          description: `${account.type} - ${account.currency}`,
          linkId: account.link
        };
      });
      
      // Fetch transactions for all accounts
      const transactionsPromises = flattenedAccounts.map(account => 
        this.fetchTransactions(token, account.id)
      );
      
      const transactionsData = await Promise.all(transactionsPromises);
      
      // Flatten and map transactions to our Transaction interface
      const flattenedTransactions = transactionsData.flat();
      const mappedTransactions: Transaction[] = flattenedTransactions.map(transaction => ({
        id: transaction.id,
        bankId: transaction.account.id,
        amount: Math.abs(transaction.amount),
        type: transaction.amount < 0 ? 'expense' : 'income',
        description: transaction.description || 'No description',
        date: transaction.value_date,
        category: transaction.category,
        reference: transaction.reference
      }));
      
      return {
        banks: mappedBanks,
        transactions: mappedTransactions
      };
    } catch (error) {
      console.error('Error fetching all data from Belvo:', error);
      throw error;
    }
  }
  
  /**
   * Get mock data for offline or fallback use
   */
  getMockData(): { banks: Bank[], transactions: Transaction[] } {
    const banks: Bank[] = [
      {
        id: '1',
        name: 'Banco Nacional',
        logo: 'https://via.placeholder.com/150',
        description: 'Banco Nacional de Desarrollo'
      },
      {
        id: '2',
        name: 'Banco Internacional',
        logo: 'https://via.placeholder.com/150',
        description: 'Servicios financieros internacionales'
      }
    ];
    
    const transactions: Transaction[] = [
      {
        id: '1',
        bankId: '1',
        amount: 1000,
        type: 'income',
        description: 'Depósito',
        date: new Date().toISOString()
      },
      {
        id: '2',
        bankId: '1',
        amount: 500,
        type: 'expense',
        description: 'Retiro',
        date: new Date().toISOString()
      }
    ];
    
    return { banks, transactions };
  }
}

// Export a singleton instance
export const belvoService = new BelvoService();
