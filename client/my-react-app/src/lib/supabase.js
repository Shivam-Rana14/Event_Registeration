import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Token management functions
export const storeTokens = async (userId, session) => {
  try {
    const { error } = await supabase.from("auth_tokens").upsert({
      user_id: userId,
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: new Date(session.expires_at).toISOString(),
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error storing tokens:", error);
    throw error;
  }
};

export const getStoredTokens = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("auth_tokens")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting stored tokens:", error);
    throw error;
  }
};

export const removeStoredTokens = async (userId) => {
  try {
    const { error } = await supabase
      .from("auth_tokens")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
  } catch (error) {
    console.error("Error removing stored tokens:", error);
    throw error;
  }
};

// Authentication functions
export const signUp = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error signing up:", error);
    return { data: null, error };
  }
};

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error signing in:", error);
    return { data: null, error };
  }
};

export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    // First, get the current user to clear their tokens
    const { data: { user } } = await supabase.auth.getUser();
    
    // Sign out from Supabase
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) throw signOutError;
    
    // Remove stored tokens from the database
    if (user?.id) {
      try {
        await removeStoredTokens(user.id);
      } catch (tokenError) {
        console.error('Error removing stored tokens:', tokenError);
        // Continue even if token removal fails
      }
    }
    
    return { error: null };
  } catch (error) {
    console.error("Error during sign out:", error);
    return { 
      error: {
        ...error,
        message: error.message || 'Failed to sign out. Please try again.'
      } 
    };
  }
};

export const getSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return { session, error: null };
  } catch (error) {
    console.error("Error getting session:", error);
    return { session: null, error };
  }
};

export const getUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    console.error("Error getting user:", error);
    return { user: null, error };
  }
};

export const getCurrentUser = async (maxRetries = 3) => {
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      // First, try to get the current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) return null;

      // Get stored tokens
      const tokens = await getStoredTokens(user.id);
      if (!tokens) {
        throw new Error("No stored authentication tokens found. Please sign in again.");
      }

      // Check if token is expired or about to expire soon (within 5 minutes)
      const expiresAt = new Date(tokens.expires_at);
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      if (expiresAt <= fiveMinutesFromNow) {
        // Refresh the session if token is expired or about to expire
        console.log('Refreshing session...');
        const {
          data: { session },
          error: refreshError,
        } = await supabase.auth.refreshSession();
        
        if (refreshError) throw refreshError;

        // Store new tokens
        if (session) {
          await storeTokens(user.id, session);
          // Update the user data after token refresh
          const { data: { user: refreshedUser } } = await supabase.auth.getUser();
          return await fetchUserProfile(refreshedUser);
        }
      }
      
      // If we get here, either the token is still valid or we've refreshed it
      return await fetchUserProfile(user);
      
    } catch (error) {
      console.error(`Attempt ${retryCount + 1} failed:`, error);
      retryCount++;
      
      if (retryCount >= maxRetries) {
        console.error('Max retries reached, giving up');
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }
  
  throw new Error('Failed to get current user after multiple attempts');
};

// Helper function to fetch user profile
const fetchUserProfile = async (user) => {
  if (!user) return null;
  
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error('Error fetching user profile:', profileError);
    throw new Error('Failed to load user profile');
  }
  
  return { ...user, ...profile };
};

// Database helper functions
export const getEvents = async (filters = {}) => {
  try {
    let query = supabase.from("events").select("*");

    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    if (filters.isFeatured) {
      query = query.eq("is_featured", true);
    }

    if (filters.organizerId) {
      query = query.eq("organizer_id", filters.organizerId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

export const createEvent = async (eventData) => {
  try {
    const { data, error } = await supabase
      .from("events")
      .insert([eventData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

export const updateEvent = async (eventId, eventData) => {
  try {
    const { data, error } = await supabase
      .from("events")
      .update(eventData)
      .eq("id", eventId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

export const deleteEvent = async (eventId) => {
  try {
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
};

// Helper function to check Supabase connection
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error checking Supabase connection:", error);
    return false;
  }
};
