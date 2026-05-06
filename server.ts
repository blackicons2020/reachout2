import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import cors from 'cors';
import { GoogleGenAI } from "@google/genai";
import { addMinutes, addDays, addWeeks, addMonths, isBefore, startOfDay, set } from 'date-fns';
import { Resend } from 'resend';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- MongoDB Models ---

const OrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: String,
  industry: String,
  country: String,
  defaultCountryCode: String,
  ownerId: String,
  type: { type: String, default: 'business' },
  plan: { type: String, default: 'starter' },
  settings: {
    twilio: { accountSid: String, authToken: String, fromNumber: String },
    whatsapp: { apiKey: String, phoneNumberId: String },
    voice: { provider: String, apiKey: String },
    email: { apiKey: String, fromEmail: String, fromName: String },
  },
  subscription: {
    status: { type: String, default: 'trial' },
    paystackCustomerCode: String,
    lastPaymentReference: String,
    updatedAt: Number
  },
  createdAt: { type: Number, default: Date.now }
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  role: { type: String, default: 'owner' },
  displayName: String,
  photoURL: String,
  setupCompleted: { type: Boolean, default: false }
}, { timestamps: true });

const ContactSchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  firstName: String,
  lastName: String,
  phone: { type: String, required: true },
  email: String,
  city: String,
  state: String,
  tags: [String],
  groups: [String],
  customFields: mongoose.Schema.Types.Mixed,
  notes: String,
  status: { type: String, default: 'active' },
  lastContactedAt: Number,
  createdAt: { type: Number, default: Date.now }
}, { timestamps: true });

const CampaignSchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  type: { type: String, enum: ['sms', 'whatsapp', 'voice', 'email'], required: true },
  status: { type: String, enum: ['draft', 'scheduled', 'sending', 'completed', 'failed'], default: 'scheduled' },
  name: String,
  message: String,
  targetGroups: [String],
  targetTags: [String],
  scheduleAt: Number,
  scheduleTimes: [String],
  lastRunAt: Number,
  recurring: {
    frequency: String,
    interval: Number,
    daysOfWeek: [Number],
    dayOfMonth: Number,
    nextRunAt: Number
  },
  stats: {
    total: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  },
  createdAt: { type: Number, default: Date.now }
}, { timestamps: true });

const InteractionSchema = new mongoose.Schema({
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  type: String,
  status: String,
  timestamp: { type: Number, default: Date.now },
  content: String,
  direction: { type: String, default: 'outbound' }
}, { timestamps: true });

const Organization = mongoose.model('Organization', OrganizationSchema);
const User = mongoose.model('User', UserSchema);
const Contact = mongoose.model('Contact', ContactSchema);
const Campaign = mongoose.model('Campaign', CampaignSchema);
const Interaction = mongoose.model('Interaction', InteractionSchema);

// --- Auth Middleware ---

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Server Implementation ---

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('[MongoDB] Connected successfully');
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    process.exit(1);
  }

  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  // Serve static files from the 'dist' directory
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, 'dist')));

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  // --- Auth Routes ---

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name, orgName, industry } = req.body;
      
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const organization = new Organization({
        name: orgName || `${name}'s Organization`,
        industry: industry || 'Other'
      });
      await organization.save();

      const user = new User({
        email,
        password: hashedPassword,
        displayName: name,
        orgId: organization._id,
        role: 'owner',
        setupCompleted: true
      });
      await user.save();

      organization.ownerId = user._id.toString();
      await organization.save();

      const token = jwt.sign({ userId: user._id, orgId: organization._id, role: user.role }, process.env.JWT_SECRET || 'secret');
      res.status(201).json({ token, user: { id: user._id, email, displayName: name, orgId: organization._id, role: user.role } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'User not found' });

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

      const token = jwt.sign({ userId: user._id, orgId: user.orgId, role: user.role }, process.env.JWT_SECRET || 'secret');
      res.json({ token, user: { id: user._id, email: user.email, displayName: user.displayName, orgId: user.orgId, role: user.role } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.userId).populate('orgId');
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // --- Data Routes ---

  app.get('/api/data/:collection', authenticateToken, async (req: any, res) => {
    try {
      const { collection } = req.params;
      const orgId = req.user.orgId;
      
      let data;
      if (collection === 'contacts') data = await Contact.find({ orgId }).sort({ createdAt: -1 });
      else if (collection === 'campaigns') data = await Campaign.find({ orgId }).sort({ createdAt: -1 });
      else if (collection === 'organizations') data = await Organization.findById(orgId);
      else if (collection === 'users') data = await User.find({ orgId });
      else return res.status(404).json({ message: 'Collection not found' });

      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/data/:collection', authenticateToken, async (req: any, res) => {
    try {
      const { collection } = req.params;
      const orgId = req.user.orgId;
      
      let item;
      if (collection === 'contacts') item = new Contact({ ...req.body, orgId });
      else if (collection === 'campaigns') item = new Campaign({ ...req.body, orgId });
      else return res.status(404).json({ message: 'Collection not found' });

      await item.save();
      res.status(201).json(item);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch('/api/data/:collection/:id', authenticateToken, async (req: any, res) => {
    try {
      const { collection, id } = req.params;
      const orgId = req.user.orgId;
      
      let item;
      if (collection === 'contacts') item = await Contact.findOneAndUpdate({ _id: id, orgId }, req.body, { new: true });
      else if (collection === 'campaigns') item = await Campaign.findOneAndUpdate({ _id: id, orgId }, req.body, { new: true });
      else if (collection === 'organizations') item = await Organization.findOneAndUpdate({ _id: orgId }, req.body, { new: true });
      else return res.status(404).json({ message: 'Collection not found' });

      res.json(item);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete('/api/data/:collection/:id', authenticateToken, async (req: any, res) => {
    try {
      const { collection, id } = req.params;
      const orgId = req.user.orgId;
      
      if (collection === 'contacts') await Contact.findOneAndDelete({ _id: id, orgId });
      else if (collection === 'campaigns') await Campaign.findOneAndDelete({ _id: id, orgId });
      else return res.status(404).json({ message: 'Collection not found' });

      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // --- Outreach Trigger ---

  app.post('/api/outreach/trigger', authenticateToken, async (req: any, res) => {
    const { campaignId } = req.body;
    try {
      const campaign = await Campaign.findOne({ _id: campaignId, orgId: req.user.orgId });
      if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
      
      // Execute in background
      executeCampaign(campaign).catch(err => console.error('Execution error:', err));
      
      res.json({ message: 'Campaign triggered' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // --- Billing Webhooks ---

  app.post('/api/billing/paystack-webhook', async (req, res) => {
    const crypto = await import('crypto');
    const secret = process.env.PAYSTACK_SECRET_KEY;
    
    if (!secret) return res.status(500).send('Webhook secret not configured');

    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
    
    if (hash === req.headers['x-paystack-signature']) {
      const event = req.body;
      if (event.event === 'charge.success') {
        const { reference, customer, metadata } = event.data;
        const orgId = metadata?.orgId || metadata?.custom_fields?.find((f: any) => f.variable_name === 'orgId')?.value;

        if (orgId) {
          try {
            await Organization.findByIdAndUpdate(orgId, {
              'subscription.status': 'active',
              'subscription.paystackCustomerCode': customer.customer_code,
              'subscription.lastPaymentReference': reference,
              'subscription.updatedAt': Date.now(),
            });
            console.log(`[Paystack Webhook] Updated subscription for org: ${orgId}`);
          } catch (error) {
            console.error(`[Paystack Webhook] MongoDB update error:`, error);
          }
        }
      }
    }
    res.sendStatus(200);
  });

  // --- Twilio Webhook ---

  app.post('/api/webhooks/twilio', async (req, res) => {
    const { Body, From, To } = req.body;
    try {
      const cleanTo = To.replace('whatsapp:', '');
      const org = await Organization.findOne({
        $or: [
          { 'settings.twilio.fromNumber': cleanTo },
          { 'settings.twilio.whatsappFromNumber': cleanTo }
        ]
      });

      if (!org || !org.settings?.twilio?.accountSid || !org.settings?.twilio?.authToken) {
        res.type('text/xml');
        return res.send('<Response></Response>');
      }

      const prompt = `You are an autonomous assistant for "${org.name}". Contact (${From}) replied: "${Body}". Generate a helpful, polite response. Return ONLY the response message.`;
      const aiResponse = await ai.models.generateContent({ model: "gemini-1.5-flash", contents: prompt });
      const replyText = aiResponse.text?.trim() || "Thank you for your message.";

      const auth = Buffer.from(`${org.settings.twilio.accountSid}:${org.settings.twilio.authToken}`).toString('base64');
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${org.settings.twilio.accountSid}/Messages.json`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ To: From, From: To, Body: replyText })
      });

      res.type('text/xml');
      res.send('<Response></Response>');
    } catch (error) {
      console.error('[Twilio Webhook] Error:', error);
      res.status(500).send('Error');
    }
  });

  // --- Health Check ---

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
  });

  // --- Static Files / Vite ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

  // --- Scheduler ---

  const runScheduler = async () => {
    const now = Date.now();
    try {
      const campaigns = await Campaign.find({
        status: { $in: ['scheduled', 'sending'] },
        $or: [
          { scheduleAt: { $lte: now } },
          { 'recurring.nextRunAt': { $lte: now } }
        ]
      });

      for (const campaign of campaigns) {
        await executeCampaign(campaign);
      }
    } catch (error) {
      console.error('[Scheduler] Error:', error);
    }
  };

  const executeCampaign = async (campaign: any) => {
    try {
      campaign.status = 'sending';
      await campaign.save();

      const org = await Organization.findById(campaign.orgId);
      if (!org) return;

      const contacts = await Contact.find({ orgId: org._id });
      let targetContacts = contacts;
      if (campaign.targetGroups && !campaign.targetGroups.includes('All Contacts')) {
        targetContacts = contacts.filter(c => c.groups.some(g => campaign.targetGroups.includes(g)));
      }

      let sentCount = 0;
      let failedCount = 0;

      for (const contact of targetContacts) {
        try {
          const success = await sendTwilioMessage({
            type: campaign.type,
            to: contact.phone,
            message: campaign.message.replace(/{{first_name}}/g, contact.firstName || ''),
            accountSid: org.settings.twilio.accountSid,
            authToken: org.settings.twilio.authToken,
            from: campaign.type === 'sms' ? org.settings.twilio.fromNumber : org.settings.twilio.fromNumber
          });
          if (success) sentCount++; else failedCount++;
          
          await new Interaction({
            contactId: contact._id,
            campaignId: campaign._id,
            orgId: org._id,
            type: campaign.type,
            status: success ? 'sent' : 'failed',
            content: campaign.message
          }).save();
        } catch (err) {
          failedCount++;
        }
      }

      campaign.status = 'completed';
      campaign.stats.sent = sentCount;
      campaign.stats.failed = failedCount;
      await campaign.save();
    } catch (error) {
      campaign.status = 'failed';
      await campaign.save();
    }
  };

  const sendTwilioMessage = async ({ type, to, message, accountSid, authToken, from }: any) => {
    if (!accountSid || !authToken || !from) return false;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const twilioTo = type === 'whatsapp' ? `whatsapp:${to}` : to;
    const twilioFrom = type === 'whatsapp' ? `whatsapp:${from}` : from;
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ To: twilioTo, From: twilioFrom, Body: message })
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  // SPA Fallback: Any route that doesn't match an API route or static file
  // should serve index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(path.resolve(), 'dist', 'index.html'));
  });

  setInterval(runScheduler, 60000);
}

startServer();
