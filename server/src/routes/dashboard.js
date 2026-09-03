import express from 'express';

import Transaction from '../models/Transaction.js';
import RecoveryOpportunity from '../models/RecoveryOpportunity.js';
import RecoveryAction from '../models/RecoveryAction.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// GET /api/dashboard/summary
router.get('/summary', authenticate, async (req, res) => {
  try {
    const merchantId = req.user.merchantId;

    const [
      transactionStats,
      recoveryStats,
      recoveredStats,
    ] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            merchantId,
          },
        },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            failedTransactions: {
              $sum: {
                $cond: [{ $eq: ['$status', 'failed'] }, 1, 0],
              },
            },
            totalTransactionValue: { $sum: '$amount' },
            failedTransactionValue: {
              $sum: {
                $cond: [{ $eq: ['$status', 'failed'] }, '$amount', 0],
              },
            },
          },
        },
      ]),

      RecoveryOpportunity.aggregate([
        {
          $match: {
            merchantId,
          },
        },
        {
          $group: {
            _id: null,
            totalOpportunities: { $sum: 1 },
            readyOpportunities: {
              $sum: {
                $cond: [{ $eq: ['$status', 'ready'] }, 1, 0],
              },
            },
            expectedRecoveryValue: {
              $sum: '$expectedRecoveryValue',
            },
            averageRecoveryProbability: {
              $avg: '$recoveryProbability',
            },
          },
        },
      ]),

      RecoveryAction.aggregate([
        {
          $match: {
            merchantId,
          },
        },
        {
          $group: {
            _id: null,
            totalActions: { $sum: 1 },
            recoveredValue: {
              $sum: '$actualRecoveredValue',
            },
            successfulActions: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'success'] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const transactions = transactionStats[0] || {
      totalTransactions: 0,
      failedTransactions: 0,
      totalTransactionValue: 0,
      failedTransactionValue: 0,
    };

    const opportunities = recoveryStats[0] || {
      totalOpportunities: 0,
      readyOpportunities: 0,
      expectedRecoveryValue: 0,
      averageRecoveryProbability: 0,
    };

    const actions = recoveredStats[0] || {
      totalActions: 0,
      recoveredValue: 0,
      successfulActions: 0,
    };

    const recoveryRate =
      transactions.failedTransactions > 0
        ? actions.successfulActions / transactions.failedTransactions
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        transactions: {
          total: transactions.totalTransactions,
          failed: transactions.failedTransactions,
          totalValue: transactions.totalTransactionValue,
          failedValue: transactions.failedTransactionValue,
        },

        recovery: {
          totalOpportunities: opportunities.totalOpportunities,
          readyOpportunities: opportunities.readyOpportunities,
          expectedRecoveryValue: opportunities.expectedRecoveryValue,
          averageRecoveryProbability:
            opportunities.averageRecoveryProbability,
          recoveredValue: actions.recoveredValue,
          successfulActions: actions.successfulActions,
          recoveryRate,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve dashboard summary',
    });
  }
});

export default router;