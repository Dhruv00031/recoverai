import mongoose from 'mongoose';

const recoveryOpportunitySchema = new mongoose.Schema(
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

    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    recoveryProbability: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },

    expectedRecoveryValue: {
      type: Number,
      required: true,
      min: 0,
    },

    priorityScore: {
      type: Number,
      required: true,
      min: 0,
    },

    recommendedAction: {
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
        'new',
        'analyzing',
        'ready',
        'in_progress',
        'manual_review',
        'recovered',
        'stopped',
        'expired',
      ],
      default: 'new',
      index: true,
    },

    decisionFactors: {
      type: [String],
      default: [],
    },

    modelVersion: {
      type: String,
      default: 'recovery-v1',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const RecoveryOpportunity = mongoose.model(
  'RecoveryOpportunity',
  recoveryOpportunitySchema
);

export default RecoveryOpportunity;