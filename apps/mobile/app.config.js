const baseConfig = require('./app.json');

// Local `expo start` should always hit the dev machine (via api.ts's LAN-IP /
// localhost auto-detection), never the deployed Render backend — that URL is
// only baked in for real EAS builds (which set EAS_BUILD=true), so a
// standalone APK/production build still points at production.
module.exports = () => {
  const isEasBuild = process.env.EAS_BUILD === 'true';

  return {
    ...baseConfig.expo,
    extra: {
      ...baseConfig.expo.extra,
      apiUrl: isEasBuild ? baseConfig.expo.extra.apiUrl : undefined,
    },
  };
};
