// Vercel Serverless Function entrypoint
// Imports the compiled Express app from the dist folder where path aliases are resolved
const app = require('../dist/app').default;

module.exports = app;
