import React, { useState } from 'react';
import { X, Send, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { outreachService } from '@/services/outreachService';
import { useAuth } from '@/hooks/useAuth';

interface MessageModalProps {
  contact: {
    id?: string;
    _id?: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function MessageModal({ contact, onClose, onSuccess }: MessageModalProps) {
  const { organization } = useAuth();
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'sms' | 'whatsapp'>('sms');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    const twilio = organization?.settings?.twilio;
    if (!twilio?.accountSid || !twilio?.authToken || !twilio?.smsFromNumber) {
      setError('Twilio is not configured. Please go to Settings > API Integrations.');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      await outreachService.sendSMS({
        phoneNumber: contact.phone,
        message,
        apiKey: twilio.authToken,
        accountSid: twilio.accountSid,
        fromNumber: type === 'whatsapp' ? twilio.whatsappFromNumber : twilio.smsFromNumber
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border dark:border-gray-800">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-950">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Send Message</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">To: {contact.firstName} {contact.lastName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex gap-2">
            <button 
              onClick={() => setType('sms')}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                type === 'sms' ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-gray-950 text-gray-500 border-gray-200 dark:border-gray-800"
              )}
            >
              SMS
            </button>
            <button 
              onClick={() => setType('whatsapp')}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                type === 'whatsapp' ? "bg-green-600 text-white border-green-600" : "bg-white dark:bg-gray-950 text-gray-500 border-gray-200 dark:border-gray-800"
              )}
            >
              WhatsApp
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Message Content</label>
            <textarea 
              className="w-full h-32 p-4 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm dark:text-white"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-start gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSend}
            disabled={isSending || !message.trim()}
            className="px-6 py-2 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-50 flex items-center gap-2"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{isSending ? 'Sending...' : 'Send Message'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
