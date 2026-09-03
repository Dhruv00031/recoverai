import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import RecoveryOpportunity from '../models/RecoveryOpportunity.js';
import RecoveryPolicy from '../models/RecoveryPolicy.js';
import RecoveryAction from '../models/RecoveryAction.js';
import AuditEvent from '../models/AuditEvent.js';

dotenv.config();

let DEMO_MERCHANT_ID;

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  console.log('Connected to MongoDB');

  const demoUser = await User.findOne({
  email: 'merchant@acmestore.com',
  });

  if (!demoUser) {
    throw new Error(
      'Demo merchant not found. Register merchant@acmestore.com before running the seed.'
    );
  }

  DEMO_MERCHANT_ID = demoUser.merchantId;

  console.log(`Seeding data for merchant: ${DEMO_MERCHANT_ID}`);
  
  const transaction = await Transaction.findOneAndUpdate(
    {
      merchantId: DEMO_MERCHANT_ID,
      razorpayOrderId: 'order_demo_RX28491',
    },
    {
      $set: {
        merchantId: DEMO_MERCHANT_ID,
        razorpayOrderId: 'order_demo_RX28491',
        razorpayPaymentId: 'pay_demo_RX28491',
        amount: 42500,
        currency: 'INR',
        status: 'failed',
        failureType: 'temporary_failure',
        failureReason: 'Temporary payment processing failure',
        paymentMethod: 'card',
        attempts: 1,
        customerRef: 'customer_demo_28491',
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  const opportunity = await RecoveryOpportunity.findOneAndUpdate(
    {
      merchantId: DEMO_MERCHANT_ID,
      transactionId: transaction._id,
    },
    {
      $set: {
        merchantId: DEMO_MERCHANT_ID,
        transactionId: transaction._id,
        riskScore: 18,
        recoveryProbability: 0.92,
        expectedRecoveryValue: 39100,
        priorityScore: 92,
        recommendedAction: 'retry',
        status: 'ready',
        decisionFactors: [
          'temporary_failure',
          'low_risk',
          'high_recovery_probability',
          'retry_limit_not_reached',
        ],
        modelVersion: 'recovery-v1',
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  await RecoveryPolicy.findOneAndUpdate(
    {
      merchantId: DEMO_MERCHANT_ID,
      version: 1,
    },
    {
      $set: {
        merchantId: DEMO_MERCHANT_ID,
        maxRisk: 60,
        minRecoveryProbability: 0.6,
        maxAutomaticRetries: 2,
        maxAutomaticRecoveryAmount: 10000,
        dailyAutomaticRecoveryLimit: 200000,
        maxCustomerInterventions: 1,
        minTransactionValue: 500,
        automaticRecoveryEnabled: true,
        version: 1,

        strategyRules: [
          {
            failureType: 'temporary_failure',
            recommendation: 'retry',
            automatic: true,
            priority: 'high',
          },
          {
            failureType: 'network_failure',
            recommendation: 'retry_later',
            automatic: true,
            priority: 'high',
          },
          {
            failureType: 'authentication_failure',
            recommendation: 're_engage',
            automatic: true,
            priority: 'medium',
          },
          {
            failureType: 'insufficient_funds',
            recommendation: 're_engage',
            automatic: true,
            priority: 'medium',
          },
          {
            failureType: 'hard_decline',
            recommendation: 'manual_review',
            automatic: false,
            priority: 'high',
          },
          {
            failureType: 'unknown',
            recommendation: 'manual_review',
            automatic: false,
            priority: 'critical',
          },
        ],

        safetyRules: {
          highRiskAction: 'manual_review',
          repeatedFailureAction: 'stop',
          lowConfidenceAction: 'manual_review',
          policyViolationAction: 'stop',
        },
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  await RecoveryAction.findOneAndUpdate(
    {
      merchantId: DEMO_MERCHANT_ID,
      recoveryOpportunityId: opportunity._id,
      actionType: 'retry',
    },
    {
      $set: {
        merchantId: DEMO_MERCHANT_ID,
        transactionId: transaction._id,
        recoveryOpportunityId: opportunity._id,
        actionType: 'retry',
        status: 'pending',
        initiatedBy: 'ai_engine',
        expectedRecoveryValue: 39100,
        actualRecoveredValue: 0,
        policyVersion: 1,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  const existingAuditCount = await AuditEvent.countDocuments({
    merchantId: DEMO_MERCHANT_ID,
    transactionId: transaction._id,
  });

  if (existingAuditCount === 0) {
    await AuditEvent.insertMany([
      {
        merchantId: DEMO_MERCHANT_ID,
        transactionId: transaction._id,
        eventType: 'payment_failed',
        actor: 'razorpay',
        message: 'Payment failed due to a temporary processing failure.',
        metadata: {
          razorpayPaymentId: 'pay_demo_RX28491',
          amount: 42500,
          currency: 'INR',
        },
      },
      {
        merchantId: DEMO_MERCHANT_ID,
        transactionId: transaction._id,
        recoveryOpportunityId: opportunity._id,
        eventType: 'ai_analysis',
        actor: 'ai_engine',
        message: 'RecoverAI identified a high-probability recovery opportunity.',
        metadata: {
          riskScore: 18,
          recoveryProbability: 0.92,
          recommendedAction: 'retry',
        },
        modelVersion: 'recovery-v1',
      },
      {
        merchantId: DEMO_MERCHANT_ID,
        transactionId: transaction._id,
        recoveryOpportunityId: opportunity._id,
        eventType: 'policy_evaluation',
        actor: 'policy_engine',
        message: 'Recovery recommendation evaluated against merchant policy.',
        metadata: {
          allowed: true,
          policyVersion: 1,
        },
        policyVersion: 1,
      },
    ]);
  }

  console.log('RecoverAI demo data seeded successfully');
  console.log(`Transaction: ${transaction._id}`);
  console.log(`Recovery Opportunity: ${opportunity._id}`);

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error);
  await mongoose.disconnect();
  process.exit(1);
});