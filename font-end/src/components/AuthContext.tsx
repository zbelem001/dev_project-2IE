'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  date_creation?: string;
  useractive?: number;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fonction pour récupérer les données utilisateur depuis l'API
  const fetchUserData = useCallback(async (authToken: string): Promise<User | null> => {
    try {
      if (!authToken) {
        console.error('Token non disponible');
        return null;
      }

      const response = await fetch('http://localhost:4400/api/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Token invalide ou expiré');
          // Nettoyer les données d'authentification
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          setToken(null);
          setUser(null);
          return null;
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (!result.Error && result.user) {
        return result.user;
      } else {
        console.error('Erreur lors de la récupération des données:', result.Message);
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      return null;
    }
  }, []);

  // Fonction pour rafraîchir les données utilisateur (stabilisée avec useCallback)
  const refreshUserData = useCallback(async (): Promise<void> => {
    if (!token) {
      console.log('Aucun token disponible pour rafraîchir les données');
      return;
    }

    const userData = await fetchUserData(token);
    if (userData) {
      setUser(userData);
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  }, [token, fetchUserData]);

  useEffect(() => {
    // Vérifier les données d'authentification au chargement
    const storedToken = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('userData');

    if (storedToken && storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        setToken(storedToken);
        setUser(userData);
        
        // Rafraîchir les données depuis l'API (une seule fois au chargement)
        fetchUserData(storedToken).then((freshUserData) => {
          if (freshUserData) {
            setUser(freshUserData);
            localStorage.setItem('userData', JSON.stringify(freshUserData));
          }
        });
      } catch (error) {
        console.error('Erreur lors du parsing des données utilisateur:', error);
        // Nettoyer les données corrompues
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      }
    }
    setIsLoading(false);
  }, [fetchUserData]);

  const login = useCallback((userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('userData', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    router.push('/');
  }, [router]);

  const updateUser = useCallback((userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    updateUser,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 