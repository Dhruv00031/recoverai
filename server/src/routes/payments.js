import express from 'express';
import authenticate from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';
import RecoveryOpportunity from '../models/RecoveryOpportunity.js';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  generateTestPaymentSignature,
  processPaymentFailure,
  processPaymentSuccess,
  verifyWebhookSignature,
} from '../services/razorpayService.js';

const router = express.Router();

/**
 * POST /api/payments/create-order
 * Create a new Razorpay Test Mode order
 */
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const { amount = 42500, currency = 'INR', recoveryOpportunityId, customerRef } = req.body;
    const merchantId = req.user.merchantId;

    const orderData = await createRazorpayOrder({
      amount,
      currency,
      receipt: `rcpt_${Date.now().toString(36)}`,
      notes: {
        merchantId: merchantId.toString(),
        recoveryOpportunityId: recoveryOpportunityId || '',
      },
    });

    // Create or associate Transaction record
    const transaction = await Transaction.create({
      merchantId,
      razorpayOrderId: orderData.id,
      amount: Number(amount),
      currency,
      status: 'created',
      paymentMethod: 'card',
      attempts: 1,
      customerRef: customerRef || `cust_ref_${Date.now().toString(36)}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Razorpay Test Mode order created successfully',
      data: {
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        keyId: orderData.keyId,
        isSandbox: true,
        transactionId: transaction._id,
      },
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to create Razorpay payment order',
    });
  }
});

/**
 * POST /api/payments/verify
 * Verify payment signature and record capture/recovery
 */
router.post('/verify', authenticate, async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      recoveryOpportunityId,
      amount,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: 'razorpayOrderId and razorpayPaymentId are required',
      });
    }

    const result = await processPaymentSuccess({
      merchantId: req.user.merchantId,
      razorpayOrderId,
      razorpayPaymentId,
      signature: razorpaySignature || 'simulated_valid_signature',
      amount,
      recoveryOpportunityId,
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified and recovery confirmed via Razorpay Test Mode',
      data: result,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Payment verification failed',
    });
  }
});

/**
 * POST /api/payments/simulate-failure
 * Ingest a failed payment attempt into RecoverAI pipeline
 */
router.post('/simulate-failure', authenticate, async (req, res) => {
  try {
    const {
      amount = 42500,
      failureType = 'temporary_failure',
      failureReason = 'Temporary payment processing failure',
      paymentMethod = 'card',
      customerRef,
    } = req.body;

    const merchantId = req.user.merchantId;
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderId = `order_demo_RX${randomSuffix}`;
    const paymentId = `pay_demo_RX${randomSuffix}`;

    const result = await processPaymentFailure({
      merchantId,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      amount: Number(amount),
      failureType,
      failureReason,
      paymentMethod,
      attempts: 1,
      customerRef: customerRef || `customer_${randomSuffix}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Failed payment simulated and ingested into RecoverAI pipeline',
      data: {
        transactionId: result.transaction._id,
        orderId,
        paymentId,
        opportunityId: result.opportunity._id,
        status: result.opportunity.status,
        recommendedAction: result.opportunity.recommendedAction,
        riskScore: result.opportunity.riskScore,
        recoveryProbability: result.opportunity.recoveryProbability,
        expectedRecoveryValue: result.opportunity.expectedRecoveryValue,
        allowed: result.evaluation.allowed,
      },
    });
  } catch (error) {
    console.error('Failure simulation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to simulate payment failure',
    });
  }
});

/**
 * POST /api/payments/simulate-success
 * Execute and confirm a successful recovery retry
 */
router.post('/simulate-success', authenticate, async (req, res) => {
  try {
    const { recoveryOpportunityId, transactionId, amount } = req.body;
    const merchantId = req.user.merchantId;

    let targetTransaction = null;
    if (transactionId) {
      targetTransaction = await Transaction.findOne({ _id: transactionId, merchantId });
    } else if (recoveryOpportunityId) {
      const opp = await RecoveryOpportunity.findOne({ _id: recoveryOpportunityId, merchantId });
      if (opp?.transactionId) {
        targetTransaction = await Transaction.findOne({ _id: opp.transactionId, merchantId });
      }
    }

    const orderId = targetTransaction?.razorpayOrderId || `order_rec_${Date.now().toString(36)}`;
    const paymentId = `pay_rec_${Date.now().toString(36)}`;
    const signature = generateTestPaymentSignature({ orderId, paymentId });

    const result = await processPaymentSuccess({
      merchantId,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      signature,
      amount: amount || targetTransaction?.amount || 42500,
      recoveryOpportunityId,
    });

    return res.status(200).json({
      success: true,
      message: 'Payment recovery retry executed and verified successfully',
      data: {
        ...result,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        signature,
      },
    });
  } catch (error) {
    console.error('Success simulation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to complete recovery payment',
    });
  }
});

/**
 * POST /api/payments/webhook
 * Razorpay Webhook Handler
 */
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const eventPayload = req.body;

    const isValid = verifyWebhookSignature({
      rawBody: eventPayload,
      signature,
    });

    if (!isValid && process.env.NODE_ENV === 'production') {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = eventPayload.event;
    console.log(`[Razorpay Webhook] Received event: ${event}`);

    return res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ success: false, message: 'Webhook error' });
  }
});

export default router;
