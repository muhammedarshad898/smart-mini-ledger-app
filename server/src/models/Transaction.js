const mongoose = require('mongoose');
const {
  TRANSACTION_TYPES,
  TRANSACTION_CATEGORIES,
} = require('../constants/transaction');

const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: {
        values: TRANSACTION_TYPES,
        message: '{VALUE} is not a valid transaction type',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: TRANSACTION_CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    note: {
      type: String,
      trim: true,
      maxlength: [300, 'Note cannot exceed 300 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;

        if (ret.date) {
          ret.date = ret.date.toISOString().split('T')[0];
        }

        return ret;
      },
    },
  },
);

transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1, category: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
