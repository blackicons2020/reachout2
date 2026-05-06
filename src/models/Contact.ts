import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: String,
  city: String,
  state: String,
  tags: [String],
  groups: [String],
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
  notes: String,
  createdAt: {
    type: Number,
    default: () => Date.now(),
  },
  lastContactedAt: Number,
  status: {
    type: String,
    enum: ['active', 'inactive', 'lead', 'customer', 'engaged', 'cold', 'converted'],
    default: 'active',
  },
  // Industry specific fields
  location: String, // Religious
  outreachDate: Number, // Religious
  source: String, // Religious
  lga: String, // Political
  ward: String, // Political
});

export default mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
