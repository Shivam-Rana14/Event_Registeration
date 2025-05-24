import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = express();
const port = process.env.PORT || 9001;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5789'],
  credentials: true
}));
app.use(express.json());

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Routes
app.get("/api/events", async (req, res) => {
  try {
    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (error) throw error;
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/events/featured", async (req, res) => {
  try {
    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .eq("is_featured", true)
      .limit(3);

    if (error) throw error;
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/events/:id", async (req, res) => {
  try {
    const { data: event, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/events/:id/register", async (req, res) => {
  try {
    const { user_id } = req.body;
    const event_id = req.params.id;

    const { data, error } = await supabase
      .from("registrations")
      .insert([{ user_id, event_id }]);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/user/registrations/:user_id", async (req, res) => {
  try {
    const { data: registrations, error } = await supabase
      .from("registrations")
      .select(
        `
        *,
        events (*)
      `
      )
      .eq("user_id", req.params.user_id);

    if (error) throw error;
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
