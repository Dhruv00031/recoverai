import mongoose from 'mongoose';

const recoveryPolicySchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    maxRisk: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 60,
    },

    minRecoveryProbability: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
      default: 0.6,
    },

    maxAutomaticRetries: {
      type: Number,
      required: true,
      min: 0,
      default: 2,
    },

    maxAutomaticRecoveryAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 10000,
    },

    dailyAutomaticRecoveryLimit: {
      type: Number,
      required: true,
      min: 0,
      default: 200000,
    },

    maxCustomerInterventions: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },

    minTransactionValue: {
      type: Number,
      required: true,
      min: 0,
      default: 500,
    },

    automaticRecoveryEnabled: {
      type: Boolean,
      default: true,
    },

    version: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    strategyRules: {
      type: [
        {
          failureType: {
            type: String,
            required: true,
            enum: [
              'temporary_failure',
              'network_failure',
              'authentication_failure',
              'insufficient_funds',
              'hard_decline',
              'unknown',
            ],
          },

          recommendation: {
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

          automatic: {
            type: Boolean,
            default: false,
          },

          priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium',
          },
        },
      ],
      default: [],
    },

    safetyRules: {
      highRiskAction: {
        type: String,
        enum: ['manual_review', 'stop'],
        default: 'manual_review',
      },

      repeatedFailureAction: {
        type: String,
        enum: ['manual_review', 'stop'],
        default: 'stop',
      },

      lowConfidenceAction: {
        type: String,
        enum: ['manual_review', 'stop'],
        default: 'manual_review',
      },

      policyViolationAction: {
        type: String,
        enum: ['manual_review', 'stop'],
        default: 'stop',
      },
    },
  },
  {
    timestamps: true,
  }
);

const RecoveryPolicy = mongoose.model(
  'RecoveryPolicy',
  recoveryPolicySchema
);

export default RecoveryPolicy;