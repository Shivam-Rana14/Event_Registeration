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
        PORT: 9001,
        ALLOWED_ORIGINS: 'http://localhost:5173'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 9001,
        ALLOWED_ORIGINS: 'http://116.202.210.102:5173'
      }
    },
    {
      name: 'shivam-event-reg-client',
      cwd: './client/my-react-app/dist',
      script: 'serve',
      args: '-s . -l 5789',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 5789
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5789
      }
    }
  ]
};