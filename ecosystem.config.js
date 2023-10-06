const configFileName = process.env.APP_NAME || 'bisq-watcher.config.mjs'

module.exports = {
  apps: [{
    name: configFileName,
    script: 'server/app.mjs',
    args: `--config ${configFileName}`,
  }],
}
