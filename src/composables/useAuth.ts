import { ref, computed } from 'vue';
import type { User, LoginCredentials } from '../types/auth';

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: '123456'
};

const currentUser = ref<User | null>(null);

export function useAuth() {
  const isAuthenticated = computed(() => currentUser.value?.isAuthenticated ?? false);

  const login = (credentials: LoginCredentials): boolean => {
    if (
      credentials.username === ADMIN_CREDENTIALS.username &&
      credentials.password === ADMIN_CREDENTIALS.password
    ) {
      currentUser.value = {
        username: credentials.username,
        isAuthenticated: true
      };
      localStorage.setItem('auth_token', 'authenticated');
      return true;
    }
    return false;
  };

  const logout = (): void => {
    currentUser.value = null;
    localStorage.removeItem('auth_token');
  };

  const checkAuthStatus = (): void => {
    const token = localStorage.getItem('auth_token');
    if (token === 'authenticated') {
      currentUser.value = {
        username: ADMIN_CREDENTIALS.username,
        isAuthenticated: true
      };
    }
  };

  return {
    currentUser,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus
  };
}