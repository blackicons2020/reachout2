
export interface CallConfig {
  phoneNumber: string;
  customerName?: string;
  task: string;
  voice?: string;
  voiceProvider?: string;
  apiKey: string;
  elevenLabsKey?: string;
  agentId?: string;
  phoneNumberId?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
}

export interface MessageConfig {
  phoneNumber: string;
  message: string;
  apiKey: string;
  accountSid?: string;
  fromNumber?: string;
}

export const outreachService = {
  async testElevenLabsConnection(apiKey: string) {
    const response = await fetch('https://api.elevenlabs.io/v1/convai/agents', {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `ElevenLabs Error: ${response.status}`);
    }
    return await response.json();
  },

  async testTwilioConnection(accountSid: string, authToken: string) {
    try {
      const response = await fetch('/api/outreach/test-twilio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountSid, authToken }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Server returned non-JSON response:', text);
        throw new Error('The server returned an invalid response. Please try again in a few seconds while the backend restarts.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Twilio Error: ${response.status}`);
      }
      return data;
    } catch (error: any) {
      console.error('Twilio Test Fetch Error:', error);
      throw new Error(error.message || 'Failed to connect to backend server');
    }
  },

  async triggerVoiceCall(config: CallConfig) {
    if (!config.apiKey && config.voiceProvider !== 'elevenlabs') {
      throw new Error(`The ${config.voiceProvider === 'vapi' ? 'Vapi' : 'Bland AI'} API Key is not configured for this organization. Please go to Settings > Integrations to set it up.`);
    }

    if (config.voiceProvider === 'elevenlabs' && !config.elevenLabsKey && !config.apiKey) {
      throw new Error("ElevenLabs API Key is missing. Please configure it in Settings > Integrations.");
    }

    // Ensure phone number is in E.164 format
    let formattedPhone = config.phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      throw new Error(`Phone number ${formattedPhone} must start with '+' and include country code (e.g., +234...).`);
    }

    try {
      if (config.voiceProvider === 'vapi') {
        const vapiBody: any = {
          customer: {
            number: formattedPhone,
            name: config.customerName || "Customer"
          },
          assistant: {
            firstMessage: config.task.split('.')[0] + ".",
            firstMessageMode: "assistant-speaks-first",
            transcriber: {
              provider: "deepgram",
              model: "nova-2",
              language: "en-US"
            },
            model: {
              provider: "openai",
              model: "gpt-4",
              messages: [{ role: "system", content: config.task }]
            },
            voice: {
              provider: "11labs",
              voiceId: config.voice && config.voice.startsWith('eleven_') ? "EXAVITQu4vr4xnSDxXjL" : (config.voice || "EXAVITQu4vr4xnSDxXjL")
            }
          }
        };

        // Add ElevenLabs API Key if provided in settings
        if (config.elevenLabsKey) {
          vapiBody.assistant.voice.apiKey = config.elevenLabsKey;
        }

        if (config.phoneNumberId) {
          const cleanId = config.phoneNumberId.trim();
          
          // Check if it's a UUID (Vapi Phone Number ID)
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
          
          if (isUuid) {
            vapiBody.phoneNumberId = cleanId;
          } else if (cleanId.startsWith('+') || /^\d{10,15}$/.test(cleanId)) {
            const finalNumber = cleanId.startsWith('+') ? cleanId : `+${cleanId}`;
            
            // If it's a phone number, Vapi expects Twilio credentials for BYOT
            if (config.twilioAccountSid && config.twilioAuthToken) {
              vapiBody.phoneNumber = {
                twilioPhoneNumber: finalNumber,
                twilioAccountSid: config.twilioAccountSid,
                twilioAuthToken: config.twilioAuthToken
              };
            } else {
              throw new Error("To use a literal phone number with Vapi, you must also provide Twilio credentials. Otherwise, please use the Vapi Phone Number ID (UUID) from your Vapi dashboard.");
            }
          } else {
            // Fallback: try as phoneNumberId if it's not a number but not a standard UUID either
            vapiBody.phoneNumberId = cleanId;
          }
        }

        const response = await fetch('https://api.vapi.ai/call', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(vapiBody),
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Vapi Error Data:', errorData);
          throw new Error(errorData.message || `Vapi Error: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        console.log('Vapi Call Triggered Successfully:', result.id || result);
        return result;
      } else if (config.voiceProvider === 'elevenlabs') {
        // ElevenLabs Direct Calling (Conversational AI)
        const agentId = config.agentId || config.phoneNumberId || ''; 
        
        if (!agentId || agentId.length < 5) {
          throw new Error("ElevenLabs Agent ID is missing or invalid. Please enter your Agent ID in Settings > Integrations > ElevenLabs.");
        }

        console.log(`Triggering ElevenLabs call to ${formattedPhone} using Agent: ${agentId}`);

        const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}/phone-call`, {
          method: 'POST',
          headers: {
            'xi-api-key': config.elevenLabsKey || config.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone_number: formattedPhone,
          }),
        });

        if (!response.ok) {
          let errorMessage = `ElevenLabs Error: ${response.status}`;
          try {
            const errorData = await response.json();
            console.error('ElevenLabs API Error:', errorData);
            errorMessage = errorData.message || errorData.detail?.message || errorMessage;
          } catch (e) {
            console.error('Could not parse ElevenLabs error response');
          }
          
          if (response.status === 404) {
            throw new Error(`Agent not found (404). Please verify that your Agent ID (${agentId}) is correct and that the agent is "Published" in ElevenLabs.`);
          }
          
          throw new Error(errorMessage);
        }

        return await response.json();
      } else {
        // Bland AI (Default)
        const response = await fetch('https://api.bland.ai/v1/calls', {
          method: 'POST',
          headers: {
            'Authorization': config.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone_number: formattedPhone,
            task: config.task,
            voice: config.voice || 'eleven_bella',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Bland AI Error Data:', errorData);
          throw new Error(errorData.message || `Bland AI Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
      }
    } catch (error) {
      console.error('Voice Call Error:', error);
      throw error;
    }
  },

  async sendSMS(config: MessageConfig) {
    if (!config.apiKey || !config.accountSid || !config.fromNumber) {
      throw new Error('Twilio configuration is incomplete. Please check Settings.');
    }

    // Ensure phone number is in E.164 format
    let formattedPhone = config.phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    try {
      const response = await fetch('/api/outreach/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'sms',
          phoneNumber: formattedPhone,
          message: config.message,
          accountSid: config.accountSid,
          authToken: config.apiKey,
          fromNumber: config.fromNumber
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('The server returned an invalid response. Please try again in a few seconds.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send SMS');
      }

      return data;
    } catch (error: any) {
      console.error('SMS Error:', error);
      throw new Error(error.message || 'Failed to send SMS');
    }
  },

  async sendWhatsApp(config: MessageConfig) {
    if (!config.apiKey || !config.accountSid || !config.fromNumber) {
      throw new Error('WhatsApp configuration is incomplete. Please check Settings.');
    }

    // Ensure phone number is in E.164 format for WhatsApp
    let formattedPhone = config.phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    try {
      const response = await fetch('/api/outreach/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'whatsapp',
          phoneNumber: formattedPhone,
          message: config.message,
          accountSid: config.accountSid,
          authToken: config.apiKey,
          fromNumber: config.fromNumber
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('The server returned an invalid response. Please try again in a few seconds.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send WhatsApp message');
      }

      return data;
    } catch (error: any) {
      console.error('WhatsApp Error:', error);
      throw new Error(error.message || 'Failed to send WhatsApp message');
    }
  },
  
  async sendEmail(config: { email: string, subject: string, body: string, apiKey: string, fromEmail: string, fromName: string }) {
    if (!config.apiKey || !config.fromEmail) {
      throw new Error('Email configuration is incomplete. Please check Settings.');
    }

    try {
      const response = await fetch('/api/outreach/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: config.email,
          subject: config.subject,
          body: config.body,
          apiKey: config.apiKey,
          fromEmail: config.fromEmail,
          fromName: config.fromName
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('The server returned an invalid response. Please try again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send Email');
      }

      return data;
    } catch (error: any) {
      console.error('Email Error:', error);
      throw new Error(error.message || 'Failed to send Email');
    }
  }
};
