import express from 'express';

import Transaction from '../models/Transaction.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// GET /api/transactions
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      status,
      failureType,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 20, 1),
      100
    );

    const filter = {
      merchantId: req.user.merchantId,
    };

    if (status) {
      filter.status = status;
    }

    if (failureType) {
      filter.failureType = failureType;
    }

    const skip = (pageNumber - 1) * limitNumber;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      Transaction.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error('Transaction retrieval error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve transactions',
    });
  }
});

// GET /api/transactions/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      merchantId: req.user.merchantId,
    }).lean();

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Transaction retrieval error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve transaction',
    });
  }
});

export default router;