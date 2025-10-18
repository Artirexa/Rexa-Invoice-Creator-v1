import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { InvoiceProvider } from "./contexts/InvoiceContext";
import Index from "./pages/Index";
import InvoiceEditor from "./pages/InvoiceEditor";
import InvoicePreview from "./pages/InvoicePreview";
import InvoiceList from "./pages/InvoiceList";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PasswordReset from "./pages/PasswordReset";
import NotFound from "./pages/NotFound";
import OAuthCallback from "./pages/OAuthCallback";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { initializeDatabase } from "./lib/database";
import AuthService from "./lib/authService";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

const AuthContext = createContext<{
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  sendEmailVerification: () => Promise<{ success: boolean; error?: string }>;
  isEmailVerified: () => Promise<boolean>;
}>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: async () => ({ success: false }),
  resetPassword: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  updatePassword: async () => ({ success: false }),
  sendEmailVerification: async () => ({ success: false }),
  isEmailVerified: async () => false,
});

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setUser(session?.user || null);
        setIsAuthenticated(!!session);
        setIsLoading(false);

        // Handle different auth events
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            await initializeDatabase();
            toast.success('Welcome back!');
          } catch (error) {
            console.error('Database initialization error:', error);
            toast.error('Failed to initialize your account');
          }
        } else if (event === 'SIGNED_OUT') {
          toast.info('You have been logged out');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }
      }
    );

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        setIsAuthenticated(!!session);
        
        if (session?.user) {
          await initializeDatabase();
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const result = await AuthService.login(email, password);
    
    if (result.error) {
      return { success: false, error: result.error };
    }

    setUser(result.user);
    setIsAuthenticated(true);
    return { success: true };
  };

  const signup = async (email: string, password: string, name: string) => {
    const result = await AuthService.signup(email, password, name);
    
    if (result.error) {
      return { success: false, error: result.error };
    }

    setUser(result.user);
    setIsAuthenticated(true);
    return { success: true };
  };

  const logout = async () => {
    const result = await AuthService.logout();
    
    if (result.error) {
      return { success: false, error: result.error };
    }

    setUser(null);
    setIsAuthenticated(false);
    return { success: true };
  };

  const resetPassword = async (email: string) => {
    return await AuthService.resetPassword(email);
  };

  const loginWithGoogle = async () => {
    return await AuthService.signInWithGoogle();
  };

  const updatePassword = async (newPassword: string) => {
    return await AuthService.updatePassword(newPassword);
  };

  const sendEmailVerification = async () => {
    return await AuthService.sendEmailVerification();
  };

  const isEmailVerified = async () => {
    return await AuthService.isEmailVerified();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        signup,
        logout,
        resetPassword,
        loginWithGoogle,
        updatePassword,
        sendEmailVerification,
        isEmailVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <InvoiceProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/editor" element={
                <ProtectedRoute>
                  <InvoiceEditor />
                </ProtectedRoute>
              } />
              <Route path="/preview" element={
                <ProtectedRoute>
                  <InvoicePreview />
                </ProtectedRoute>
              } />
              <Route path="/invoices" element={
                <ProtectedRoute>
                  <InvoiceList />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<PasswordReset />} />
              <Route path="/auth/callback" element={<OAuthCallback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </InvoiceProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
