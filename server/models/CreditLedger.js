const mongoose = require('mongoose');

const creditLedgerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['earn', 'refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  relatedBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  note: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('CreditLedger', creditLedgerSchema);