-- Drop all existing tables and policies
DROP TABLE IF EXISTS event_comments CASCADE;
DROP TABLE IF EXISTS event_questions CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create tables with correct schema
CREATE TABLE users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_organizer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, is_organizer, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'is_organizer', 'false')::boolean,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  total_capacity INTEGER NOT NULL,
  remaining_capacity INTEGER NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  organizer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  custom_answer TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, event_id)
);

CREATE TABLE favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, event_id)
);

CREATE TABLE event_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL
);

CREATE TABLE event_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  comment TEXT NOT NULL CHECK (char_length(comment) <= 280),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users table policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Events table policies
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Organizers can create events"
  ON events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND is_organizer = true
    )
  );

CREATE POLICY "Organizers can update their own events"
  ON events FOR UPDATE
  USING (
    organizer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND is_organizer = true
    )
  );

CREATE POLICY "Organizers can delete their own events"
  ON events FOR DELETE
  USING (
    organizer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND is_organizer = true
    )
  );

-- Registrations table policies
CREATE POLICY "Users can view their own registrations"
  ON registrations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create registrations"
  ON registrations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own registrations"
  ON registrations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own registrations"
  ON registrations FOR DELETE
  USING (user_id = auth.uid());

-- Favorites table policies
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (user_id = auth.uid());

-- Event questions table policies
CREATE POLICY "Anyone can view event questions"
  ON event_questions FOR SELECT
  USING (true);

CREATE POLICY "Organizers can create event questions"
  ON event_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE id = event_id
      AND organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can update their event questions"
  ON event_questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE id = event_id
      AND organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can delete their event questions"
  ON event_questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE id = event_id
      AND organizer_id = auth.uid()
    )
  );

-- Event comments table policies
CREATE POLICY "Anyone can view event comments"
  ON event_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON event_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON event_comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON event_comments FOR DELETE
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX events_organizer_id_idx ON events(organizer_id);
CREATE INDEX events_date_idx ON events(date);
CREATE INDEX events_category_idx ON events(category);
CREATE INDEX events_total_capacity_idx ON events(total_capacity);
CREATE INDEX events_remaining_capacity_idx ON events(remaining_capacity);
CREATE INDEX registrations_user_id_idx ON registrations(user_id);
CREATE INDEX registrations_event_id_idx ON registrations(event_id);
CREATE INDEX registrations_status_idx ON registrations(status);
CREATE INDEX favorites_user_id_idx ON favorites(user_id);
CREATE INDEX favorites_event_id_idx ON favorites(event_id);
CREATE INDEX event_comments_event_id_idx ON event_comments(event_id);
CREATE INDEX event_comments_user_id_idx ON event_comments(user_id);

-- Create function to update event capacity
CREATE OR REPLACE FUNCTION update_event_capacity(p_event_id UUID, p_increment BOOLEAN)
RETURNS void AS $$
BEGIN
  IF p_increment THEN
    UPDATE events
    SET remaining_capacity = remaining_capacity + 1
    WHERE id = p_event_id;
  ELSE
    UPDATE events
    SET remaining_capacity = remaining_capacity - 1
    WHERE id = p_event_id
    AND remaining_capacity > 0;
  END IF;
END;
$$ LANGUAGE plpgsql; 