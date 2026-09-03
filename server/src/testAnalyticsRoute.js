import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

console.log('Analytics route module loaded successfully.');
console.log('Testing route registration:');
const app = express();
app.use(express.json());
app.use('/api/analytics', analyticsRoutes);
console.log('Routes configured successfully.');
process.exit(0);
