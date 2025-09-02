const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { warn, error, info } = require('./utils/logger');

dotenv.config();

// Connection string must be provided via env var urlDB
const urlDB = process.env.urlDB;

if (!urlDB) {
    warn('[Mongo] Environment variable urlDB is missing. Database operations will fail.');
}

mongoose.set('strictQuery', true);

let firstConnectAttempted = false;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) return; // already connected
    if (!urlDB) return;
    try {
        firstConnectAttempted = true;
        info('[Mongo] Attempting connection...');
        await mongoose.connect(urlDB, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000, // match the 10s buffering error timeframe
            socketTimeoutMS: 45000,
            retryWrites: true,
            autoIndex: true,
        });
    } catch (err) {
        error('[Mongo] Initial connection error', { msg: err.message });
        // Do not exit immediately on hosting like cPanel; allow retries
        setTimeout(() => {
            warn('[Mongo] Retrying connection...');
            connectDB();
        }, 5000);
    }
};

// Connection event listeners for better diagnostics
mongoose.connection.on('connected', () => info('[Mongo] Connected'));
mongoose.connection.on('reconnected', () => info('[Mongo] Reconnected'));
mongoose.connection.on('disconnected', () => warn('[Mongo] Disconnected'));
mongoose.connection.on('error', (err) => error('[Mongo] Runtime error', { msg: err.message }));

// Helper to expose readiness
const isDbReady = () => mongoose.connection.readyState === 1;

module.exports = { connectDB, isDbReady };