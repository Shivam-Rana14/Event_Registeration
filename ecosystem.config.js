module.exports = {
  apps: [
    {
      name: 'shivam-event-reg-server',
      cwd: './server',
      script: 'src/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 9876,
        ALLOWED_ORIGINS: 'http://localhost:5789',
        SUPABASE_URL: 'https://irxwklpjxecoettwfeiq.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyeHdrbHBqeGVjb2V0dHdmZWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTgyMjQsImV4cCI6MjA2MzQ5NDIyNH0.Gtw5qCBBQ8EP0Fakj9caeI3K4WGzKje3lHAOAIlSekI'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 9876,
        ALLOWED_ORIGINS: 'http://116.202.210.102:5789',
        SUPABASE_URL: 'https://irxwklpjxecoettwfeiq.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyeHdrbHBqeGVjb2V0dHdmZWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTgyMjQsImV4cCI6MjA2MzQ5NDIyNH0.Gtw5qCBBQ8EP0Fakj9caeI3K4WGzKje3lHAOAIlSekI'
      }
    },
    {
      name: 'shivam-event-reg-client',
      cwd: './client/my-react-app',
      env: {
        VITE_SUPABASE_URL: 'https://irxwklpjxecoettwfeiq.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyeHdrbHBqeGVjb2V0dHdmZWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTgyMjQsImV4cCI6MjA2MzQ5NDIyNH0.Gtw5qCBBQ8EP0Fakj9caeI3K4WGzKje3lHAOAIlSekI'
      },
      env_production: {
        VITE_SUPABASE_URL: 'https://irxwklpjxecoettwfeiq.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyeHdrbHBqeGVjb2V0dHdmZWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTgyMjQsImV4cCI6MjA2MzQ5NDIyNH0.Gtw5qCBBQ8EP0Fakj9caeI3K4WGzKje3lHAOAIlSekI'
      },
      script: 'npm',
      args: 'run preview -- --port 5789 --host',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 5789,
        VITE_SUPABASE_URL: 'https://irxwklpjxecoettwfeiq.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyeHdrbHBqeGVjb2V0dHdmZWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI5NzMwNzgsImV4cCI6MjAxODU0OTA3OH0.RYyD6eeGQOm8IRgZIkN6j_6GWFHDOAQp_cAHHkEBhB4'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5789,
        VITE_SUPABASE_URL: 'https://irxwklpjxecoettwfeiq.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyeHdrbHBqeGVjb2V0dHdmZWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI5NzMwNzgsImV4cCI6MjAxODU0OTA3OH0.RYyD6eeGQOm8IRgZIkN6j_6GWFHDOAQp_cAHHkEBhB4'
      }
    }
  ]
};