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
import { assignmentEngine } from './services/assignmentEngine.js';

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
  type: { type: String, enum: ['religious', 'political', 'government', 'business', 'academic', 'nonprofit', 'education', 'others'], default: 'business' },
  plan: { type: String, default: 'starter' },
  settings: {
    profile: {
      name: String,
      industry: String,
      countryCode: String,
      timezone: String,
      logo: String,
      autoBranding: Boolean,
      brandName: String
    },
    twilio: { 
      accountSid: String, 
      authToken: String, 
      smsFromNumber: String, 
      whatsappFromNumber: String 
    },
    whatsapp: { apiKey: String, phoneNumberId: String },
    voice: { provider: String, apiKey: String, phoneNumberId: String, elevenLabsKey: String, agentId: String, usePlatformDefault: Boolean },
    email: { apiKey: String, fromEmail: String, fromName: String },
    notifications: mongoose.Schema.Types.Mixed,
    security: mongoose.Schema.Types.Mixed
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
  organizationType: String,
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
  engagementScore: { type: Number, default: 0 },
  organizationType: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  followUpStatus: { type: String, default: 'not_called' },
  followUpHistory: [{
    memberId: String,
    memberName: String,
    timestamp: Number,
    callOutcome: String,
    notes: String,
    nextFollowUpDate: Number
  }],
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
  targetCity: String,
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

const MemberSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  email: String,
  phone: String,
  role: { type: String, enum: ['owner', 'admin', 'manager', 'member', 'volunteer'], default: 'member' },
  department: String,
  assignedRegions: [String],
  performanceScore: { type: Number, default: 0 },
  totalAssignedContacts: { type: Number, default: 0 },
  totalCompletedFollowUps: { type: Number, default: 0 },
  successfulCalls: { type: Number, default: 0 },
  missedCalls: { type: Number, default: 0 },
  inviteId: { type: String, unique: true },
  joinedAt: { type: Date },
  status: { type: String, enum: ['Pending', 'Active', 'Inactive'], default: 'Pending' },
  createdAt: { type: Number, default: Date.now }
}, { timestamps: true });

const AssignmentSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['pending', 'completed', 'reassigned'], default: 'pending' },
  createdAt: { type: Number, default: Date.now }
}, { timestamps: true });

const CallLogSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  outcome: { type: String, enum: ['not_called', 'called_no_answer', 'reached', 'interested', 'follow_up_later', 'unreachable', 'converted'] },
  notes: String,
  timestamp: { type: Number, default: Date.now },
  nextFollowUpDate: Number
}, { timestamps: true });

const ActivitySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actionType: String,
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: { type: Number, default: Date.now }
}, { timestamps: true });

const Member = mongoose.model('Member', MemberSchema);
const Assignment = mongoose.model('Assignment', AssignmentSchema);
const CallLog = mongoose.model('CallLog', CallLogSchema);
const Activity = mongoose.model('Activity', ActivitySchema);

const LogSchema = new mongoose.Schema({
  message: String,
  level: { type: String, default: 'info' },
  timestamp: { type: Number, default: Date.now },
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

const SystemConfigSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false },
  allowedRegistration: { type: Boolean, default: true },
  updatedAt: { type: Number, default: Date.now }
}, { timestamps: true });

const Log = mongoose.model('Log', LogSchema);
const SystemConfig = mongoose.model('SystemConfig', SystemConfigSchema);

async function createLog(message: string, level = 'info', metadata = {}) {
  try {
    const log = new Log({ message, level, metadata });
    await log.save();
  } catch (err) {
    console.error('Log error:', err);
  }
}

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

const requireSuperAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'superadmin') return res.status(403).json({ message: 'SuperAdmin access required' });
  next();
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
  const engine = assignmentEngine({ Contact, Member, Assignment, Organization }, ai);

  // --- Team Management Routes ---

  app.get('/api/team/members', authenticateToken, async (req: any, res) => {
    try {
      const members = await Member.find({ tenantId: req.user.orgId });
      res.json(members);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/team/invite', authenticateToken, async (req: any, res) => {
    try {
      const { email, phone, name, role, department, regions } = req.body;
      const tenantId = req.user.orgId;

      const member = new Member({
        tenantId,
        name,
        email,
        phone,
        role: role || 'member',
        department,
        assignedRegions: regions,
        inviteId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      });
      await member.save();

      const org = await Organization.findById(tenantId);
      const origin = req.get('origin') || process.env.APP_URL || 'http://localhost:5173';
      const inviteLink = `${origin}/join?invite=${member.inviteId}`;
      const message = `Hello ${name}, you've been invited to join ${org?.name} on ReachOut as a ${role}. Join here: ${inviteLink}`;
      const whatsappUrl = `https://wa.me/${phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

      res.json({ whatsappUrl, inviteLink, inviteId: member.inviteId });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/team/assign', authenticateToken, async (req: any, res) => {
    try {
      const result = await engine.assignContactsToMembers(req.user.orgId);
      res.json({ message: 'Contacts assigned successfully', result });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/team/call-log', authenticateToken, async (req: any, res) => {
    try {
      const { contactId, outcome, notes, nextFollowUpDate } = req.body;
      const tenantId = req.user.orgId;
      
      // Try to find member by userId, or use the one linked to the request
      let member = await Member.findOne({ userId: req.user.userId, tenantId });
      
      // If not found, maybe the user is the owner but acting as a member
      if (!member) {
        member = await Member.findOne({ email: req.user.email, tenantId });
      }

      if (!member) return res.status(403).json({ message: 'Member profile not found' });

      const callLog = new CallLog({
        tenantId,
        contactId,
        memberId: member._id,
        outcome,
        notes,
        nextFollowUpDate
      });
      await callLog.save();

      await Contact.findByIdAndUpdate(contactId, {
        followUpStatus: outcome,
        $push: {
          followUpHistory: {
            memberId: member._id.toString(),
            memberName: member.name,
            timestamp: Date.now(),
            callOutcome: outcome,
            notes,
            nextFollowUpDate
          }
        }
      });

      const update: any = { $inc: { totalCompletedFollowUps: 1 } };
      if (['reached', 'interested', 'converted'].includes(outcome)) {
        update.$inc = { ...update.$inc, successfulCalls: 1 };
      } else if (outcome === 'called_no_answer') {
        update.$inc = { ...update.$inc, missedCalls: 1 };
      }
      await Member.findByIdAndUpdate(member._id, update);

      await new Activity({
        tenantId,
        actorId: req.user.userId,
        actionType: 'call_logged',
        metadata: { contactId, outcome }
      }).save();

      res.status(201).json(callLog);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/team/activities', authenticateToken, async (req: any, res) => {
    try {
      const activities = await Activity.find({ tenantId: req.user.orgId }).sort({ timestamp: -1 }).limit(50);
      res.json(activities);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/team/ai-alerts', authenticateToken, async (req: any, res) => {
    try {
      const alerts = await engine.getAIAlerts(req.user.orgId);
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/team/performance', authenticateToken, async (req: any, res) => {
    try {
      const members = await Member.find({ tenantId: req.user.orgId }).sort({ performanceScore: -1 });
      res.json(members);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // --- Auth Routes ---

  app.post('/api/auth/register', async (req, res) => {
    console.log(`[Auth] Register attempt: ${req.body.email}`);
    try {
      const { email, password, name, orgName, industry, joinCode } = req.body;
      
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);
      
      let orgId;
      let role = 'owner';
      let setupCompleted = false;

      if (joinCode) {
        // Find the member record associated with this invite
        const member = await Member.findOne({ inviteId: joinCode });
        if (!member) return res.status(400).json({ message: 'Invalid or expired invite code' });
        
        orgId = member.tenantId;
        role = member.role.toLowerCase() || 'member';
        setupCompleted = true; // Members joining an existing org don't need to setup the org
        
        // Mark member as joined and update userId
        member.joinedAt = new Date();
        member.status = 'Active';
        // We will set member.userId after user is created
      } else {
        const organization = new Organization({
          name: orgName || `${name}'s Organization`,
          industry: industry || 'Other'
        });
        await organization.save();
        orgId = organization._id;
      }

      const user = new User({
        email,
        password: hashedPassword,
        displayName: name,
        orgId: orgId,
        role: role,
        setupCompleted: setupCompleted
      });
      await user.save();

      if (joinCode) {
        await Member.findOneAndUpdate(
          { inviteId: joinCode }, 
          { 
            userId: user._id, 
            status: 'Active', 
            joinedAt: new Date() 
          }
        );
      } else {
        await Organization.findByIdAndUpdate(orgId, { ownerId: user._id.toString() });
      }

      const token = jwt.sign({ userId: user._id, orgId: orgId, role: user.role }, process.env.JWT_SECRET || 'secret');
      res.status(201).json({ token, user: { id: user._id, email, displayName: name, orgId: orgId, role: user.role, setupCompleted } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    console.log(`[Auth] Login attempt: ${req.body.email}`);
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

  app.post('/api/organizations', authenticateToken, async (req: any, res) => {
    console.log(`[Org] Setup attempt for user: ${req.user.userId}`);
    try {
      const { name, type, industry, state, city, email, phone } = req.body;
      
      const organization = new Organization({
        name,
        type: type || 'business',
        industry: industry || type || 'Other',
        country: state, // Using state as country for now or adjust model
        settings: {
          email: { fromEmail: email, fromName: name }
        }
      });
      await organization.save();
      
      await User.findByIdAndUpdate(req.user.userId, {
        orgId: organization._id,
        organizationType: organization.type,
        setupCompleted: true
      });
      
      res.status(201).json(organization);
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
      executeCampaign(campaign).catch(err => console.error('Execution error:', err));
      res.json({ message: 'Campaign triggered' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/outreach/send', authenticateToken, async (req: any, res) => {
    const { type, phoneNumber, message, accountSid, authToken, fromNumber } = req.body;
    try {
      const success = await sendTwilioMessage({
        type: type || 'sms',
        to: phoneNumber,
        message,
        accountSid,
        authToken,
        from: fromNumber,
        defaultCode: '234' // Default to Nigeria if not specified
      });

      if (success) {
        // Record as an interaction
        const contact = await Contact.findOne({ phone: phoneNumber, orgId: req.user.orgId });
        await new Interaction({
          contactId: contact?._id,
          orgId: req.user.orgId,
          type: type || 'sms',
          status: 'delivered', // Assume delivered if sendTwilioMessage succeeds
          content: message,
          direction: 'outbound'
        }).save();

        res.json({ success: true, message: 'Message sent successfully' });
      } else {
        res.status(500).json({ success: false, message: 'Failed to send message via Twilio' });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.post('/api/outreach/test-twilio', authenticateToken, async (req: any, res) => {
    const { accountSid, authToken } = req.body;
    try {
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
        headers: { 'Authorization': `Basic ${auth}` }
      });

      if (response.ok) {
        res.json({ success: true, message: 'Twilio connection successful' });
      } else {
        const error = await response.json();
        res.status(400).json({ success: false, message: error.message || 'Invalid Twilio credentials' });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // --- Data Routes ---
  const dataHandler = async (req: any, res: any) => {
    try {
      const collection = req.params.collection;
      const id = req.params.id;
      const orgId = req.user.orgId;
      
      if (req.method === 'GET') {
        if (id) {
          let data;
          if (collection === 'organizations' && id === 'members') data = await User.find({ orgId });
          else if (collection === 'contacts') data = await Contact.findOne({ _id: id, orgId });
          else if (collection === 'campaigns') data = await Campaign.findOne({ _id: id, orgId });
          else if (collection === 'organizations') data = await Organization.findById(id || orgId);
          else if (collection === 'users') data = await User.findById(id);
          else return res.status(404).json({ message: 'Collection not found' });
          return res.json(data);
        } else {
          let data;
          if (collection === 'contacts') data = await Contact.find({ orgId }).sort({ createdAt: -1 });
          else if (collection === 'campaigns') data = await Campaign.find({ orgId }).sort({ createdAt: -1 });
          else if (collection === 'organizations') data = await Organization.findById(orgId);
          else if (collection === 'users') data = await User.find({ orgId });
          else if (collection === 'members') data = await User.find({ orgId }); // Special case for members
          else return res.status(404).json({ message: 'Collection not found' });
          return res.json(data);
        }
      } else if (req.method === 'POST') {
        let item;
        if (collection === 'contacts') item = new Contact({ ...req.body, orgId });
        else if (collection === 'campaigns') item = new Campaign({ ...req.body, orgId });
        else return res.status(404).json({ message: 'Collection not found' });
        await item.save();
        return res.status(201).json(item);
      } else if (req.method === 'PATCH') {
        let item;
        if (collection === 'contacts') item = await Contact.findOneAndUpdate({ _id: id, orgId }, req.body, { new: true });
        else if (collection === 'campaigns') item = await Campaign.findOneAndUpdate({ _id: id, orgId }, req.body, { new: true });
        else if (collection === 'organizations') item = await Organization.findOneAndUpdate({ _id: orgId }, req.body, { new: true });
        else return res.status(404).json({ message: 'Collection not found' });
        return res.json(item);
      } else if (req.method === 'DELETE') {
        if (collection === 'contacts') await Contact.findOneAndDelete({ _id: id, orgId });
        else if (collection === 'campaigns') await Campaign.findOneAndDelete({ _id: id, orgId });
        else return res.status(404).json({ message: 'Collection not found' });
        return res.sendStatus(204);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  app.all('/api/data/:collection', authenticateToken, dataHandler);
  app.all('/api/data/:collection/:id', authenticateToken, dataHandler);
  app.all('/api/:collection', authenticateToken, dataHandler);
  app.all('/api/:collection/:id', authenticateToken, dataHandler);

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
          { 'settings.twilio.smsFromNumber': cleanTo },
          { 'settings.twilio.whatsappFromNumber': cleanTo }
        ]
      });

      if (!org || !org.settings?.twilio?.accountSid || !org.settings?.twilio?.authToken) {
        res.type('text/xml');
        return res.send('<Response></Response>');
      }

      const tones: any = {
        religious: 'warm, welcoming, spiritual, and compassionate',
        political: 'persuasive, mobilizing, confident, and action-oriented',
        government: 'informative, professional, trustworthy, and clear',
        business: 'professional, persuasive, and customer-focused',
        academic: 'educational, supportive, and professional'
      };
      const tone = tones[org.type as string] || 'professional and helpful';

      const prompt = `You are an AI assistant for "${org.name}" (Type: ${org.type}). 
      Tone: ${tone}.
      Contact (${From}) replied: "${Body}". 
      Generate a helpful, polite response that aligns with the organization's mission. 
      Return ONLY the response message.`;

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

  // --- Admin Routes ---

  app.get('/api/admin/organizations', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
      const orgs = await Organization.find().sort({ createdAt: -1 });
      res.json(orgs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch('/api/admin/organizations/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
      const org = await Organization.findByIdAndUpdate(req.params.id, req.body, { new: true });
      await createLog(`Updated organization: ${org?.name}`, 'info', { orgId: req.params.id, updates: req.body });
      res.json(org);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/admin/users', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
      const users = await User.find().sort({ createdAt: -1 });
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/admin/logs', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
      const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/admin/config', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
      let config = await SystemConfig.findOne();
      if (!config) {
        config = new SystemConfig();
        await config.save();
      }
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch('/api/admin/config', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
      const config = await SystemConfig.findOneAndUpdate({}, req.body, { new: true, upsert: true });
      await createLog(`System configuration updated`, 'warning', req.body);
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/organizations/recalculate-scores', authenticateToken, async (req: any, res) => {
    try {
      const orgId = req.user.orgId;
      if (!orgId) return res.status(400).json({ message: 'No organization linked to user' });
      
      const contacts = await Contact.find({ orgId });
      const interactions = await Interaction.find({ orgId });

      for (const contact of contacts) {
        const contactInteractions = interactions.filter(i => i.contactId?.toString() === contact._id.toString());
        const inbound = contactInteractions.filter(i => i.direction === 'inbound').length;
        const total = contactInteractions.length;
        
        let score = contact.engagementScore || 0;
        if (total > 0) {
          score = Math.round(Math.min(100, (inbound / total) * 100 + (total * 2)));
        }

        let status = contact.status;
        if (score > 70) status = 'engaged';
        else if (score < 20 && total > 0) status = 'cold';

        await Contact.findByIdAndUpdate(contact._id, { engagementScore: score, status });
      }

      res.json({ message: 'Engagement scores updated' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
      const isAllContacts = campaign.targetGroups?.includes('All Contacts');
      let targetContacts = contacts;
      
      if (!isAllContacts) {
        targetContacts = contacts.filter(c => {
          const inGroup = campaign.targetGroups?.some(g => c.groups?.includes(g));
          const hasTag = campaign.targetTags?.some(t => c.tags?.includes(t));
          const inCity = campaign.targetCity && c.city?.toLowerCase().includes(campaign.targetCity.toLowerCase());
          return inGroup || hasTag || inCity;
        });
      }

      let sentCount = 0;
      let deliveredCount = 0;
      let failedCount = 0;

      for (const contact of targetContacts) {
        try {
          const success = await sendTwilioMessage({
            type: campaign.type,
            to: contact.phone,
            message: campaign.message.replace(/{{first_name}}/g, contact.firstName || ''),
            accountSid: org.settings.twilio.accountSid,
            authToken: org.settings.twilio.authToken,
            from: campaign.type === 'whatsapp' ? org.settings.twilio?.whatsappFromNumber : org.settings.twilio?.smsFromNumber,
            defaultCode: org.settings.profile?.countryCode?.replace('+', '') || '234'
          });
          
          if (success) {
            sentCount++;
            deliveredCount++;
          } else {
            failedCount++;
          }
          
          await new Interaction({
            contactId: contact._id,
            campaignId: campaign._id,
            orgId: org._id,
            type: campaign.type,
            status: success ? 'delivered' : 'failed',
            content: campaign.message
          }).save();
        } catch (err) {
          failedCount++;
        }
      }

      campaign.status = 'completed';
      campaign.stats.sent = sentCount;
      campaign.stats.delivered = deliveredCount;
      campaign.stats.failed = failedCount;
      campaign.lastRunAt = Date.now();
      await campaign.save();
    } catch (error) {
      campaign.status = 'failed';
      await campaign.save();
    }
  };

  const formatPhone = (phone: string, defaultCode = '234') => {
    if (!phone) return '';
    if (phone.startsWith('+')) return phone;
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith(defaultCode)) return `+${clean}`;
    if (clean.startsWith('0')) clean = clean.substring(1);
    return `+${defaultCode}${clean}`;
  };

  const sendTwilioMessage = async ({ type, to, message, accountSid, authToken, from, defaultCode }: any) => {
    if (!accountSid || !authToken || !from) {
      await createLog('Twilio configuration missing', 'error', { accountSid: !!accountSid, authToken: !!authToken, from: !!from });
      return false;
    }
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const cleanTo = formatPhone(to, defaultCode);
    const cleanFrom = formatPhone(from, defaultCode);
    
    const twilioTo = type === 'whatsapp' ? `whatsapp:${cleanTo}` : cleanTo;
    const twilioFrom = type === 'whatsapp' ? `whatsapp:${cleanFrom}` : cleanFrom;
    
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ To: twilioTo, From: twilioFrom, Body: message })
      });
      if (!response.ok) {
        const err = await response.json();
        console.error('[Twilio] Error:', err.message);
        await createLog(`Twilio Send Error: ${err.message}`, 'error', { to: cleanTo, from: cleanFrom, type });
      }
      return response.ok;
    } catch (err: any) {
      console.error('[Twilio] Fetch Error:', err);
      await createLog(`Twilio Fetch Error: ${err.message}`, 'error', { to: cleanTo, from: cleanFrom, type });
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
