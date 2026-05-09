import api from '../lib/api';
import { Member, CallLog, Activity } from '../types';

const API_URL = '/team';

export const teamService = {
  getMembers: async (): Promise<Member[]> => {
    const response = await api.get(`${API_URL}/members`);
    return response.data;
  },

  inviteMember: async (data: { 
    name: string; 
    email: string; 
    phone: string; 
    role: string; 
    department?: string; 
    regions?: string[] 
  }) => {
    const response = await api.post(`${API_URL}/invite`, data);
    return response.data;
  },

  assignContacts: async () => {
    const response = await api.post(`${API_URL}/assign`, {});
    return response.data;
  },

  logCall: async (data: {
    contactId: string;
    outcome: string;
    notes: string;
    nextFollowUpDate?: number;
  }): Promise<CallLog> => {
    const response = await api.post(`${API_URL}/call-log`, data);
    return response.data;
  },

  getActivities: async (): Promise<Activity[]> => {
    const response = await api.get(`${API_URL}/activities`);
    return response.data;
  },

  getPerformance: async (): Promise<Member[]> => {
    const response = await api.get(`${API_URL}/performance`);
    return response.data;
  }
};
