import express from 'express';

import RecoveryOpportunity from '../models/RecoveryOpportunity.js';
import Transaction from '../models/Transaction.js';
import RecoveryAction from '../models/RecoveryAction.js';
import RecoveryPolicy from '../models/RecoveryPolicy.js';
import AuditEvent from '../models/AuditEvent.js';
import authenticate from '../middleware/auth.js';
import { executeRecovery } from '../services/recoveryExecution.js';

const router = express.Router();


// GET /api/recovery
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      status,
      recommendedAction,
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

    if (recommendedAction) {
      filter.recommendedAction = recommendedAction;
    }

    const skip = (pageNumber - 1) * limitNumber;

    const [opportunities, total] = await Promise.all([
      RecoveryOpportunity.find(filter)
        .sort({ priorityScore: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .populate({
          path: 'transactionId',
          select:
            'razorpayOrderId razorpayPaymentId amount currency status failureType failureReason paymentMethod attempts customerRef',
        })
        .lean(),

      RecoveryOpportunity.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: opportunities,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error('Recovery queue retrieval error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve recovery opportunities',
    });
  }
});


// POST /api/recovery/execute
router.post('/execute', authenticate, async (req, res) => {
  try {
    const {
      transactionId,
      recoveryOpportunityId,
    } = req.body || {};

    if (!transactionId || !recoveryOpportunityId) {
      return res.status(400).json({
        success: false,
        message:
          'transactionId and recoveryOpportunityId are required',
      });
    }

    const result = await executeRecovery({
      merchantId: req.user.merchantId,
      transactionId,
      recoveryOpportunityId,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      'Recovery execution error:',
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});


// POST /api/recovery/manual-review
router.post('/manual-review', authenticate, async (req, res) => {
  try {
    const {
      transactionId,
      recoveryOpportunityId,
    } = req.body || {};

    if (!transactionId || !recoveryOpportunityId) {
      return res.status(400).json({
        success: false,
        message:
          'transactionId and recoveryOpportunityId are required',
      });
    }

    const opportunity = await RecoveryOpportunity.findOne({
      _id: recoveryOpportunityId,
      merchantId: req.user.merchantId,
      transactionId,
    });

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Recovery opportunity not found',
      });
    }

    const policy = await RecoveryPolicy.findOne({
      merchantId: req.user.merchantId,
    }).sort({ version: -1 });

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Recovery policy not found',
      });
    }

    const action = await RecoveryAction.create({
      merchantId: req.user.merchantId,
      transactionId,
      recoveryOpportunityId,
      actionType: 'manual_review',
      status: 'approved',
      initiatedBy: 'merchant',
      expectedRecoveryValue:
        opportunity.expectedRecoveryValue || 0,
      actualRecoveredValue: 0,
      policyVersion: policy.version,
    });

    opportunity.status = 'manual_review';
    await opportunity.save();

    await AuditEvent.create({
      merchantId: req.user.merchantId,
      transactionId,
      recoveryOpportunityId,
      recoveryActionId: action._id,
      eventType: 'manual_intervention',
      actor: 'merchant',
      message:
        'Recovery opportunity sent for manual review.',
      metadata: {
        actionType: 'manual_review',
        expectedRecoveryValue:
          opportunity.expectedRecoveryValue,
        policyVersion: policy.version,
      },
      policyVersion: policy.version,
    });

    return res.status(200).json({
      success: true,
      message: 'Recovery opportunity sent for manual review',
      data: {
        opportunity,
        action,
      },
    });
  } catch (error) {
    console.error(
      'Manual review error:',
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});


// POST /api/recovery/stop
router.post('/stop', authenticate, async (req, res) => {
  try {
    const {
      transactionId,
      recoveryOpportunityId,
    } = req.body || {};

    if (!transactionId || !recoveryOpportunityId) {
      return res.status(400).json({
        success: false,
        message:
          'transactionId and recoveryOpportunityId are required',
      });
    }

    const opportunity = await RecoveryOpportunity.findOne({
      _id: recoveryOpportunityId,
      merchantId: req.user.merchantId,
      transactionId,
    });

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Recovery opportunity not found',
      });
    }

    const policy = await RecoveryPolicy.findOne({
      merchantId: req.user.merchantId,
    }).sort({ version: -1 });

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Recovery policy not found',
      });
    }

    const action = await RecoveryAction.create({
      merchantId: req.user.merchantId,
      transactionId,
      recoveryOpportunityId,
      actionType: 'stop',
      status: 'cancelled',
      initiatedBy: 'merchant',
      expectedRecoveryValue:
        opportunity.expectedRecoveryValue || 0,
      actualRecoveredValue: 0,
      policyVersion: policy.version,
    });

    opportunity.status = 'stopped';
    await opportunity.save();

    await AuditEvent.create({
      merchantId: req.user.merchantId,
      transactionId,
      recoveryOpportunityId,
      recoveryActionId: action._id,
      eventType: 'manual_intervention',
      actor: 'merchant',
      message:
        'Recovery opportunity stopped by merchant.',
      metadata: {
        actionType: 'stop',
        expectedRecoveryValue:
          opportunity.expectedRecoveryValue,
        policyVersion: policy.version,
      },
      policyVersion: policy.version,
    });

    return res.status(200).json({
      success: true,
      message: 'Recovery opportunity stopped',
      data: {
        opportunity,
        action,
      },
    });
  } catch (error) {
    console.error(
      'Stop recovery error:',
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /api/recovery/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const opportunity = await RecoveryOpportunity.findOne({
      _id: req.params.id,
      merchantId: req.user.merchantId,
    })
      .populate({
        path: 'transactionId',
        select:
          'razorpayOrderId razorpayPaymentId amount currency status failureType failureReason paymentMethod attempts customerRef',
      })
      .lean();

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Recovery opportunity not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: opportunity,
    });
  } catch (error) {
    console.error('Recovery opportunity retrieval error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve recovery opportunity',
    });
  }
});

export default router;