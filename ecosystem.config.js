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
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 80,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 80,
      }
    }
  ]
};
