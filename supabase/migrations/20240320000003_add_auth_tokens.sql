-- Create auth_tokens table
CREATE TABLE IF NOT EXISTS auth_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for auth_tokens
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only read their own tokens
CREATE POLICY "Users can view own tokens"
    ON auth_tokens
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own tokens
CREATE POLICY "Users can insert own tokens"
    ON auth_tokens
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only update their own tokens
CREATE POLICY "Users can update own tokens"
    ON auth_tokens
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can only delete their own tokens
CREATE POLICY "Users can delete own tokens"
    ON auth_tokens
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to handle token updates
CREATE OR REPLACE FUNCTION update_auth_token()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for token updates
CREATE TRIGGER update_auth_token_updated_at
    BEFORE UPDATE ON auth_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_auth_token(); 