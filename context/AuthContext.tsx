import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiService, User, API_CONFIG, setAuthToken, setBackendBaseUrl, getDefaultBaseUrl } from '@/services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  serverOnline: boolean;
  backendUrl: string;
  login: (studentId: string, password: string) => Promise<void>;
  loginSSO: (ssoToken: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  checkServerHealth: () => Promise<boolean>;
  updateBackendUrl: (url: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [serverOnline, setServerOnline] = useState<boolean>(false);
  const [backendUrl, setBackendUrlState] = useState<string>(API_CONFIG.BASE_URL);

  // Check backend connectivity on mount
  useEffect(() => {
    checkServerHealth();
  }, [backendUrl]);

  const checkServerHealth = async (): Promise<boolean> => {
    try {
      const res = await ApiService.testConnection();
      if (res && res.status === 'ONLINE') {
        setServerOnline(true);
        return true;
      }
      setServerOnline(false);
      return false;
    } catch (e) {
      setServerOnline(false);
      return false;
    }
  };

  const updateBackendUrl = (url: string) => {
    setBackendBaseUrl(url);
    setBackendUrlState(url);
    checkServerHealth();
  };

  const login = async (studentId: string, password: string) => {
    setIsLoading(true);
    try {
      const authData = await ApiService.login(studentId, password);
      setToken(authData.accessToken);
      setUser(authData.user);
      setAuthToken(authData.accessToken);
      setServerOnline(true);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginSSO = async (ssoToken: string) => {
    setIsLoading(true);
    try {
      const authData = await ApiService.loginWithSSO(ssoToken);
      setToken(authData.accessToken);
      setUser(authData.user);
      setAuthToken(authData.accessToken);
      setServerOnline(true);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await ApiService.getMe(token);
      if (res?.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.warn('Failed to refresh user profile', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        serverOnline,
        backendUrl,
        login,
        loginSSO,
        logout,
        refreshUser,
        checkServerHealth,
        updateBackendUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
