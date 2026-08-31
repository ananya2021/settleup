import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useRef,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import type { AuthState, SignInParams, SignUpParams } from '../types';

interface AuthContextValue extends AuthState {
  signIn: (params: SignInParams) => Promise<{ error?: string }>;
  signUp: (params: SignUpParams) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  // Tracks whether the initial session lookup has completed.
  const sessionResolvedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    // ---------------------------------------------------------
    // INITIAL SESSION
    // ---------------------------------------------------------
    const initializeAuth = async () => {
      console.log('[Auth] Getting initial session...');

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error('[Auth] getSession error:', error);
      }

      sessionResolvedRef.current = true;

      console.log('[Auth] Initial session:', {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
      });

      setState({
        user: session?.user
          ? {
              id: session.user.id,
              email: session.user.email ?? '',
            }
          : null,
        loading: false,
      });
    };

    initializeAuth();

    // ---------------------------------------------------------
    // AUTH STATE CHANGES
    // ---------------------------------------------------------
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] onAuthStateChange:', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        sessionResolved: sessionResolvedRef.current,
        pathname: window.location.pathname,
      });

      if (!mounted) return;

      setState({
        user: session?.user
          ? {
              id: session.user.id,
              email: session.user.email ?? '',
            }
          : null,
        loading: false,
      });
    });

    // ---------------------------------------------------------
    // CLEANUP
    // ---------------------------------------------------------
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // -----------------------------------------------------------
  // SIGN IN
  // -----------------------------------------------------------
  const signIn = useCallback(async (params: SignInParams) => {
    console.log('[Auth] Attempting sign in:', {
      email: params.email,
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: params.email,
      password: params.password,
    });

    console.log('[Auth] signIn result:', {
      hasError: !!error,
      errorMessage: error?.message,
      hasSession: !!data?.session,
      hasUser: !!data?.user,
      userId: data?.user?.id,
    });

    if (error) {
      return {
        error: error.message,
      };
    }

    return {};
  }, []);

  // -----------------------------------------------------------
  // SIGN UP
  // -----------------------------------------------------------
  const signUp = useCallback(async (params: SignUpParams) => {
    console.log('[Auth] Attempting sign up:', {
      email: params.email,
    });

    const { error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          name: params.name,
        },
      },
    });

    if (error) {
      console.error('[Auth] signUp error:', error.message);

      return {
        error: error.message,
      };
    }

    return {};
  }, []);

  // -----------------------------------------------------------
  // SIGN OUT
  // -----------------------------------------------------------
  const signOut = useCallback(async () => {
    console.log('[Auth] Signing out...');

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[Auth] signOut error:', error.message);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}