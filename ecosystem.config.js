module.exports = {
  apps: [{
    name: 'akashic-campaign-console',
    script: 'node_modules/.bin/next',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }],

  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/akashic-campaign-console.git',
      path: '/var/www/akashic-campaign-console',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build:production && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}