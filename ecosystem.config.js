module.exports = {
  apps: [
    {
      name: 'mikrogestor-voucher',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 0.0.0.0 -p 80',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '750M',
      exp_backoff_restart_delay: 200,
      restart_delay: 2000,
      kill_timeout: 5000,
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 80,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: process.env.PORT || 80,
      }
    }
  ]
};
