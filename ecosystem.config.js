const appName = process.env.APP_NAME || 'bisq-watcher'

module.exports = {
  apps: [{
    name: appName,
    script: 'yarn',
    args: `start --config ${appName}.config.mjs`,
    interpreter: 'none'
  }]
}
