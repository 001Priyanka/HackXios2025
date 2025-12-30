import api from './api';

export const authService = {
  // Signup user
  signup: async (userData) => {
    try {
      console.log('AuthService: Attempting signup with data:', {
        ...userData,
        password: '[HIDDEN]'
      });

      const response = await api.post('/auth/signup', userData);
      
      console.log('AuthService: Signup response received:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Signup successful'
      };
    } catch (error) {
      console.error('AuthService: Signup error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });

      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed. Please try again.',
        errors: error.response?.data?.errors || [],
        details: error.response?.data?.details || null
      };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log('AuthService: Attempting login with credentials:', {
        phone: credentials.phone,
        password: '[HIDDEN]'
      });

      const response = await api.post('/auth/login', credentials);
      
      console.log('AuthService: Login response received:', {
        status: response.status,
        statusText: response.statusText,
        hasUser: !!response.data.data?.user,
        hasToken: !!response.data.data?.token
      });

      const { user, token } = response.data.data;
      
      // Store token and user data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('AuthService: Token and user data stored in localStorage');

      return {
        success: true,
        data: response.data,
        user,
        token,
        message: response.data.message || 'Login successful'
      };
    } catch (error) {
      console.error('AuthService: Login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });

      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.',
        errors: error.response?.data?.errors || []
      };
    }
  },

  // Logout user
  logout: () => {
    console.log('AuthService: Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('AuthService: Error parsing user data:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const isAuth = !!(token && user);
    console.log('AuthService: Authentication check:', {
      hasToken: !!token,
      hasUser: !!user,
      isAuthenticated: isAuth
    });
    return isAuth;
  },

  // Get user profile from API
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return {
        success: true,
        user: response.data.data.user
      };
    } catch (error) {
      console.error('AuthService: Profile fetch error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch profile'
      };
    }
  }
};