import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export const aiService = {
  getTone: (type?: string) => {
    switch (type) {
      case 'religious': return 'warm, welcoming, spiritual, and compassionate';
      case 'political': return 'persuasive, mobilizing, confident, and action-oriented';
      case 'government': return 'informative, professional, trustworthy, and clear';
      case 'business': return 'professional, persuasive, and customer-focused';
      case 'academic': return 'educational, supportive, and professional';
      default: return 'professional and helpful';
    }
  },

  generateMessage: async (orgType: string, purpose: string, context: any) => {
    try {
      const tone = aiService.getTone(orgType);
      const prompt = `You are an AI assistant for a ${orgType} organization. 
      The organization name is "${context.orgName || 'ReachOut'}".
      Tone: ${tone}.
      Purpose: ${purpose}.
      Context: ${JSON.stringify(context.extra || {})}.
      Generate a short, engaging message for ${context.channel || 'SMS'}.
      Return ONLY the message content. No pleasantries or explanation.`;

      const result = await ai.models.generateContent({ model: "gemini-1.5-flash", contents: prompt });
      return result.text?.trim() || "Hello, I'm reaching out to share an update from our organization.";
    } catch (error) {
      console.error('AI Message Generation Error:', error);
      return "Hello, I'm reaching out to share an update from our organization. Let us know if you have any questions.";
    }
  },

  generateFollowUp: async (orgType: string, contact: any, lastMessage: string) => {
    try {
      const tone = aiService.getTone(orgType);
      const prompt = `You are an AI assistant for a ${orgType} organization. 
      Tone: ${tone}.
      Contact: ${contact.firstName} ${contact.lastName}.
      Last message sent: "${lastMessage}".
      The contact hasn't responded yet. Generate a gentle follow-up message.
      Return ONLY the message content.`;

      const result = await ai.models.generateContent({ model: "gemini-1.5-flash", contents: prompt });
      return result.text?.trim() || "Hi, just checking in to see if you received our last message.";
    } catch (error) {
      console.error('AI Follow-up Generation Error:', error);
      return "Hi, just checking in to see if you received our last message. We'd love to hear from you!";
    }
  },

  decideNextAction: (contact: any, orgType: string) => {
    const lastInteractionDays = contact.lastContactedAt ? (Date.now() - contact.lastContactedAt) / (1000 * 60 * 60 * 24) : 999;
    const score = contact.engagementScore || 0;
    const status = contact.status || 'new';

    if (lastInteractionDays < 3) {
      return { 
        shouldSend: false, 
        reason: 'Recently contacted',
        urgency: 'none'
      };
    }

    if (orgType === 'religious') {
      if (status === 'new') return { shouldSend: true, type: 'welcome', urgency: 'high', label: 'Send Welcome Note' };
      if (score < 30) return { shouldSend: true, type: 'care', urgency: 'medium', label: 'Send Prayer Check-in' };
    }

    if (orgType === 'political') {
      if (status === 'engaged') return { shouldSend: true, type: 'volunteer', urgency: 'medium', label: 'Invite to Volunteer' };
      if (lastInteractionDays > 7) return { shouldSend: true, type: 'mobilize', urgency: 'high', label: 'Send Campaign Update' };
    }

    if (score > 70) return { shouldSend: true, type: 'appreciation', urgency: 'low', label: 'Send Thank You' };
    if (lastInteractionDays > 14) return { shouldSend: true, type: 'reengage', urgency: 'medium', label: 'Reconnect' };

    return { 
      shouldSend: true, 
      type: 'update', 
      urgency: 'low',
      label: 'Send General Update'
    };
  },

  suggestBestTime: (contact: any) => {
    // Simulated logic based on interaction history
    return "Tuesday at 10:00 AM";
  },

  analyzeEngagement: (interactions: any[]) => {
    if (!interactions.length) return "Low";
    const responded = interactions.filter(i => i.direction === 'inbound').length;
    const rate = (responded / interactions.length) * 100;
    if (rate > 50) return "High";
    if (rate > 20) return "Medium";
    return "Low";
  }
};
