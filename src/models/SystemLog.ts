import mongoose from 'mongoose';

const SystemLogSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  action: {
    type: String,
    required: true,
  },
  details: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Number,
    default: () => Date.now(),
  },
});

export default mongoose.models.SystemLog || mongoose.model('SystemLog', SystemLogSchema);
