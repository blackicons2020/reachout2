import mongoose from 'mongoose';
import { GoogleGenAI } from "@google/genai";

// Note: These models are defined in server.ts. 
// In a real project, they should be in separate files.
// For now, I will assume they are accessible if I import them or if this file is imported by server.ts
// However, since server.ts is the main entry point, I might need to export these functions 
// and pass the models to them.

export const assignmentEngine = (models: any, ai: any) => {
  const { Contact, Member, Assignment, Organization } = models;

  const assignContactsToMembers = async (tenantId: string) => {
    try {
      const org = await Organization.findById(tenantId);
      const members = await Member.find({ tenantId, role: { $ne: 'owner' } }); // Exclude owner from auto-assignment if needed
      const unassignedContacts = await Contact.find({ orgId: tenantId, assignedTo: { $exists: false } });

      if (members.length === 0 || unassignedContacts.length === 0) return;

      // Organization-specific logic
      const orgType = org.type; // religious, political, etc.

      // Smart prioritization using AI
      const prioritizedContacts = await prioritizeContacts(unassignedContacts, org);

      // Distribution logic
      let memberIndex = 0;
      for (const contact of prioritizedContacts) {
        const member = members[memberIndex];
        
        // Check if member is suitable (e.g. region match)
        // For simplicity, we use round-robin but biased by suitability if possible
        
        await Contact.findByIdAndUpdate(contact._id, { assignedTo: member._id });
        await new Assignment({
          tenantId,
          contactId: contact._id,
          assignedTo: member._id,
          priority: contact.priority || 'medium',
          status: 'pending'
        }).save();

        // Update member stats
        await Member.findByIdAndUpdate(member._id, { $inc: { totalAssignedContacts: 1 } });

        memberIndex = (memberIndex + 1) % members.length;
      }

      return { success: true, count: unassignedContacts.length };
    } catch (error) {
      console.error('[Assignment Engine] Error:', error);
      throw error;
    }
  };

  const rebalanceAssignments = async (tenantId: string) => {
    // Logic to move contacts from overloaded members to underloaded ones
    const members = await Member.find({ tenantId }).sort({ totalAssignedContacts: 1 });
    // ... implementation ...
  };

  const prioritizeContacts = async (contacts: any[], org: any) => {
    // AI-powered prioritization
    const prompt = `Rank these contacts for outreach for a ${org.type} organization called "${org.name}".
    Criteria: Likelihood to respond, urgency based on history, and ${org.type === 'religious' ? 'first-time visitor status' : org.type === 'political' ? 'ward location' : 'engagement history'}.
    
    Contacts: ${JSON.stringify(contacts.map(c => ({ id: c._id, name: `${c.firstName} ${c.lastName}`, city: c.city, score: c.engagementScore })))}
    
    Return a JSON array of contact IDs in priority order.`;

    try {
      const result = await ai.models.generateContent({ model: "gemini-1.5-flash", contents: prompt });
      const responseText = result.text?.trim() || "[]";
      const orderedIds = JSON.parse(responseText.substring(responseText.indexOf('['), responseText.lastIndexOf(']') + 1));
      
      return contacts.sort((a, b) => {
        const indexA = orderedIds.indexOf(a._id.toString());
        const indexB = orderedIds.indexOf(b._id.toString());
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    } catch (error) {
      console.error('[AI Prioritization] Error:', error);
      return contacts; // Fallback to original order
    }
  };

  const decideHumanFollowUp = async (contact: any, org: any) => {
    const prompt = `Decide if this contact for a ${org.type} organization needs human follow-up.
    Contact: ${JSON.stringify(contact)}
    Previous interactions: ${JSON.stringify(contact.followUpHistory)}
    
    Return a JSON object: { 
      shouldAssign: boolean, 
      urgencyLevel: 'high'|'medium'|'low', 
      suggestedCallScript: string, 
      reason: string 
    }`;

    try {
      const result = await ai.models.generateContent({ model: "gemini-1.5-flash", contents: prompt });
      return JSON.parse(result.text?.trim() || "{}");
    } catch (error) {
      console.error('[AI Coordination] Error:', error);
      return { shouldAssign: true, urgencyLevel: 'medium', suggestedCallScript: 'Hello, how are you today?' };
    }
  };

  const getAIAlerts = async (tenantId: string) => {
    const overdueFollowUps = await Contact.countDocuments({ orgId: tenantId, followUpStatus: 'follow_up_later' });
    const uncalledContacts = await Contact.countDocuments({ orgId: tenantId, followUpStatus: 'not_called' });
    
    const alerts = [];
    if (uncalledContacts > 0) alerts.push({ message: `${uncalledContacts} contacts still need follow-up`, type: 'urgent' });
    if (overdueFollowUps > 0) alerts.push({ message: `${overdueFollowUps} contacts are past their follow-up date`, type: 'warning' });
    
    return alerts;
  };

  return {
    assignContactsToMembers,
    rebalanceAssignments,
    prioritizeContacts,
    decideHumanFollowUp,
    getAIAlerts
  };
};
