import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  logo: String,
  industry: String,
  country: String,
  defaultCountryCode: {
    type: String,
    default: 'NG',
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['religious', 'political', 'nonprofit', 'business', 'education', 'others'],
    default: 'business',
  },
  plan: {
    type: String,
    enum: ['starter', 'growth', 'pro'],
    default: 'starter',
  },
  settings: {
    twilio: {
      accountSid: String,
      authToken: String,
      fromNumber: String,
      smsFromNumber: String, // Supporting both based on server.ts
      whatsappFromNumber: String,
    },
    whatsapp: {
      apiKey: String,
      phoneNumberId: String,
    },
    voice: {
      provider: { type: String, enum: ['bland', 'vapi'] },
      apiKey: String,
    },
    email: {
      apiKey: String,
      fromEmail: String,
      fromName: String,
    },
  },
  subscription: {
    status: { type: String, default: 'inactive' },
    paystackCustomerCode: String,
    lastPaymentReference: String,
    updatedAt: Number,
  },
  createdAt: {
    type: Number,
    default: () => Date.now(),
  },
});

export default mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);
