// Android release builds block plain http:// traffic by default, including
// http://localhost:3000 (the WhatsApp bridge running in Termux on this same
// phone). This turns cleartext traffic on so the app can reach it.
const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withCleartext(config) {
  return withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application[0];
    app.$['android:usesCleartextTraffic'] = 'true';
    return cfg;
  });
};
