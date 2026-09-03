import express from 'express';

import RecoveryPolicy from '../models/RecoveryPolicy.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();


// =====================================================
// GET /api/policies
// Get all policy versions for the logged-in merchant
// =====================================================
router.get('/', authenticate, async (req, res) => {
  try {
    const policies = await RecoveryPolicy.find({
      merchantId: req.user.merchantId,
    })
      .sort({ version: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: policies,
    });
  } catch (error) {
    console.error('Policy list retrieval error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve recovery policies',
    });
  }
});


// =====================================================
// GET /api/policies/current
// Get the latest policy version
// =====================================================
router.get('/current', authenticate, async (req, res) => {
  try {
    const policy = await RecoveryPolicy.findOne({
      merchantId: req.user.merchantId,
    })
      .sort({ version: -1 })
      .lean();

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'No recovery policy found',
      });
    }

    return res.status(200).json({
      success: true,
      data: policy,
    });
  } catch (error) {
    console.error('Current policy retrieval error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve current policy',
    });
  }
});


// =====================================================
// GET /api/policies/:id
// Get a specific policy version
// =====================================================
router.get('/:id', authenticate, async (req, res) => {
  try {
    const policy = await RecoveryPolicy.findOne({
      _id: req.params.id,
      merchantId: req.user.merchantId,
    }).lean();

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: policy,
    });
  } catch (error) {
    console.error('Policy retrieval error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve policy',
    });
  }
});


// =====================================================
// POST /api/policies
// Create a new policy
// =====================================================
router.post('/', authenticate, async (req, res) => {
  try {
    const latestPolicy = await RecoveryPolicy.findOne({
      merchantId: req.user.merchantId,
    })
      .sort({ version: -1 })
      .lean();

    const nextVersion = latestPolicy
      ? latestPolicy.version + 1
      : 1;

    const policy = await RecoveryPolicy.create({
      ...req.body,
      merchantId: req.user.merchantId,
      version: nextVersion,
    });

    return res.status(201).json({
      success: true,
      message: `Recovery policy version ${nextVersion} created`,
      data: policy,
    });
  } catch (error) {
    console.error('Policy creation error:', error);

    return res.status(400).json({
      success: false,
      message: 'Unable to create recovery policy',
      error: error.message,
    });
  }
});


// =====================================================
// PUT /api/policies/:id
// Create a NEW version based on an existing policy
// =====================================================
router.put('/:id', authenticate, async (req, res) => {
  try {
    const existingPolicy = await RecoveryPolicy.findOne({
      _id: req.params.id,
      merchantId: req.user.merchantId,
    });

    if (!existingPolicy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found',
      });
    }

    // Find the latest policy version
    const latestPolicy = await RecoveryPolicy.findOne({
      merchantId: req.user.merchantId,
    })
      .sort({ version: -1 })
      .lean();

    const nextVersion = latestPolicy
      ? latestPolicy.version + 1
      : existingPolicy.version + 1;

    // Copy existing policy and apply requested changes
    const policyData = {
      ...existingPolicy.toObject(),
      ...req.body,
      merchantId: req.user.merchantId,
      version: nextVersion,
    };

    // Remove Mongo/Mongoose-generated fields
    delete policyData._id;
    delete policyData.__v;
    delete policyData.createdAt;
    delete policyData.updatedAt;

    const newPolicy = await RecoveryPolicy.create(policyData);

    return res.status(201).json({
      success: true,
      message: `Recovery policy version ${nextVersion} created`,
      data: newPolicy,
    });
  } catch (error) {
    console.error('Policy versioning error:', error);

    return res.status(400).json({
      success: false,
      message: 'Unable to create new policy version',
      error: error.message,
    });
  }
});


// =====================================================
// DELETE /api/policies/:id
// Delete a policy version
// =====================================================
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const policy = await RecoveryPolicy.findOneAndDelete({
      _id: req.params.id,
      merchantId: req.user.merchantId,
    });

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Recovery policy deleted',
    });
  } catch (error) {
    console.error('Policy deletion error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to delete recovery policy',
    });
  }
});


export default router;