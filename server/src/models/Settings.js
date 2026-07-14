const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    notifyEmail: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

module.exports = mongoose.model('Settings', settingsSchema);
