
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

// Define context types
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (emailOrUsername: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        // Handle auth state changes
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
        
        // Use setTimeout to prevent deadlock when fetching additional data
        if (currentSession?.user) {
          setTimeout(() => {
            // Additional actions after login if needed
          }, 0);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });

      if (error) throw error;
      
      // Show success message and navigate to homepage instead of login
      toast.success("Registration successful! A verification email has been sent to your email address. Please check your inbox and verify your account.");
      navigate("/");
    } catch (error: any) {
      if (error.message.includes("already registered")) {
        toast.error("Email already registered. Please login instead.");
      } else {
        toast.error(error.message || "Failed to sign up");
      }
    } finally {
      setLoading(false);
    }
  };

  // Sign in function - modified to handle both email and username
  const signIn = async (emailOrUsername: string, password: string) => {
    try {
      setLoading(true);
      
      // Check if input is an email or username
      const isEmail = emailOrUsername.includes('@');
      
      if (isEmail) {
        // Direct login with email
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailOrUsername,
          password,
        });

        if (error) throw error;
        
        if (data.user) {
          toast.success("Logged in successfully!");
          navigate("/");
        }
      } else {
        // For username login, we need to first find the user's email
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', emailOrUsername)
          .single();

        if (profileError) {
          throw new Error("Username not found. Please check your credentials.");
        }

        // Get user email from auth.users based on profile id
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: emailOrUsername, // We still try with the username as email as fallback
          password,
        });

        if (authError) {
          throw new Error("Invalid login credentials. Please check your username and password.");
        }

        if (data.user) {
          toast.success("Logged in successfully!");
          navigate("/");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Error signing out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
