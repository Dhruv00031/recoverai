import mongoose from 'mongoose';

import RecoveryPolicy from '../models/RecoveryPolicy.js';
import Transaction from '../models/Transaction.js';

import { evaluatePolicy } from './policyGuardrail.js';

import dotenv from 'dotenv';

dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);

  const transaction = await Transaction.findOne({
    razorpayOrderId: 'order_demo_RX28491',
  });

  const policy = await RecoveryPolicy.findOne({
    merchantId: transaction.merchantId,
  }).sort({ version: -1 });

  const prediction = {
    failureType: 'temporary_failure',
    riskScore: 18,
    recoveryProbability: 0.92,
    recommendedAction: 'retry',
  };

  const result = evaluatePolicy({
    policy,
    transaction,
    prediction,
  });

  console.log(
    JSON.stringify(result, null, 2)
  );

  await mongoose.disconnect();
}

test().catch(async (error) => {
  console.error('Guardrail test failed:', error);

  await mongoose.disconnect();

  process.exit(1);
});