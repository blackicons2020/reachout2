import mongoose from 'mongoose';

const CampaignSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['sms', 'whatsapp', 'voice', 'email'],
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'completed', 'failed'],
    default: 'draft',
  },
  name: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  targetGroups: [String],
  targetTags: [String],
  scheduleAt: Number,
  scheduleTimes: [String],
  lastRunAt: Number,
  recurring: {
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    interval: { type: Number, default: 1 },
    daysOfWeek: [Number], // 0-6
    dayOfMonth: Number,
    nextRunAt: Number,
  },
  stats: {
    total: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    read: { type: Number, default: 0 },
    replied: { type: Number, default: 0 },
    answered: { type: Number, default: 0 },
    voicemail: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
  },
  createdAt: {
    type: Number,
    default: () => Date.now(),
  },
  updatedAt: {
    type: Number,
    default: () => Date.now(),
  },
});

export default mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);
