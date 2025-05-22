import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for database operations

// Events
export const getEvents = async (filters = {}) => {
  let query = supabase.from("events").select(`
      *,
      organizer:users(id, email),
      registrations:registrations(count),
      questions:event_questions(*)
    `);

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.upcoming) {
    query = query.gte("date", new Date().toISOString());
  }

  if (filters.organizer_id) {
    query = query.eq("organizer_id", filters.organizer_id);
  }

  const { data, error } = await query.order("date", { ascending: true });

  if (error) throw error;
  return data;
};

export const createEvent = async (eventData) => {
  const { data, error } = await supabase
    .from("events")
    .insert([eventData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateEvent = async (id, eventData) => {
  const { data, error } = await supabase
    .from("events")
    .update(eventData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Registrations
export const createRegistration = async (registrationData) => {
  const { data, error } = await supabase
    .from("registrations")
    .insert([registrationData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserRegistrations = async (userId) => {
  const { data, error } = await supabase
    .from("registrations")
    .select(
      `
      *,
      event:events(*)
    `
    )
    .eq("user_id", userId);

  if (error) throw error;
  return data;
};

// Favorites
export const toggleFavorite = async (userId, eventId) => {
  const { data: existing } = await supabase
    .from("favorites")
    .select()
    .eq("user_id", userId)
    .eq("event_id", eventId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
    return null;
  }

  const { data, error } = await supabase
    .from("favorites")
    .insert([{ user_id: userId, event_id: eventId }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserFavorites = async (userId) => {
  const { data, error } = await supabase
    .from("favorites")
    .select(
      `
      *,
      event:events(*)
    `
    )
    .eq("user_id", userId);

  if (error) throw error;
  return data;
};

// Comments
export const createComment = async (commentData) => {
  const { data, error } = await supabase
    .from("event_comments")
    .insert([commentData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getEventComments = async (eventId) => {
  const { data, error } = await supabase
    .from("event_comments")
    .select(
      `
      *,
      user:users(id, email)
    `
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

// Questions
export const createEventQuestion = async (questionData) => {
  const { data, error } = await supabase
    .from("event_questions")
    .insert([questionData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Auth
export const signUp = async (email, password) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;

  const { error: profileError } = await supabase
    .from("users")
    .insert([{ id: authData.user.id, is_organizer: false }]);

  if (profileError) throw profileError;

  return authData;
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;

  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;
    return { ...user, ...profile };
  }

  return null;
};
