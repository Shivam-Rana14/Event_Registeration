import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../hooks/use-toast";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session and listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      // Optional: Fetch user metadata (like is_organizer) here if not included in session
      if (session?.user) {
        fetchUserMetadata(session.user.id);
      }
    });

    // Also fetch initial session separately to set initial user state faster
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        fetchUserMetadata(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Function to fetch additional user data like is_organizer from 'users' table
  const fetchUserMetadata = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("is_organizer")
        .eq("id", userId)
        .single();

      if (error) throw error;

      // Update user state with metadata
      setUser((prevUser) => ({
        ...prevUser,
        is_organizer: data?.is_organizer || false,
      }));
    } catch (error) {
      console.error("Error fetching user metadata:", error);
      // Optionally, show a toast error
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // User is automatically set by onAuthStateChange
      return { user: data.user, error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign In Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, full_name, is_organizer) => {
    try {
      setLoading(true);
      // Sign up the user with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            is_organizer,
          },
        },
      });

      if (authError) throw authError;

      // Insert user metadata into the 'users' table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            full_name,
            is_organizer,
          },
        ]);

      if (userError) {
        console.error(
          "Error inserting user metadata after auth signup:",
          userError
        );
      }

      return { user: authData.user, error: null };
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Sign Up Failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null); // Clear user state immediately
      navigate("/login"); // Redirect after sign out
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign Out Failed",
        description: error.message || "Could not sign out",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isOrganizer: user?.is_organizer || false, // Ensure this is correctly derived
    signIn,
    signUp,
    signOut,
  };

  // Show a loading spinner while checking session on initial load
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
