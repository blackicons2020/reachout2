const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://reachout2.onrender.com';

export const apiService = {
  async checkHealth() {
    try {
      const response = await fetch(`${API_URL}/api/health`);
      return await response.json();
    } catch (error) {
      console.error('API Health Check failed:', error);
      throw error;
    }
  },

  async triggerCampaign(orgId: string, campaignId: string) {
    try {
      const response = await fetch(`${API_URL}/api/outreach/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, campaignId }),
      });
      return await response.json();
    } catch (error) {
      console.error('Trigger Campaign failed:', error);
      throw error;
    }
  },

  async verifyPaystack(reference: string) {
    try {
      const response = await fetch(`${API_URL}/api/billing/verify-paystack/${reference}`);
      return await response.json();
    } catch (error) {
      console.error('Paystack verification failed:', error);
      throw error;
    }
  }
};
