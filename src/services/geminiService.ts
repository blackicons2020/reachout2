import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const geminiService = {
  async generateCampaignMessage(campaignName: string, channelType: string, organizationType: string = 'business', context: string = '') {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn('GEMINI_API_KEY is missing. Returning mock message.');
      return `[AI Mock] This is a sample ${channelType} message for "${campaignName}". Please configure your API key to use real AI generation.`;
    }

    try {
      const prompt = `
        You are an expert campaign manager for a ${organizationType.toUpperCase()} organization.
        Generate a highly engaging and effective ${channelType.toUpperCase()} message for a campaign named "${campaignName}".
        ${context ? `Additional Context: ${context}` : ''}
        
        Industry Specific Tone:
        ${organizationType === 'religious' ? '- Spiritual, uplifting, community-focused, and inviting. Use words like "Blessings", "Join us", "Spiritual growth".' : 
          organizationType === 'political' ? '- Mobilizing, urgent, patriotic, and clear. Focus on "Vision", "Future", "Vote", "Support", "Change".' : 
          organizationType === 'education' ? '- Informative, professional, student-centric, and helpful.' : 
          ' - Engaging, professional, and brand-focused.'}

        Guidelines:
        - Keep it concise and professional yet friendly.
        - For SMS: Keep it under 160 characters if possible.
        - For WhatsApp: Use formatting like *bold* for emphasis.
        - For AI Voice: Write a natural-sounding script for an AI caller.
        - Use {{first_name}} as a placeholder for the recipient's name.
        - Do not include any other placeholders unless specified.
        - Return ONLY the message content.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      return response.text?.trim() || '';
    } catch (error) {
      console.error('Gemini Error:', error);
      return `[AI Error] Failed to generate message. Please check your connection.`;
    }
  },

  async generateAutonomousResponse(incomingMessage: string, campaignContext: string) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return "Thank you for your message. We have received it and will get back to you shortly.";
    }

    try {
      const prompt = `
        You are an autonomous assistant for an organization.
        A contact replied to our campaign with: "${incomingMessage}"
        The original campaign context was: "${campaignContext}"
        
        Generate a helpful, polite, and intelligent response to this message.
        If they are asking a question, try to answer it generally or tell them someone will follow up.
        If they are confirming something, acknowledge it warmly.
        If they are opting out, acknowledge it professionally.
        
        Return ONLY the response message.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      return response.text?.trim() || '';
    } catch (error) {
      console.error('Gemini Error:', error);
      return "Thank you for your message. We have received it and will get back to you shortly.";
    }
  }
};
