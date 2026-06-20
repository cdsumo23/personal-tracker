// Vercel Serverless Function entrypoint
const express = require('express'); // Required for Vercel Express detection
const app = require('./apps/api/dist/app').default;

module.exports = app;
