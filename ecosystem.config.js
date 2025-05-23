module.exports = {
  apps: [
    {
      name: 'event-registration-server',
      cwd: './server',
      script: 'src/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 5001,
        SUPABASE_URL: 'https://irxwklpjxecoettwfeiq.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyeHdrbHBqeGVjb2V0dHdmZWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI5NzMwNzgsImV4cCI6MjAxODU0OTA3OH0.RYyD6eeGQOm8IRgZIkN6j_6GWFHDOAQp_cAHHkEBhB4'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001,
        SUPABASE_URL: 'https://irxwklpjxecoettwfeiq.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyeHdrbHBqeGVjb2V0dHdmZWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI5NzMwNzgsImV4cCI6MjAxODU0OTA3OH0.RYyD6eeGQOm8IRgZIkN6j_6GWFHDOAQp_cAHHkEBhB4'
      }
    },
    {
      name: 'event-registration-client',
      cwd: './client/my-react-app',
      script: 'npm',
      args: 'run dev',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 5173
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5173
      }
    }
  ]
};