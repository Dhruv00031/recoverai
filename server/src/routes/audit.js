import express from 'express';

import AuditEvent from '../models/AuditEvent.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// GET /api/audit
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      transactionId,
      eventType,
      actor,
      page = 1,
      limit = 50,
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 50, 1),
      100
    );

    const filter = {
      merchantId: req.user.merchantId,
    };

    if (transactionId) {
      filter.transactionId = transactionId;
    }

    if (eventType) {
      filter.eventType = eventType;
    }

    if (actor) {
      filter.actor = actor;
    }

    const skip = (pageNumber - 1) * limitNumber;

    const [events, total] = await Promise.all([
      AuditEvent.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      AuditEvent.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: events,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error('Audit events retrieval error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve audit events',
    });
  }
});

// GET /api/audit/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const event = await AuditEvent.findOne({
      _id: req.params.id,
      merchantId: req.user.merchantId,
    }).lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Audit event not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Audit event retrieval error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve audit event',
    });
  }
});

export default router;