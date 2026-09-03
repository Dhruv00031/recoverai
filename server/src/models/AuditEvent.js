import mongoose from 'mongoose';

const auditEventSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      index: true,
    },

    recoveryOpportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecoveryOpportunity',
      index: true,
    },

    recoveryActionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecoveryAction',
      index: true,
    },

    eventType: {
      type: String,
      required: true,
      enum: [
        'payment_failed',
        'payment_captured',
        'ai_analysis',
        'policy_evaluation',
        'recovery_action_created',
        'recovery_action_blocked',
        'recovery_action_initiated',
        'recovery_action_succeeded',
        'recovery_action_failed',
        'manual_intervention',
      ],
      index: true,
    },

    actor: {
      type: String,
      required: true,
      enum: [
        'razorpay',
        'ai_engine',
        'policy_engine',
        'system',
        'merchant',
      ],
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    modelVersion: {
      type: String,
      trim: true,
    },

    policyVersion: {
      type: Number,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

const AuditEvent = mongoose.model(
  'AuditEvent',
  auditEventSchema
);

export default AuditEvent;