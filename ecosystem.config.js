const appName = process.env.APP_NAME || 'bisq-watcher'

module.exports = {
  apps: [{
    name: appName,
    script: 'server/app.mjs',
    args: `--config ${appName}.config.mjs`,
  }],
}
