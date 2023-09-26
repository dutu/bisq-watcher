// to start application with pm2 run `pm2 start ecosystem.config.js`
module.exports = {
  apps: [{
    name: "bisq-watcher",
    script: 'yarn',
    args: 'start',
    interpreter: 'none',
  }]
}
