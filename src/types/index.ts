export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'superadmin';

export interface Organization {
  id: string;
  name: string;
  logo?: string;
  industry?: string;
  country?: string;
  defaultCountryCode: string;
  ownerId: string;
  type: 'religious' | 'political' | 'nonprofit' | 'business' | 'education' | 'others';
  plan: 'starter' | 'growth' | 'pro';
  settings: {
    twilio?: {
      accountSid: string;
      authToken: string;
      fromNumber: string;
    };
    whatsapp?: {
      apiKey: string;
      phoneNumberId: string;
    };
    voice?: {
      provider: 'bland' | 'vapi';
      apiKey: string;
    };
    email?: {
      apiKey: string;
      fromEmail: string;
      fromName: string;
    };
  };
  createdAt: number;
}

export interface UserProfile {
  id: string;
  email: string;
  orgId: string | null;
  role: UserRole;
  displayName?: string;
  photoURL?: string;
  setupCompleted?: boolean;
}

export interface Contact {
  id: string;
  orgId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  city?: string;
  state?: string;
  tags: string[];
  groups: string[];
  customFields: Record<string, any>;
  notes?: string;
  createdAt: number;
  lastContactedAt?: number;
  status?: 'active' | 'inactive' | 'lead' | 'customer' | 'engaged' | 'cold' | 'converted';
  engagementScore?: number;

  // Organization specific fields
  location?: string;
  lga?: string;
  ward?: string;
  outreachDate?: string;
  source?: string;
  prayerRequests?: string;
  attendanceStatus?: string;

  pollingUnit?: string;
  votingInterest?: string;
  participationHistory?: string;

  occupation?: string;
  community?: string;
  feedbackHistory?: string;

  customerType?: string;
  lastInteraction?: string;
  purchaseHistory?: string;

  department?: string;
  level?: string;
  faculty?: string;
  guardianContact?: string;
  performanceCategory?: string;
}

export interface Campaign {
  id: string;
  orgId: string;
  type: 'sms' | 'whatsapp' | 'voice' | 'email';
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  name: string;
  message: string;
  targetGroups: string[];
  targetTags: string[];
  scheduleAt?: number;
  scheduleTimes?: string[];
  lastRunAt?: number;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: number[]; // 0-6
    dayOfMonth?: number;
    nextRunAt: number;
  };
  stats: {
    total: number;
    sent: number;
    delivered: number;
    failed: number;
    read?: number;
    replied?: number;
    answered?: number;
    voicemail?: number;
    duration?: number;
  };
  createdAt: number;
}

export interface Interaction {
  id: string;
  contactId: string;
  campaignId: string;
  orgId: string;
  type: 'sms' | 'whatsapp' | 'voice' | 'email';
  status: 'sent' | 'delivered' | 'failed' | 'read' | 'replied' | 'answered' | 'no-answer' | 'voicemail' | 'opened' | 'clicked';
  timestamp: number;
  content?: string;
  recordingUrl?: string;
  transcript?: string;
}
