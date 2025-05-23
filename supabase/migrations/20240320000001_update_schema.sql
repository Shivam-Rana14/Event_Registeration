-- Drop existing tables in reverse order of dependencies
DROP TABLE IF EXISTS event_comments CASCADE;
DROP TABLE IF EXISTS event_questions CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create tables
CREATE TABLE users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  is_organizer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Rest of the tables and policies remain the same
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  organizer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  custom_answer TEXT,
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

-- Enable Row Level Security for other tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;

-- Create policies
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
CREATE INDEX registrations_user_id_idx ON registrations(user_id);
CREATE INDEX registrations_event_id_idx ON registrations(event_id);
CREATE INDEX favorites_user_id_idx ON favorites(user_id);
CREATE INDEX favorites_event_id_idx ON favorites(event_id);
CREATE INDEX event_comments_event_id_idx ON event_comments(event_id);
CREATE INDEX event_comments_user_id_idx ON event_comments(user_id); 