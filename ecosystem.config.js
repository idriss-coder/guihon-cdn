module.exports = {
  apps: [{
    script: 'src/www',
    watch: '.'
  }],

  deploy: {
    production: {
      user: 'aysfishh117',
      host: '78.46.11.32',
      ref: 'origin/master',
      repo: 'https://github.com/IDRISSHACKER/guihon-cdn.git',
      path: '/home/aysfishh117/web/cdn.guihon.cm',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};