import twilio from 'twilio';

export const makeTwilioCall = async (config: any, memberPhone: string, contactPhone: string, orgId: string, contactId: string) => {
  const client = twilio(config.accountSid, config.authToken);
  
  // The bridge works by calling the member first
  // When member answers, Twilio executes the TwiML to call the contact
  const bridgeUrl = `${process.env.APP_URL || 'http://localhost:5173'}/api/voice/bridge?contactPhone=${encodeURIComponent(contactPhone)}&orgId=${orgId}&contactId=${contactId}`;

  const call = await client.calls.create({
    url: bridgeUrl,
    to: memberPhone,
    from: config.voiceFromNumber || config.smsFromNumber,
    record: true, // Enable recording for AI analysis
    statusCallback: `${process.env.APP_URL || 'http://localhost:5173'}/api/voice/callback`,
    statusCallbackEvent: ['completed'],
  });

  return call.sid;
};
