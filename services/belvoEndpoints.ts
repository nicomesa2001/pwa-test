/**
 * Endpoints y funciones para consumir la API de Belvo
 */

// Base URL de la API de Belvo
const BELVO_API_URL = 'https://sandbox.belvo.com';

// Credenciales de API para Belvo Sandbox
const BELVO_SECRET_ID = '4b6f663c-d7be-4aa9-a3b1-647ed4cc2684';
const BELVO_SECRET_PASSWORD = 'FfA7Xa3dOt-EOR75DaZpW3e4dFWQ_SUAbJOZ5yeD*Q__pdgoou1MvZ0Almf1xrx1';

// Función para obtener un token de acceso básico (Basic Auth)
function getBasicAuthToken(): string {
  return 'Basic ' + btoa(`${BELVO_SECRET_ID}:${BELVO_SECRET_PASSWORD}`);
}

// Interfaces para las respuestas de la API
export interface BelvoInstitution {
  id: string;
  name: string;
  type: string;
  website: string;
  display_name: string;
  country_codes: string[];
  primary_color: string;
  logo: string;
  form_fields: any[];
  features: string[];
  resources: string[];
  // Otros campos según la documentación de Belvo
}

export interface BelvoLink {
  id: string;
  institution: string;
  access_mode: string;
  status: string;
  refresh_rate: string;
  created_at: string;
  last_accessed_at: string;
  external_id: string;
  institution_user_id: string;
  // Otros campos según la documentación de Belvo
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
  number: string;
  balance: {
    current: number;
    available: number;
  };
  category: string;
  currency: string;
  public_identification_name: string;
  public_identification_value: string;
  // Otros campos según la documentación de Belvo
}

export interface BelvoTransaction {
  id: string;
  account: {
    id: string;
    link: string;
    institution: {
      name: string;
      type: string;
      logo?: string;
    };
    name: string;
    type: string;
    number: string;
    balance: {
      current: number;
    };
    currency: string;
  };
  amount: number;
  balance: number;
  currency: string;
  description: string;
  observations?: string;
  merchant?: {
    name: string;
    website: string;
  };
  collected_at: string;
  value_date: string;
  accounting_date: string;
  status: string;
  type: string;
  reference: string;
  category: string;
}

/**
 * Obtener todas las instituciones financieras disponibles
 */
export async function getInstitutions(): Promise<BelvoInstitution[]> {
  try {
    const response = await fetch(`${BELVO_API_URL}/api/institutions/`, {
      method: 'GET',
      headers: {
        'Authorization': getBasicAuthToken(),
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Error al obtener instituciones: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : (data.results || []);
  } catch (error) {
    console.error('Error en getInstitutions:', error);
    return []; // Retornamos un array vacío en lugar de lanzar el error
  }
}

export async function getLinks(): Promise<BelvoLink[]> {
  try {
    let allLinks: BelvoLink[] = [];
    let nextPage: string | null = `${BELVO_API_URL}/api/links/`;
    
    console.log(`Fetching links from: ${nextPage}`);
    
    while (nextPage) {
      const response = await fetch(nextPage, {
        method: 'GET',
        headers: {
          'Authorization': getBasicAuthToken(),
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error al obtener links: ${response.status}`);
      }
      
      const data: any = await response.json();
      console.log('Links data:', data);
      
      if (Array.isArray(data)) {
        allLinks = [...allLinks, ...data];
        nextPage = null;
      } else if (data.results && Array.isArray(data.results)) {
        allLinks = [...allLinks, ...data.results];
        nextPage = data.next;
        
        if (nextPage) {
          console.log(`Fetching next page of links: ${nextPage}`);
        }
      } else {
        nextPage = null;
      }
    }
    
    return allLinks;
  } catch (error) {
    console.error('Error en getLinks:', error);
    return []; // Retornamos un array vacío en lugar de lanzar el error
  }
}



/**
 * Obtener todas las cuentas de un link específico
 */
export async function getAccounts(linkId: string): Promise<BelvoAccount[]> {
  try {
    if (!linkId) {
      console.error('Se requiere un ID de link para obtener cuentas');
      return [];
    }
    
    let allAccounts: BelvoAccount[] = [];
    let nextPage: string | null = `${BELVO_API_URL}/api/accounts/?link=${linkId}`;
    
    // Manejar paginación
    while (nextPage) {
      const response = await fetch(nextPage, {
        method: 'GET',
        headers: {
          'Authorization': getBasicAuthToken(),
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response para link ${linkId}:`, errorText);
        throw new Error(`Error al obtener cuentas: ${response.status}`);
      }
      
      const data: any = await response.json();
      
      if (Array.isArray(data)) {
        allAccounts = [...allAccounts, ...data];
        nextPage = null;
      } else if (data.results && Array.isArray(data.results)) {
        allAccounts = [...allAccounts, ...data.results];
        nextPage = data.next;
      } else {
        nextPage = null;
      }
    }
    
    return allAccounts;
  } catch (error) {
    console.error(`Error en getAccounts para link ${linkId}:`, error);
    return [];
  }
}

/**
 * Obtener todas las cuentas de todos los links
 */
export async function getAllAccounts(): Promise<BelvoAccount[]> {
  try {
    // Primero obtenemos todos los links disponibles
    const links = await getLinks();
    
    if (links.length === 0) {
      console.warn('No se encontraron links para obtener cuentas');
      return [];
    }
    
    // Para cada link, obtenemos sus cuentas
    let allAccounts: BelvoAccount[] = [];
    
    // Procesamos cada link de forma secuencial para evitar demasiadas solicitudes simultáneas
    for (const link of links) {
      try {
        const linkAccounts = await getAccounts(link.id);
        allAccounts = [...allAccounts, ...linkAccounts];
      } catch (error) {
        console.error(`Error al obtener cuentas para el link ${link.id}:`, error);
        // Continuamos con el siguiente link aunque haya error en uno
      }
    }
    
    return allAccounts;
  } catch (error) {
    console.error('Error en getAllAccounts:', error);
    return []; // Retornamos un array vacío en lugar de lanzar el error
  }
}

// Datos mockeados para transacciones
const MOCK_TRANSACTIONS: BelvoTransaction[] = [
  {
    id: 'tx-001',
    account: {
      id: 'acc-001',
      link: 'link-001',
      institution: {
        name: 'Erebor',
        type: 'bank',
        logo: 'https://i.imgur.com/FZe1YM3.png'
      },
      name: 'Cuenta de Ahorros',
      type: 'savings',
      number: '1234567890',
      balance: {
        current: 5000
      },
      currency: 'MXN'
    },
    collected_at: '2025-04-11T00:00:00Z',
    value_date: '2025-04-10T00:00:00Z',
    accounting_date: '2025-04-10T00:00:00Z',
    amount: 1500,
    balance: 5000,
    currency: 'MXN',
    description: 'Depósito en efectivo',
    observations: '',
    merchant: {
      name: '',
      website: ''
    },
    category: 'ingresos',
    reference: 'REF123456',
    type: 'inflow',
    status: 'completed'
  },
  {
    id: 'tx-002',
    account: {
      id: 'acc-001',
      link: 'link-001',
      institution: {
        name: 'Erebor',
        type: 'bank',
        logo: 'https://i.imgur.com/FZe1YM3.png'
      },
      name: 'Cuenta de Ahorros',
      type: 'savings',
      number: '1234567890',
      balance: {
        current: 5000
      },
      currency: 'MXN'
    },
    collected_at: '2025-04-11T00:00:00Z',
    value_date: '2025-04-09T00:00:00Z',
    accounting_date: '2025-04-09T00:00:00Z',
    amount: -500,
    balance: 3500,
    currency: 'MXN',
    description: 'Pago de servicios',
    observations: 'Electricidad',
    merchant: {
      name: 'CFE',
      website: 'cfe.gob.mx'
    },
    category: 'servicios',
    reference: 'REF654321',
    type: 'outflow',
    status: 'completed'
  },
  {
    id: 'tx-003',
    account: {
      id: 'acc-002',
      link: 'link-002',
      institution: {
        name: 'Gringotts',
        type: 'bank',
        logo: 'https://i.imgur.com/4tKYMpj.png'
      },
      name: 'Cuenta Corriente',
      type: 'checking',
      number: '0987654321',
      balance: {
        current: 8000
      },
      currency: 'MXN'
    },
    collected_at: '2025-04-11T00:00:00Z',
    value_date: '2025-04-08T00:00:00Z',
    accounting_date: '2025-04-08T00:00:00Z',
    amount: 2000,
    balance: 8000,
    currency: 'MXN',
    description: 'Transferencia recibida',
    observations: 'Pago de cliente',
    merchant: {
      name: 'Cliente XYZ',
      website: ''
    },
    category: 'ingresos',
    reference: 'REF789012',
    type: 'inflow',
    status: 'completed'
  },
  {
    id: 'tx-004',
    account: {
      id: 'acc-002',
      link: 'link-002',
      institution: {
        name: 'Gringotts',
        type: 'bank',
        logo: 'https://i.imgur.com/4tKYMpj.png'
      },
      name: 'Cuenta Corriente',
      type: 'checking',
      number: '0987654321',
      balance: {
        current: 8000
      },
      currency: 'MXN'
    },
    collected_at: '2025-04-11T00:00:00Z',
    value_date: '2025-04-07T00:00:00Z',
    accounting_date: '2025-04-07T00:00:00Z',
    amount: -1000,
    balance: 6000,
    currency: 'MXN',
    description: 'Retiro en cajero',
    observations: 'Cajero Bancomer',
    merchant: {
      name: 'Bancomer',
      website: 'bancomer.com'
    },
    category: 'retiros',
    reference: 'REF345678',
    type: 'outflow',
    status: 'completed'
  },
  {
    id: 'tx-005',
    account: {
      id: 'acc-003',
      link: 'link-003',
      institution: {
        name: 'Moria',
        type: 'bank',
        logo: 'https://i.imgur.com/8LXoNbT.png'
      },
      name: 'Cuenta de Inversiones',
      type: 'investment',
      number: '5678901234',
      balance: {
        current: 15000
      },
      currency: 'MXN'
    },
    collected_at: '2025-04-11T00:00:00Z',
    value_date: '2025-04-06T00:00:00Z',
    accounting_date: '2025-04-06T00:00:00Z',
    amount: 5000,
    balance: 15000,
    currency: 'MXN',
    description: 'Rendimiento de inversiones',
    observations: 'Fondo de inversión',
    merchant: {
      name: 'Moria Inversiones',
      website: 'moria.com'
    },
    category: 'inversiones',
    reference: 'REF901234',
    type: 'inflow',
    status: 'completed'
  }
];

export async function getTransactions(linkId: string, accountId?: string): Promise<BelvoTransaction[]> {
  console.log(`[MOCK] Obteniendo transacciones para link: ${linkId}, cuenta: ${accountId || 'todas'}`);
  
  // Simulamos un pequeño retraso para imitar la llamada a la API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // Filtramos las transacciones según los parámetros proporcionados
    let filteredTransactions = [...MOCK_TRANSACTIONS];
    
    // Filtrar por link si se proporciona
    if (linkId) {
      filteredTransactions = filteredTransactions.filter(tx => tx.account.link === linkId);
    }
    
    // Filtrar por cuenta si se proporciona
    if (accountId) {
      filteredTransactions = filteredTransactions.filter(tx => tx.account.id === accountId);
    }
    
    console.log(`[MOCK] Se encontraron ${filteredTransactions.length} transacciones`);
    return filteredTransactions;
  } catch (error) {
    console.error(`Error en getTransactions:`, error);
    return [];
  }
}

export async function getAllTransactions(): Promise<BelvoTransaction[]> {
  console.log('[MOCK] Obteniendo todas las transacciones');
  
  // Simulamos un pequeño retraso para imitar la llamada a la API
  await new Promise(resolve => setTimeout(resolve, 800));
  
  try {
    // Devolvemos todas las transacciones mockeadas
    return MOCK_TRANSACTIONS;
  } catch (error) {
    console.error('Error en getAllTransactions (mock):', error);
    return [];
  }
}


