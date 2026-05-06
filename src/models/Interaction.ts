import mongoose from 'mongoose';

const InteractionSchema = new mongoose.Schema({
  contactId: {
    type: String, // Keeping as String to match current usage which sometimes uses phone
    required: true,
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
  },
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
    enum: ['sent', 'delivered', 'failed', 'read', 'replied', 'answered', 'no-answer', 'voicemail', 'opened', 'clicked'],
    default: 'sent',
  },
  timestamp: {
    type: Number,
    default: () => Date.now(),
  },
  content: String,
  recordingUrl: String,
  transcript: String,
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    default: 'outbound',
  },
});

export default mongoose.models.Interaction || mongoose.model('Interaction', InteractionSchema);
