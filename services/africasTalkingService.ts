import AfricasTalking from 'africastalking';

export const createATClient = (username: string, apiKey: string) => {
  return AfricasTalking({
    username: username || 'sandbox',
    apiKey: apiKey
  });
};

export const sendATSMS = async ({ username, apiKey, to, message, from }: any) => {
  try {
    const at = createATClient(username, apiKey);
    const sms = at.SMS;
    const result = await sms.send({
      to: [to],
      message: message,
      from: from || undefined
    });
    console.log('[AT SMS] Success:', result);
    return true;
  } catch (error) {
    console.error('[AT SMS] Error:', error);
    return false;
  }
};

export const sendATWhatsApp = async ({ username, apiKey, to, message, from }: any) => {
  // Note: AT uses the same SMS SDK for WhatsApp but with a different channel configuration 
  // or via their Content API. For now, we'll implement it via their standard Messaging API.
  try {
    const at = createATClient(username, apiKey);
    // Africa's Talking WhatsApp is often handled through their Messaging/SMS API with specific channel params
    // or via a dedicated WhatsApp channel. 
    const result = await at.SMS.send({
      to: [to],
      message: message,
      from: from || undefined // This would be the WhatsApp channel/number
    });
    console.log('[AT WhatsApp] Success:', result);
    return true;
  } catch (error) {
    console.error('[AT WhatsApp] Error:', error);
    return false;
  }
};

export const makeATCall = async ({ username, apiKey, from, to }: any) => {
  try {
    const at = createATClient(username, apiKey);
    const voice = at.VOICE;
    const result = await voice.call({
      callFrom: from,
      callTo: [to]
    });
    console.log('[AT Voice] Success:', result);
    return true;
  } catch (error) {
    console.error('[AT Voice] Error:', error);
    return false;
  }
};
