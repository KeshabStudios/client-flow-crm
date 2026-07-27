import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const navigate = useNavigate();

  // Monitor auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        loading: false,
      }));
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        loading: false,
        error: null,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
    setState((prev) => ({ ...prev, loading: false }));
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    if (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
    // Profile will be created by the database trigger
    setState((prev) => ({ ...prev, loading: false }));
  }, []);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const { error } = await supabase.auth.signOut();
    if (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
    setState({ user: null, loading: false, error: null });
    navigate("/login");
  }, [navigate]);

  const forgotPassword = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
    setState((prev) => ({ ...prev, loading: false }));
  }, []);

  const value = useMemo(
    () => ({
      user: state.user,
      loading: state.loading,
      error: state.error,
      login,
      register,
      logout,
      forgotPassword,
      clearError,
    }),
    [state, login, register, logout, forgotPassword, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
