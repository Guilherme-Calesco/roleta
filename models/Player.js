const mongoose = require('mongoose');

const PrizeSubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    isMaster: { type: Boolean, default: false }
  },
  { _id: false }
);

const PlayerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    amountPaid: { type: Number, required: true, min: 0 },
    pixConfirmed: { type: Boolean, default: false },
    prize: { type: PrizeSubSchema, default: null },
    voucherHash: { type: String, unique: true, sparse: true, index: true },
    redemptionCode: { type: String, default: null },
    spunAt: { type: Date, default: null },
    finalRouletteWinner: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

PlayerSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Player', PlayerSchema);
