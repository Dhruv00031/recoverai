import express from 'express';

import RecoveryPolicy from '../models/RecoveryPolicy.js';
import Transaction from '../models/Transaction.js';

import authenticate from '../middleware/auth.js';

import { evaluatePolicy } from '../services/policyGuardrail.js';

const router = express.Router();


// POST /api/policies/simulate
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      transactionId,
      prediction,
      policyId,
    } = req.body || {};

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'transactionId is required',
      });
    }

    if (!prediction) {
      return res.status(400).json({
        success: false,
        message: 'prediction is required',
      });
    }

    const transaction = await Transaction.findOne({
      _id: transactionId,
      merchantId: req.user.merchantId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    let policy;

    if (policyId) {
      policy = await RecoveryPolicy.findOne({
        _id: policyId,
        merchantId: req.user.merchantId,
      });
    } else {
      policy = await RecoveryPolicy.findOne({
        merchantId: req.user.merchantId,
      }).sort({ version: -1 });
    }

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Recovery policy not found',
      });
    }

    const result = evaluatePolicy({
      policy,
      transaction,
      prediction,
    });

    return res.status(200).json({
      success: true,
      data: {
        transactionId: transaction._id,
        policyId: policy._id,
        policyVersion: policy.version,
        prediction,
        evaluation: result,
        simulated: true,
      },
    });
  } catch (error) {
    console.error('Policy simulation error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to simulate recovery policy',
    });
  }
});

export default router;