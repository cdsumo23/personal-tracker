// Vercel Serverless Function entrypoint
const express = require('express'); // Required for Vercel Express detection

let app;
let loadError = null;

try {
  app = require('../apps/api/dist/app').default;
} catch (err) {
  loadError = err;
}

if (loadError) {
  const fallbackApp = express();
  fallbackApp.all('*', (req, res) => {
    res.status(500).json({
      error: 'Failed to load application module',
      message: loadError.message,
      stack: loadError.stack,
      envKeys: Object.keys(process.env).filter(key => {
        const k = key.toUpperCase();
        return !k.includes('SECRET') && !k.includes('PASSWORD') && !k.includes('TOKEN') && !k.includes('KEY') && !k.includes('URL');
      })
    });
  });
  module.exports = fallbackApp;
} else {
  module.exports = app;
}
