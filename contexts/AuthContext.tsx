'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 [AUTH] Checking for existing session...');
    
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log('❌ [AUTH] Session check error:', error.message);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('✅ [AUTH] Found existing session for:', session.user.email);
          setUser({
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at,
          });
        } else {
          console.log('ℹ️ [AUTH] No existing session found');
        }
      } catch (error) {
        console.log('❌ [AUTH] Session check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [AUTH] Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ [AUTH] User signed in:', session.user.email);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at,
        });
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 [AUTH] User signed out');
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('🔐 [LOGIN] Attempting login for:', email);
    
    try {
      // Basic input validation
      if (!email || !password) {
        console.log('❌ [LOGIN] Missing email or password');
        return { success: false, error: 'Please enter both email and password.' };
      }

      if (!email.includes('@')) {
        console.log('❌ [LOGIN] Invalid email format:', email);
        return { success: false, error: 'Please enter a valid email address.' };
      }

      console.log('🔐 [LOGIN] Attempting Supabase auth for:', email);
      
      // Attempt Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (error) {
        console.log('❌ [LOGIN] Supabase auth failed for:', email, 'error:', error.message);
        return { success: false, error: 'Invalid email or password. Please try again.' };
      }

      if (data.user) {
        console.log('✅ [LOGIN] Supabase auth successful for:', email);
        return { success: true };
      }

      console.log('❌ [LOGIN] No user data returned from Supabase auth');
      return { success: false, error: 'Authentication failed. Please try again.' };

    } catch (error) {
      console.log('❌ [LOGIN] Generic auth error for:', email, error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  };

  const logout = async () => {
    console.log('👋 [LOGOUT] Logging out user:', user?.email);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.log('❌ [LOGOUT] Error during logout:', error.message);
      } else {
        console.log('✅ [LOGOUT] User logged out successfully');
      }
      
      setUser(null);
    } catch (error) {
      console.log('❌ [LOGOUT] Generic logout error:', error);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};