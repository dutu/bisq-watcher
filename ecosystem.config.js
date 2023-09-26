// to start application with pm2 run `pm2 start ecosystem.config.js --env bisq-trad`
module.exports = {
  apps: [{
    name: "xwm",
    script: "./app.mjs",
    env: {
      NODE_ENV: "production",
      // other default variables
    },
    env_bisq_trad: {
      NODE_ENV: "bisq-trad",
      // production-specific variables
    },
    env_bisq_price_relay: {
      NODE_ENV: "price-relay",
      PORT: 5000,
    }
  }]
};
