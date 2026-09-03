import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
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

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      required: true,
      default: 'INR',
      uppercase: true,
      trim: true,
    },

    status: {
      type: String,
      required: true,
      enum: [
        'created',
        'authorized',
        'captured',
        'failed',
        'refunded',
        'cancelled',
      ],
      default: 'created',
      index: true,
    },

    failureType: {
      type: String,
      enum: [
        'temporary_failure',
        'network_failure',
        'authentication_failure',
        'insufficient_funds',
        'hard_decline',
        'unknown',
        null,
      ],
      default: null,
    },

    failureReason: {
      type: String,
      trim: true,
    },

    paymentMethod: {
      type: String,
      trim: true,
    },

    attempts: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    customerRef: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;