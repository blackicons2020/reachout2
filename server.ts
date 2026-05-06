import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import cors from 'cors';
import { GoogleGenAI } from "@google/genai";
import { addMinutes, addDays, addWeeks, addMonths, isBefore, startOfDay, set } from 'date-fns';
import { Resend } from 'resend';
import jwt from 'jsonwebtoken';
import dbConnect from './src/lib/db.ts';
import User from './src/models/User.ts';
import Organization from './src/models/Organization.ts';
import Contact from './src/models/Contact.ts';
import Campaign from './src/models/Campaign.ts';
import Interaction from './src/models/Interaction.ts';
import SystemLog from './src/models/SystemLog.ts';
import { SystemConfig } from './src/models/SystemConfig.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Paystack Integration
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = process.env.PORT || 3000;
const isVercel = process.env.VERCEL === '1';

// Standard Middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Initialize Database (don't await at top level to avoid Vercel timeouts)
dbConnect().catch(err => console.error('Initial DB connection error:', err));

// Database connection middleware for safety
const ensureDb = async (req: any, res: any, next: any) => {
  try {
    await dbConnect();
    next();
  } catch (err: any) {
    res.status(500).json({ message: 'Database connection failed' });
  }
};

// Auth Middleware
const authenticate = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Paystack Webhook
app.post('/api/billing/paystack-webhook', async (req, res) => {
  const crypto = await import('crypto');
  const secret = process.env.PAYSTACK_SECRET_KEY;
  
  if (!secret) {
    console.error('[Paystack Webhook] Secret key not configured');
    return res.status(500).send('Webhook secret not configured');
  }

  const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
  
  if (hash === req.headers['x-paystack-signature']) {
    const event = req.body;
    console.log('[Paystack Webhook] Received:', event.event);

    if (event.event === 'charge.success') {
      const { reference, customer, metadata } = event.data;
      const orgId = metadata?.orgId || metadata?.custom_fields?.find((f: any) => f.variable_name === 'orgId')?.value;

      if (orgId) {
        try {
          await dbConnect();
          await Organization.findByIdAndUpdate(orgId, {
            'subscription.status': 'active',
            'subscription.paystackCustomerCode': customer.customer_code,
            'subscription.lastPaymentReference': reference,
            'subscription.updatedAt': Date.now(),
          });
          console.log(`[Paystack Webhook] Updated subscription for org: ${orgId}`);
        } catch (error) {
          console.error(`[Paystack Webhook] MongoDB update error for org ${orgId}:`, error);
        }
      }
    }
  } else {
    console.warn('[Paystack Webhook] Invalid signature');
  }
  
  res.send(200);
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// API Routes
app.get('/api/health', ensureDb, (req, res) => {
  res.json({ status: 'ok', database: 'mongodb', env: isVercel ? 'vercel' : 'local' });
});

// Vercel Cron Trigger
app.get('/api/cron/scheduler', ensureDb, async (req, res) => {
  console.log('[Cron] Manual scheduler trigger via API');
  await runScheduler();
  res.json({ status: 'success', message: 'Scheduler triggered' });
});

// Auth Routes
app.post('/api/auth/register', ensureDb, async (req, res) => {
    const { email, password, displayName } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });

      const user = new User({ email, password, displayName });
      await user.save();

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ token, user: { id: user._id, email: user.email, displayName: user.displayName, role: user.role } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/auth/login', ensureDb, async (req, res) => {
    const { email, password } = req.body;
    try {
      await dbConnect();
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user._id, email: user.email, displayName: user.displayName, role: user.role, orgId: user.orgId } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/auth/me', ensureDb, authenticate, async (req: any, res) => {
    try {
      const user = await User.findById(req.userId).populate('orgId');
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Organization Routes
  app.post('/api/organizations', ensureDb, authenticate, async (req: any, res) => {
    try {
      const org = new Organization({ ...req.body, ownerId: req.userId });
      await org.save();
      await User.findByIdAndUpdate(req.userId, { orgId: org._id, role: 'owner', setupCompleted: true });
      res.status(201).json(org);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/organizations/:id', ensureDb, authenticate, async (req, res) => {
    try {
      const org = await Organization.findById(req.params.id);
      if (!org) return res.status(404).json({ message: 'Organization not found' });
      res.json(org);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch('/api/organizations/:id', ensureDb, authenticate, async (req, res) => {
    try {
      const org = await Organization.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(org);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Contact Routes
  app.get('/api/contacts', ensureDb, authenticate, async (req: any, res) => {
    try {
      const user = await User.findById(req.userId);
      if (!user?.orgId) return res.status(400).json({ message: 'User has no organization' });
      const contacts = await Contact.find({ orgId: user.orgId });
      res.json(contacts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/contacts', ensureDb, authenticate, async (req: any, res) => {
    try {
      const user = await User.findById(req.userId);
      if (!user?.orgId) return res.status(400).json({ message: 'User has no organization' });
      const contact = new Contact({ ...req.body, orgId: user.orgId });
      await contact.save();
      res.status(201).json(contact);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch('/api/contacts/:id', ensureDb, authenticate, async (req, res) => {
    try {
      const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(contact);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete('/api/contacts/:id', ensureDb, authenticate, async (req, res) => {
    try {
      await Contact.findByIdAndDelete(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Campaign Routes
  app.get('/api/campaigns', ensureDb, authenticate, async (req: any, res) => {
    try {
      const user = await User.findById(req.userId);
      if (!user?.orgId) return res.status(400).json({ message: 'User has no organization' });
      const campaigns = await Campaign.find({ orgId: user.orgId });
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/campaigns', ensureDb, authenticate, async (req: any, res) => {
    try {
      const user = await User.findById(req.userId);
      if (!user?.orgId) return res.status(400).json({ message: 'User has no organization' });
      const campaign = new Campaign({ ...req.body, orgId: user.orgId });
      await campaign.save();
      res.status(201).json(campaign);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch('/api/campaigns/:id', ensureDb, authenticate, async (req, res) => {
    try {
      const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Paystack Transaction Verification
  app.get('/api/billing/verify-paystack/:reference', ensureDb, async (req, res) => {
    const { reference } = req.params;
    
    if (!paystackSecretKey) {
      return res.status(500).json({ message: 'Paystack is not configured on the server.' });
    }

    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.status && data.data.status === 'success') {
        // Optionally update DB here if not already handled by webhook
        res.json({ status: 'success', data: data.data });
      } else {
        res.status(400).json({ status: 'error', message: data.message || 'Verification failed' });
      }
    } catch (error: any) {
      console.error('Paystack Verification Error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/outreach/send', ensureDb, async (req, res) => {
    const { type, phoneNumber, message, accountSid, authToken, fromNumber } = req.body;

    if (!accountSid || !authToken || !fromNumber) {
      return res.status(400).json({ message: 'Twilio configuration is incomplete.' });
    }

    try {
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const cleanFrom = fromNumber.replace(/\s/g, '');
      const encodedSid = encodeURIComponent(accountSid.trim());
      
      const to = type === 'whatsapp' ? `whatsapp:${phoneNumber}` : phoneNumber;
      const from = type === 'whatsapp' ? `whatsapp:${cleanFrom}` : cleanFrom;

      const url = `https://api.twilio.com/2010-04-01/Accounts/${encodedSid}/Messages.json`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          To: to,
          From: from,
          Body: message,
        }),
      });

      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Twilio returned non-JSON response:', text);
        return res.status(response.status).json({ 
          message: `Twilio returned an unexpected response format (${response.status}).` 
        });
      }

      if (!response.ok) {
        let errorMessage = data.message || `Twilio API Error: ${response.status}`;
        
        // Specific WhatsApp Sandbox error
        if (type === 'whatsapp' && data.code === 63003) {
          errorMessage = "WhatsApp Sandbox Error: The recipient has not joined your Twilio Sandbox. They must send 'join [your-sandbox-keyword]' to your Twilio number first.";
        } else if (type === 'whatsapp' && data.code === 21608) {
          errorMessage = "Twilio Error: This number is not yet verified for WhatsApp. If using a trial account, ensure the number is verified in your Twilio console.";
        }

        return res.status(response.status).json({ message: errorMessage, code: data.code });
      }

      res.json(data);
    } catch (error: any) {
      console.error('Outreach Send Error:', error);
      res.status(500).json({ message: `Server Error: ${error.message || 'Unknown error occurred'}` });
    }
  });

  app.post('/api/outreach/email', async (req, res) => {
    const { to, subject, body, apiKey, fromEmail, fromName } = req.body;

    const resendApiKey = apiKey || process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return res.status(400).json({ message: 'Email API Key is missing.' });
    }

    try {
      const resend = new Resend(resendApiKey);
      const { data, error } = await resend.emails.send({
        from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
        to: [to],
        subject: subject || 'New Message from Outreach',
        text: body,
      });

      if (error) {
        console.error('Resend Error:', error);
        return res.status(400).json({ message: error.message });
      }

      res.json(data);
    } catch (error: any) {
      console.error('Email Outreach Error:', error);
      res.status(500).json({ message: `Email Server Error: ${error.message}` });
    }
  });

  app.post('/api/outreach/test-twilio', async (req, res) => {
    const { accountSid, authToken } = req.body;

    if (!accountSid || !authToken) {
      return res.status(400).json({ message: 'Account SID and Auth Token are required.' });
    }

    try {
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const encodedSid = encodeURIComponent(accountSid.trim());
      const url = `https://api.twilio.com/2010-04-01/Accounts/${encodedSid}.json`;
      
      console.log(`Testing Twilio connection for SID: ${accountSid.substring(0, 5)}...`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        },
      });

      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Twilio returned non-JSON response:', text);
        return res.status(response.status).json({ 
          message: `Twilio returned an unexpected response format (${response.status}). Please check your Account SID.` 
        });
      }

      if (!response.ok) {
        return res.status(response.status).json({ message: data.message || `Twilio API Error: ${response.status}` });
      }

      res.json({ status: 'success', friendlyName: data.friendly_name });
    } catch (error: any) {
      console.error('Twilio Test Error:', error);
      res.status(500).json({ message: `Server Error: ${error.message || 'Unknown error occurred'}` });
    }
  });

  // Twilio Webhook for Autonomous Responses
  app.post('/api/webhooks/twilio', async (req, res) => {
    const { Body, From, To } = req.body;
    console.log(`Received message to ${To} from ${From}: ${Body}`);

    try {
      // Find the organization that owns this number
      const cleanTo = To.replace('whatsapp:', '');
      const targetOrg = await Organization.findOne({
        $or: [
          { 'settings.twilio.smsFromNumber': cleanTo },
          { 'settings.twilio.whatsappFromNumber': cleanTo }
        ]
      });

      if (!targetOrg || !targetOrg.settings?.twilio?.accountSid || !targetOrg.settings?.twilio?.authToken) {
        console.warn(`[Webhook] No organization found for number ${To}. Sending generic response or ignoring.`);
        res.type('text/xml');
        return res.send(`<Response></Response>`);
      }

      const targetTwilio = targetOrg.settings.twilio;

      // 1. Generate autonomous response using Gemini
      const prompt = `
        You are an autonomous assistant for "${targetOrg.name}".
        A contact (${From}) replied to our message with: "${Body}"
        
        Generate a helpful, polite, and intelligent response to this message.
        If they are asking a question, try to answer it generally or tell them someone will follow up.
        If they are confirming something, acknowledge it warmly.
        If they are opting out, acknowledge it professionally.
        
        Return ONLY the response message.
      `;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const replyText = aiResponse.text?.trim() || "Thank you for your message. We have received it.";

      // 2. Send reply back via Twilio using Org credentials
      const auth = Buffer.from(`${targetTwilio.accountSid}:${targetTwilio.authToken}`).toString('base64');
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${targetTwilio.accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: From,
          From: To, // The number they replied to
          Body: replyText,
        }),
      });
      console.log(`[Webhook] Sent autonomous reply to ${From}: ${replyText}`);

      // 3. Return TwiML
      res.type('text/xml');
      res.send(`<Response></Response>`);
    } catch (error) {
      console.error('[Webhook] Error:', error);
      res.status(500).send('Error processing webhook');
    }
  });

  // Endpoint to trigger a campaign immediately (used for "Send Now")
  app.post('/api/outreach/trigger', authenticate, async (req: any, res) => {
    const { campaignId } = req.body;
    if (!campaignId) {
      return res.status(400).json({ message: 'Missing campaignId' });
    }

    try {
      const user = await User.findById(req.userId);
      const orgId = user?.orgId;
      if (!orgId) return res.status(400).json({ message: 'User has no organization' });

      console.log(`[API] Triggering campaign ${campaignId} for org ${orgId} immediate execution`);
      
      const campaign = await Campaign.findOne({ _id: campaignId, orgId });

      if (!campaign) {
        console.error(`[API] Campaign ${campaignId} not found in org ${orgId}`);
        return res.status(404).json({ message: 'Campaign not found' });
      }

      console.log(`[API] Found campaign: ${campaign.name}. Launching execution...`);
      
      // Run it in the background so we don't block the API response
      executeCampaign(campaign).then(() => {
        console.log(`[API] Execution FINISHED for campaign ${campaignId}`);
      }).catch(err => {
        console.error(`[API] Async execution error for ${campaignId}:`, err);
      });

      res.json({ message: 'Campaign execution started' });
    } catch (error: any) {
      console.error('[API] Trigger Error:', error.message);
      res.status(500).json({ message: `Trigger failed: ${error.message}` });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Autonomous Scheduler Logic
  const SCHEDULER_INTERVAL = 20 * 1000; // Check every 20 seconds for faster feedback in dev

  async function runScheduler() {
    console.log(`[Scheduler] Checking for scheduled campaigns at ${new Date().toISOString()}...`);
    try {
      const now = Date.now();
      const campaigns = await Campaign.find({
        status: { $in: ['scheduled', 'sending', 'completed'] },
      });

      for (const campaign of campaigns) {
        if (campaign.status === 'sending') {
          const updatedAt = campaign.updatedAt || 0;
          if (now - updatedAt > 10 * 60 * 1000) {
            console.log(`[Scheduler] Retrying stuck campaign: ${campaign.name}`);
          } else {
            continue;
          }
        }

        let shouldRun = false;
        if (campaign.status === 'scheduled' && campaign.scheduleAt && campaign.scheduleAt <= now) {
          shouldRun = true;
        } else if (campaign.recurring && campaign.recurring.nextRunAt && campaign.recurring.nextRunAt <= now) {
          shouldRun = true;
        }

        if (shouldRun) {
          console.log(`[Scheduler] Executing campaign: ${campaign.name} (${campaign.type}) in Org: ${campaign.orgId}`);
          await executeCampaign(campaign);
        }
      }
    } catch (error) {
      console.error('[Scheduler] Error:', error);
    }
  }

  async function executeCampaign(campaign: any) {
    try {
      // Update status to sending
      campaign.status = 'sending';
      campaign.updatedAt = Date.now();
      await campaign.save();

      // Get settings from organization
      const org = await Organization.findById(campaign.orgId);
      if (!org) return;

      const settings = org.settings || {};
      const twilio = settings.twilio || {};
      const emailSettings = settings.email || {};
      
      // Get contacts
      let targetContacts = await Contact.find({ orgId: org._id });

      if (campaign.targetGroups && !campaign.targetGroups.includes('All Contacts')) {
        targetContacts = targetContacts.filter(c => 
          c.groups && c.groups.some((g: string) => campaign.targetGroups.includes(g))
        );
      }

      console.log(`[Scheduler] Targeting ${targetContacts.length} contacts for ${campaign.name}`);

      let sentCount = 0;
      let failedCount = 0;

      for (const contact of targetContacts) {
        if (!contact.phone) {
          console.log(`[Scheduler] Skipping contact ${contact.firstName || 'Unknown'} - No phone number`);
          failedCount++;
          continue;
        }

        try {
          const message = (campaign.message || '')
            .replace(/{{first_name}}/g, contact.firstName || '')
            .replace(/{{last_name}}/g, contact.lastName || '');

          console.log(`[Scheduler] Sending ${campaign.type} to ${contact.phone}...`);
          
          if (campaign.type === 'sms' || campaign.type === 'whatsapp') {
            const success = await sendTwilioMessage({
              type: campaign.type,
              to: contact.phone,
              message,
              accountSid: twilio.accountSid,
              authToken: twilio.authToken,
              from: campaign.type === 'sms' ? twilio.smsFromNumber : twilio.whatsappFromNumber
            });
            
            if (success) {
              console.log(`[Scheduler] ${campaign.type} sent successfully to ${contact.phone}`);
              sentCount++;
            } else {
              console.error(`[Scheduler] ${campaign.type} failed for ${contact.phone} (check Twilio logs/settings)`);
              failedCount++;
            }
          } else if (campaign.type === 'email') {
            if (!contact.email) {
              console.log(`[Scheduler] Skipping contact ${contact.firstName || 'Unknown'} - No email address`);
              failedCount++;
              continue;
            }

            const resendApiKey = emailSettings.apiKey || process.env.RESEND_API_KEY;
            if (resendApiKey && emailSettings.fromEmail) {
               const resend = new Resend(resendApiKey);
               const { data, error } = await resend.emails.send({
                 from: emailSettings.fromName ? `${emailSettings.fromName} <${emailSettings.fromEmail}>` : emailSettings.fromEmail,
                 to: [contact.email],
                 subject: campaign.name,
                 text: message,
               });
               
               if (!error) {
                 console.log(`[Scheduler] Email sent successfully to ${contact.email}`);
                 sentCount++;
               } else {
                 console.error(`[Scheduler] Email failed for ${contact.email}:`, error);
                 failedCount++;
               }
            } else {
              console.error(`[Scheduler] Email configuration missing for Org: ${org._id}`);
              failedCount++;
            }
          }

          // Create interaction record
          const interaction = new Interaction({
            contactId: contact.id || contact.phone || '',
            campaignId: campaign._id,
            orgId: org._id,
            type: campaign.type,
            status: 'sent',
            timestamp: Date.now(),
            content: message,
            direction: 'outbound'
          });
          await interaction.save();

        } catch (err) {
          console.error(`[Scheduler] Failed to send to ${contact.phone}:`, err);
          failedCount++;
        }
      }

      // Determine what the status should be after run
      let nextRunAt: number | null = null;
      if (campaign.recurring) {
        nextRunAt = calculateNextRun(campaign.recurring, campaign.scheduleTimes || []);
      }

      campaign.stats.sent += sentCount;
      campaign.stats.delivered += sentCount;
      campaign.stats.failed += failedCount;
      campaign.updatedAt = Date.now();
      campaign.lastRunAt = Date.now();

      if (nextRunAt) {
        campaign.status = 'scheduled';
        campaign.recurring.nextRunAt = nextRunAt;
      } else {
        campaign.status = 'completed';
      }

      await campaign.save();
      console.log(`[Scheduler] Completed campaign ${campaign.name}. Sent: ${sentCount}, Failed: ${failedCount}`);

    } catch (error) {
      console.error(`[Scheduler] Execution Error for ${campaign._id}:`, error);
      campaign.status = 'failed';
      campaign.updatedAt = Date.now();
      await campaign.save();
    }
  }

  async function sendTwilioMessage({ type, to, message, accountSid, authToken, from }: any) {
    if (!accountSid || !authToken || !from) {
      console.error(`[Twilio] Missing credentials for ${type} send. SID: ${!!accountSid}, Token: ${!!authToken}, From: ${!!from}`);
      return false;
    }

    const auth = Buffer.from(`${accountSid.trim()}:${authToken.trim()}`).toString('base64');
    
    // Ensure both numbers are in E.164 format and cleaned
    const formatPhone = (phone: string) => {
      let cleaned = phone.replace(/\s/g, '').replace('whatsapp:', '');
      if (!cleaned.startsWith('+')) cleaned = '+' + cleaned;
      return cleaned;
    };

    const cleanFrom = formatPhone(from);
    const cleanTo = formatPhone(to);
    
    const encodedSid = encodeURIComponent(accountSid.trim());
    
    const twilioTo = type === 'whatsapp' ? `whatsapp:${cleanTo}` : cleanTo;
    const twilioFrom = type === 'whatsapp' ? `whatsapp:${cleanFrom}` : cleanFrom;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${encodedSid}/Messages.json`;

    try {
      console.log(`[Twilio] Attempting to send ${type} to ${twilioTo} from ${twilioFrom}`);
      console.log(`[Twilio] Using SID: ${accountSid.substring(0, 5)}... and Token length: ${authToken.length}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: twilioTo, From: twilioFrom, Body: message }),
      });
      
      if (!response.ok) {
        const errData = await response.json();
        console.error(`[Twilio] API ERROR (HTTP ${response.status}):`, JSON.stringify(errData, null, 2));
      } else {
        const successData = await response.json();
        console.log(`[Twilio] SUCCESS: Message sent! SID: ${successData.sid}`);
      }
      return response.ok;
    } catch (e) {
      console.error(`[Twilio] FETCH EXCEPTION:`, e);
      return false;
    }
  }

  function calculateNextRun(recurring: any, scheduleTimes: string[] = []) {
    const { frequency, interval, daysOfWeek, dayOfMonth } = recurring;
    const now = new Date();
    
    // Sort times to easily find the next one
    const sortedTimes = (scheduleTimes.length > 0 ? scheduleTimes : ['09:00']).sort();
    
    // Start searching from current run time or now
    let baseDate = new Date(recurring.nextRunAt || Date.now());
    
    // Safety check: if baseDate is way in the past, start from now
    if (isBefore(baseDate, addDays(now, -1))) {
      baseDate = now;
    }

    // Try to find the next time TODAY first
    const todayStr = baseDate.toISOString().split('T')[0];
    for (const time of sortedTimes) {
      const candidate = new Date(`${todayStr}T${time}`);
      if (candidate.getTime() > baseDate.getTime() + 60000) { // Add 1 minute buffer
        // If it's a daily/weekly/monthly check if this day is even valid
        if (frequency === 'daily') return candidate.getTime();
        if (frequency === 'weekly' && daysOfWeek.includes(candidate.getDay())) return candidate.getTime();
        if (frequency === 'monthly' && candidate.getDate() === dayOfMonth) return candidate.getTime();
      }
    }

    // If no more times today, look at future days
    let daysToAdd = 1;
    const maxDays = frequency === 'monthly' ? 366 : 31; // Safety limit
    
    while (daysToAdd <= maxDays) {
      const nextDay = addDays(baseDate, daysToAdd);
      const nextDayStr = nextDay.toISOString().split('T')[0];
      
      let dayValid = false;
      if (frequency === 'daily') {
        // Daily with interval logic... simplified for now
        dayValid = (daysToAdd % interval === 0);
      } else if (frequency === 'weekly' || frequency === 'monthly') {
        dayValid = daysOfWeek.includes(nextDay.getDay());
      }

      if (dayValid) {
        // Return the earliest time on this valid day
        return new Date(`${nextDayStr}T${sortedTimes[0]}`).getTime();
      }
      daysToAdd++;
    }
    
    return null;
  }

  // Start the background interval ONLY if not on Vercel
  // Vercel uses Cron Jobs to trigger the scheduler instead of setInterval
  if (!isVercel) {
    setInterval(runScheduler, SCHEDULER_INTERVAL);
    runScheduler(); // Initial run
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  }

export default app;
