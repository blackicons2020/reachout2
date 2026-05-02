import React, { useState } from 'react';
import { 
  Send, 
  MessageSquare, 
  Phone, 
  Users, 
  Calendar, 
  Clock, 
  X, 
  Check, 
  AlertCircle,
  Info,
  Sparkles,
  Loader2,
  Mail
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { geminiService } from '../../services/geminiService';

interface CampaignFormProps {
  onSave: (campaign: any) => void;
  onClose: () => void;
  initialData?: any;
  isDuplicating?: boolean;
  availableGroups: string[];
  brandName?: string;
  autoBranding?: boolean;
}

export function CampaignForm({ onSave, onClose, initialData, isDuplicating, availableGroups, brandName, autoBranding = true }: CampaignFormProps) {
  const [type, setType] = useState<'sms' | 'whatsapp' | 'voice' | 'email'>(initialData?.type || 'sms');
  const [name, setName] = useState(isDuplicating ? `Copy of ${initialData?.name}` : (initialData?.name || ''));
  const [message, setMessage] = useState(initialData?.message || '');
  const [targetGroups, setTargetGroups] = useState<string[]>(initialData?.targetGroups || []);
  const [schedule, setSchedule] = useState<'now' | 'future'>(initialData?.scheduleAt ? 'future' : 'now');
  const [voiceId, setVoiceId] = useState(initialData?.voiceId || 'eleven_bella');
  const [voiceProvider, setVoiceProvider] = useState<'bland' | 'vapi' | 'elevenlabs'>(initialData?.voiceProvider || 'elevenlabs');
  
  // Extract date and time from scheduleAt if it exists
  const initialDate = initialData?.scheduleAt ? new Date(initialData.scheduleAt).toISOString().split('T')[0] : '';
  const initialTime = initialData?.scheduleAt ? new Date(initialData.scheduleAt).toTimeString().split(' ')[0].substring(0, 5) : '';
  
  const [scheduleDate, setScheduleDate] = useState(initialDate);
  const [scheduleTime, setScheduleTime] = useState(initialTime || '09:00');
  const [scheduleTimes, setScheduleTimes] = useState<string[]>(initialData?.scheduleTimes || [initialTime || '09:00']);
  const [isRecurring, setIsRecurring] = useState(!!initialData?.recurring);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>(initialData?.recurring?.frequency || 'daily');
  const [interval, setInterval] = useState(initialData?.recurring?.interval || 1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initialData?.recurring?.daysOfWeek || []);
  const [dayOfMonth, setDayOfMonth] = useState(initialData?.recurring?.dayOfMonth || 1);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIGenerate = async () => {
    if (!name) {
      // For now we'll just return, in a real app we'd show a toast
      return;
    }
    setIsGenerating(true);
    try {
      const generated = await geminiService.generateCampaignMessage(name, type);
      setMessage(generated);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const characterCount = message.length;
  const smsCount = Math.ceil(characterCount / 160) || 1;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border dark:border-gray-800">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-950">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {isDuplicating ? 'Resend Campaign' : (initialData ? 'Edit Campaign' : 'Create Campaign')}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Configure your outreach message and audience.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Campaign Type */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Select Channel</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setType('sms')}
                className={cn(
                  "p-3 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all",
                  type === 'sms' ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-sm" : "border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900/40 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", type === 'sms' ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600")}>
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-gray-900 dark:text-white">SMS</span>
              </button>

              <button 
                onClick={() => setType('whatsapp')}
                className={cn(
                  "p-3 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all",
                  type === 'whatsapp' ? "border-green-600 bg-green-50 dark:bg-green-900/20 shadow-sm" : "border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-900/40 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", type === 'whatsapp' ? "bg-green-600 text-white" : "bg-green-50 text-green-600")}>
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-gray-900 dark:text-white">WhatsApp</span>
              </button>

              {/*
              <button 
                onClick={() => setType('email')}
                className={cn(
                  "p-3 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all",
                  type === 'email' ? "border-orange-600 bg-orange-50 dark:bg-orange-900/20 shadow-sm" : "border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-900/40 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", type === 'email' ? "bg-orange-600 text-white" : "bg-orange-50 text-orange-600")}>
                  <Mail className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-gray-900 dark:text-white">Email</span>
              </button>

              <button 
                onClick={() => setType('voice')}
                className={cn(
                  "p-3 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all",
                  type === 'voice' ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-sm" : "border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-900/40 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", type === 'voice' ? "bg-purple-600 text-white" : "bg-purple-50 text-purple-600")}>
                  <Phone className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-gray-900 dark:text-white">AI Voice</span>
              </button>
              */}
            </div>
          </div>

          {/* Campaign Details */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Campaign Name</label>
              <input 
                type="text"
                placeholder="e.g. Sunday Service Reminder"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white dark:placeholder:text-slate-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  {type === 'voice' ? 'Call Script' : /* type === 'email' ? 'Email Body' : */ 'Message Content'}
                </label>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleAIGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-lg border border-blue-100 hover:bg-blue-100 transition-all disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    <span>AI Generate</span>
                  </button>
                  {type === 'sms' && (
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-tighter",
                      characterCount > 160 ? "text-orange-600" : "text-gray-400"
                    )}>
                      {characterCount} chars • {smsCount} SMS
                    </span>
                  )}
                </div>
              </div>
              <textarea 
                className="w-full h-28 p-4 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm dark:text-white dark:placeholder:text-slate-500"
                placeholder={type === 'voice' ? "Write what the AI should say..." : /* type === 'email' ? "Type your email content here..." : */ "Type your message here..."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              {autoBranding && brandName && (
                <div className="flex items-center gap-2 p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/30 rounded-xl">
                  <Info className="w-3.5 h-3.5 text-blue-500" />
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                    <span className="font-bold uppercase">Branding Active:</span> Your message will be sent as: 
                    <span className="italic ml-1">"[{brandName}]: {message || '...'}"</span>
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {['first_name', 'last_name', 'custom_field'].map(token => (
                  <button 
                    key={token}
                    onClick={() => setMessage(prev => prev + ` {{${token}}}`)}
                    className="px-2 py-1 bg-white text-gray-500 text-[10px] font-bold uppercase rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    + {token}
                  </button>
                ))}
              </div>
            </div>

              {/* Voice settings commented out for now
              {type === 'voice' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 rounded-2xl border border-purple-100 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Voice Engine (ElevenLabs)</label>
                    <select 
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-xs font-bold"
                      value={voiceId}
                      onChange={(e) => setVoiceId(e.target.value)}
                    >
                      <option value="EXAVITQu4vr4xnSDxXjL">Bella (Soft & Professional)</option>
                      <option value="ErXw9CuCjhmUUrDuqfQK">Antoni (Friendly & Deep)</option>
                      <option value="21m00Tcm4TlvDq8ikWAM">Rachel (Energetic)</option>
                      <option value="AZnzlk1Xhk9Wf6v3oFbt">Domi (Strong & Clear)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Telephony Provider</label>
                    <select 
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-xs font-bold"
                      value={voiceProvider}
                      onChange={(e) => setVoiceProvider(e.target.value as any)}
                    >
                      <option value="elevenlabs">ElevenLabs Direct (Recommended)</option>
                      <option value="bland">Bland AI</option>
                      <option value="vapi">Vapi</option>
                    </select>
                  </div>
                  <div className="col-span-2 flex flex-col gap-2 p-3 bg-white/50 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-2 text-[10px] text-purple-600 font-bold italic">
                      <Info className="w-3 h-3" />
                      <span>
                        {voiceProvider === 'elevenlabs' 
                          ? "ElevenLabs Direct uses your Conversational Agent ID from Settings." 
                          : "ElevenLabs voices are synced automatically with your selected provider."}
                      </span>
                    </div>
                    {voiceProvider === 'elevenlabs' && (
                      <p className="text-[9px] text-purple-500 leading-tight">
                        Ensure your Twilio number is connected to your ElevenLabs agent for outbound calling to work.
                      </p>
                    )}
                  </div>
                </div>
              )}
              */}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Target Audience</label>
              <div className="flex flex-wrap gap-2">
                {['All Contacts', ...availableGroups].map(group => (
                  <button 
                    key={group}
                    type="button"
                    onClick={() => {
                      if (group === 'All Contacts') {
                        setTargetGroups(['All Contacts']);
                        return;
                      }
                      const newGroups = targetGroups.filter(g => g !== 'All Contacts');
                      if (newGroups.includes(group)) {
                        setTargetGroups(newGroups.filter(g => g !== group));
                      } else {
                        setTargetGroups([...newGroups, group]);
                      }
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                      targetGroups.includes(group) 
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100 dark:shadow-none" 
                        : "bg-white dark:bg-gray-950 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-blue-300"
                    )}
                  >
                    {group}
                  </button>
                ))}
              </div>
              {availableGroups.length === 0 && (
                <p className="text-[10px] text-gray-400 italic">No custom groups found. Add groups to your contacts to see them here.</p>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Scheduling</label>
              <div className="flex gap-3">
                <button 
                  onClick={() => setSchedule('now')}
                  className={cn(
                    "flex-1 p-3 border-2 rounded-2xl flex items-center gap-3 transition-all",
                    schedule === 'now' ? "border-blue-600 bg-blue-50 shadow-sm" : "border-gray-100 hover:border-blue-200 hover:bg-gray-50"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", schedule === 'now' ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600")}>
                    <Send className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-gray-900">Send Now</span>
                </button>
                <button 
                  onClick={() => setSchedule('future')}
                  className={cn(
                    "flex-1 p-3 border-2 rounded-2xl flex items-center gap-3 transition-all",
                    schedule === 'future' ? "border-blue-600 bg-blue-50 shadow-sm" : "border-gray-100 hover:border-blue-200 hover:bg-gray-50"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", schedule === 'future' ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600")}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-gray-900">Schedule</span>
                </button>
              </div>

              {schedule === 'future' && (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Date</label>
                    <input 
                      type="date"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white dark:placeholder:text-slate-500"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Send Time(s)</label>
                    <div className="space-y-2">
                      {scheduleTimes.map((time, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input 
                            type="time"
                            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white dark:placeholder:text-slate-500"
                            value={time}
                            onChange={(e) => {
                              const newTimes = [...scheduleTimes];
                              newTimes[idx] = e.target.value;
                              setScheduleTimes(newTimes);
                            }}
                          />
                          {scheduleTimes.length > 1 && (
                            <button 
                              onClick={() => setScheduleTimes(scheduleTimes.filter((_, i) => i !== idx))}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button 
                        onClick={() => setScheduleTimes([...scheduleTimes, '12:00'])}
                        className="w-full py-2 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-all"
                      >
                        + Add another time
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {schedule === 'future' && (
                <div className="flex items-center gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <input 
                    type="checkbox"
                    id="isRecurring"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                  />
                  <div className="flex flex-col">
                    <label htmlFor="isRecurring" className="text-xs font-bold text-gray-700 select-none">Make this a recurring campaign</label>
                    <p className="text-[10px] text-gray-500">Campaign will run at all selected times on scheduled days.</p>
                  </div>
                </div>
              )}

              {schedule === 'future' && isRecurring && (
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Frequency</label>
                    <select 
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs font-bold dark:text-white"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as any)}
                    >
                      <option value="daily" className="dark:bg-slate-950">Daily</option>
                      <option value="weekly" className="dark:bg-slate-950">Weekly</option>
                      <option value="monthly" className="dark:bg-slate-950">Monthly</option>
                    </select>
                  </div>

                  {(frequency === 'weekly' || frequency === 'monthly') && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">On these days</label>
                      <div className="flex flex-wrap gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                          <button 
                            key={day}
                            type="button"
                            onClick={() => {
                              if (daysOfWeek.includes(idx)) {
                                setDaysOfWeek(daysOfWeek.filter(d => d !== idx));
                              } else {
                                setDaysOfWeek([...daysOfWeek, idx].sort());
                              }
                            }}
                            className={cn(
                              "w-10 h-10 rounded-lg text-xs font-bold border transition-all",
                              daysOfWeek.includes(idx)
                                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100 dark:shadow-none"
                                : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800"
                            )}
                          >
                            {day[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-950">
          <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase">
            <Info className="w-3.5 h-3.5" />
            <span>Est. cost: $0.00</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2.5 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-all border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            >
              Cancel
            </button>
            <button 
              type="button"
              disabled={!name.trim() || !message.trim() || targetGroups.length === 0}
              onClick={() => onSave({ 
                type, 
                name, 
                message, 
                targetGroups, 
                schedule, 
                scheduleDate, 
                scheduleTimes, 
                voiceId: type === 'voice' ? voiceId : undefined, 
                voiceProvider: type === 'voice' ? voiceProvider : undefined,
                recurring: isRecurring ? { frequency, interval: 1, daysOfWeek, dayOfMonth: 1 } : undefined
              })}
              className={cn(
                "px-6 py-2.5 text-white font-bold text-sm rounded-xl transition-all shadow-lg flex items-center gap-2",
                (!name.trim() || !message.trim() || targetGroups.length === 0)
                  ? "bg-gray-300 shadow-none cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-none"
              )}
            >
              <Send className="w-4 h-4" />
              <span>
                {isDuplicating ? 'Resend Now' : (schedule === 'now' ? 'Send Now' : 'Schedule Campaign')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
