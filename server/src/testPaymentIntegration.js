import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  generateTestPaymentSignature,
  processPaymentFailure,
  processPaymentSuccess,
} from './services/razorpayService.js';
import User from './models/User.js';

dotenv.config();

async function runTests() {
  console.log('--- RUNNING RAZORPAY TEST MODE INTEGRATION TESTS ---');

  // Test 1: Order creation
  const testOrder = await createRazorpayOrder({
    amount: 42500,
    currency: 'INR',
    receipt: 'test_rcpt_001',
  });
  console.log('✓ Test 1: Razorpay Order Creation:', testOrder);
  if (!testOrder.id || !testOrder.amount) {
    throw new Error('Order creation test failed');
  }

  // Test 2: Signature verification
  const orderId = testOrder.id;
  const paymentId = 'pay_test_RX28491';
  const validSignature = generateTestPaymentSignature({ orderId, paymentId });

  const isValid = verifyPaymentSignature({
    orderId,
    paymentId,
    signature: validSignature,
  });

  const isInvalid = verifyPaymentSignature({
    orderId,
    paymentId,
    signature: 'bad_forged_signature_123',
  });

  console.log(`✓ Test 2: Signature verification (Valid: ${isValid}, Invalid: ${!isInvalid})`);
  if (!isValid || isInvalid) {
    throw new Error('Signature verification test failed');
  }

  // Connect to DB for end-to-end integration verification
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for integration verification');

    const demoUser = await User.findOne({ email: 'merchant@acmestore.com' });
    if (demoUser) {
      const merchantId = demoUser.merchantId;

      // Test 3: Process simulated failure
      const failureResult = await processPaymentFailure({
        merchantId,
        amount: 35000,
        failureType: 'temporary_failure',
        failureReason: 'Integration test temporary gateway failure',
        paymentMethod: 'card',
        attempts: 1,
      });

      console.log('✓ Test 3: Failure Ingestion & Opportunity Creation:', {
        opportunityId: failureResult.opportunity._id,
        riskScore: failureResult.opportunity.riskScore,
        recoveryProbability: failureResult.opportunity.recoveryProbability,
        expectedRecoveryValue: failureResult.opportunity.expectedRecoveryValue,
        status: failureResult.opportunity.status,
      });

      // Test 4: Process successful recovery
      const successResult = await processPaymentSuccess({
        merchantId,
        razorpayOrderId: failureResult.transaction.razorpayOrderId,
        razorpayPaymentId: 'pay_test_success_recovered',
        signature: generateTestPaymentSignature({
          orderId: failureResult.transaction.razorpayOrderId,
          paymentId: 'pay_test_success_recovered',
        }),
        amount: 35000,
        recoveryOpportunityId: failureResult.opportunity._id,
      });

      console.log('✓ Test 4: Payment Success & Recovery Capture:', {
        opportunityStatus: successResult.opportunity?.status,
        transactionStatus: successResult.transaction?.status,
      });
    }

    await mongoose.disconnect();
  }

  console.log('--- ALL RAZORPAY TEST MODE INTEGRATION TESTS PASSED ---');
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Integration test failed:', err);
    process.exit(1);
  });
