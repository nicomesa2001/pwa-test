import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-users-4ou5.onrender.com'; // URL base de la API de usuarios

export interface UserData {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

/**
 * Servicio para manejar la autenticación con la API de usuarios
 */
const authService = {
  /**
   * Iniciar sesión con email y contraseña
   * @param email Correo electrónico del usuario
   * @param password Contraseña del usuario
   * @returns Objeto con token de acceso y tipo de token
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', email); // La API espera el email en el campo username
    formData.append('password', password);

    try {
      const response = await axios.post<AuthResponse>(
        `${API_URL}/auth/token`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  },

  /**
   * Registrar un nuevo usuario
   * @param fullName Nombre completo del usuario
   * @param email Correo electrónico del usuario
   * @param password Contraseña del usuario
   * @returns Datos del usuario registrado
   */
  register: async (fullName: string, email: string, password: string): Promise<UserData> => {
    try {
      const response = await axios.post<UserData>(`${API_URL}/users/`, {
        full_name: fullName,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  },

  /**
   * Obtener información del usuario actual
   * @param token Token de acceso JWT
   * @returns Datos del usuario
   */
  getCurrentUser: async (token: string): Promise<UserData> => {
    try {
      const response = await axios.get<UserData>(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      throw error;
    }
  },

  /**
   * Actualizar información del usuario
   * @param userId ID del usuario
   * @param userData Datos a actualizar
   * @param token Token de acceso JWT
   * @returns Datos actualizados del usuario
   */
  updateUser: async (
    userId: number,
    userData: { full_name?: string; email?: string; password?: string },
    token: string
  ): Promise<UserData> => {
    try {
      const response = await axios.put<UserData>(
        `${API_URL}/users/${userId}`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  },
};

export default authService;
