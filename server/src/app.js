import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
import authRoutes from './routes/auth.js';
import testRoutes from './routes/test.js';
import transactionRoutes from './routes/transactions.js';
import recoveryRoutes from './routes/recovery.js';
import dashboardRoutes from './routes/dashboard.js';
import auditRoutes from './routes/audit.js';
import policyRoutes from './routes/policies.js';
import policySimulatorRoutes from './routes/policySimulator.js';
import analyticsRoutes from './routes/analytics.js';
import paymentsRoutes from './routes/payments.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.use(
  '/api/policies/simulate',
  policySimulatorRoutes
);
app.use('/api/policies', policyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/recovery', recoveryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/webhooks/razorpay', paymentsRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'RecoverAI Express Server is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.send('Welcome to the RecoverAI API');
});

async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`RecoverAI server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();