// Vercel Serverless Function entrypoint
// Imports the pre-built Express app from the compiled dist folder
const app = require('./apps/api/dist/app').default;

module.exports = app;
