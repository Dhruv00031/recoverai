import mongoose from 'mongoose';

const recoveryActionSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
      index: true,
    },

    recoveryOpportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecoveryOpportunity',
      required: true,
      index: true,
    },

    actionType: {
      type: String,
      required: true,
      enum: [
        'retry',
        'retry_later',
        're_engage',
        'manual_review',
        'stop',
      ],
    },

    status: {
      type: String,
      required: true,
      enum: [
        'pending',
        'approved',
        'initiated',
        'succeeded',
        'failed',
        'cancelled',
        'blocked',
      ],
      default: 'pending',
      index: true,
    },

    initiatedBy: {
      type: String,
      required: true,
      enum: [
        'ai_engine',
        'merchant',
        'system',
      ],
    },

    expectedRecoveryValue: {
      type: Number,
      required: true,
      min: 0,
    },

    actualRecoveredValue: {
      type: Number,
      min: 0,
      default: 0,
    },

    razorpayOrderId: {
      type: String,
      trim: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      trim: true,
      index: true,
    },

    result: {
      type: String,
      trim: true,
    },

    policyVersion: {
      type: Number,
      required: true,
      min: 1,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const RecoveryAction = mongoose.model(
  'RecoveryAction',
  recoveryActionSchema
);

export default RecoveryAction;