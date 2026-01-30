import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  hasProduct: boolean;
  createdAt: string;
  premiumExpiresAt?: string;
  trialStartedAt?: string;
  lastNotificationTime?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  remainingTime: number;
  
  login: (email: string, password: string, name?: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  activatePremium: (duration: number) => Promise<void>;
  activateProduct: () => Promise<void>;
}

const STORAGE_KEY = '@cicero_user';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEY);
      if (userData) {
        const parsedUser = JSON.parse(userData);
        
        if (parsedUser.premiumExpiresAt) {
          const expiryDate = new Date(parsedUser.premiumExpiresAt);
          if (expiryDate < new Date()) {
            parsedUser.isPremium = false;
            parsedUser.premiumExpiresAt = undefined;
          }
        }
        
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const saveUser = useCallback(async (userData: User | null) => {
    try {
      if (userData) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }, []);

  const login = useCallback(async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name: name || email.split('@')[0],
        isPremium: false,
        hasProduct: false,
        createdAt: new Date().toISOString(),
      };
      
      setUser(newUser);
      await saveUser(newUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [saveUser]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        isPremium: false,
        hasProduct: false,
        createdAt: new Date().toISOString(),
      };
      
      setUser(newUser);
      await saveUser(newUser);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [saveUser]);

  const logout = useCallback(async () => {
    setUser(null);
    await saveUser(null);
  }, [saveUser]);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    await saveUser(updatedUser);
  }, [user, saveUser]);

  const activatePremium = useCallback(async (durationDays: number) => {
    if (!user) return;
    
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(expiryDate.getDate() + durationDays);
    
    const updatedUser = {
      ...user,
      isPremium: true,
      premiumExpiresAt: expiryDate.toISOString(),
      trialStartedAt: user.trialStartedAt || now.toISOString(),
    };
    
    setUser(updatedUser);
    await saveUser(updatedUser);
  }, [user, saveUser]);

  const activateProduct = useCallback(async () => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      hasProduct: true,
    };
    
    setUser(updatedUser);
    await saveUser(updatedUser);
  }, [user, saveUser]);

  const remainingTime = useMemo(() => {
    if (!user?.premiumExpiresAt) return 0;
    const expiry = new Date(user.premiumExpiresAt);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / 1000));
  }, [user?.premiumExpiresAt]);

  useEffect(() => {
    if (!user?.premiumExpiresAt) return;
    
    const interval = setInterval(() => {
      const expiry = new Date(user.premiumExpiresAt!);
      const now = new Date();
      if (expiry < now && user.isPremium) {
        updateUser({ isPremium: false, premiumExpiresAt: undefined });
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [user?.premiumExpiresAt, user?.isPremium, updateUser]);

  return useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    remainingTime,
    login,
    register,
    logout,
    updateUser,
    activatePremium,
    activateProduct,
  }), [user, isLoading, remainingTime, login, register, logout, updateUser, activatePremium, activateProduct]);
});
