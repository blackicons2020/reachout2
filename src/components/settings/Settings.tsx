import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { 
  Settings as SettingsIcon, 
  Building2, 
  Key, 
  Bell, 
  Shield, 
  Globe, 
  Clock, 
  Check, 
  Save,
  MessageSquare,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Info,
  CreditCard,
  Mail,
  Lock,
  Smartphone,
  LogOut,
  Trash2,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { outreachService } from '@/services/outreachService';

export function Settings() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'integrations' | 'notifications' | 'security'>('profile');
  const [editingIntegration, setEditingIntegration] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [orgSettings, setOrgSettings] = useState<any>({
    profile: { name: '', industry: 'Religious Organization', countryCode: '+234', timezone: '(GMT+01:00) Lagos' },
    twilio: { accountSid: '', authToken: '', smsFromNumber: '', whatsappFromNumber: '' },
    whatsapp: { apiKey: '', phoneNumberId: '' },
    email: { apiKey: '', fromEmail: '', fromName: '' },
    voice: { provider: 'elevenlabs', apiKey: '', phoneNumberId: '', elevenLabsKey: '', agentId: '', usePlatformDefault: false },
    notifications: {
      email: {
        campaignSuccess: true,
        billingAlerts: true,
        securityAlerts: true,
        newsletter: false
      },
      push: {
        all: true,
        campaignStatus: true
      },
      whatsappNotifications: false
    },
    security: {
      twoFactorEnabled: false,
      loginAlerts: true,
      dataSharing: true
    }
  });

  useEffect(() => {
    if (profile?.orgId) {
      const unsub = onSnapshot(doc(db, 'organizations', profile.orgId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setOrgSettings(prev => ({
            ...prev,
            ...data.settings,
            profile: {
              ...prev.profile,
              name: data.name || prev.profile.name,
              ...data.settings?.profile
            }
          }));
        }
      });
      return () => unsub();
    }
  }, [profile]);

  const handleSaveSettings = async () => {
    if (!profile?.orgId) return;

    try {
      await setDoc(doc(db, 'organizations', profile.orgId), {
        name: orgSettings.profile.name,
        settings: orgSettings,
        logo: orgSettings.profile.logo,
        updatedAt: Date.now()
      }, { merge: true });
      setNotification({ type: 'success', message: 'Settings saved successfully!' });
      setEditingIntegration(null);
      setTimeout(() => setNotification(null), 3000);
    } catch (error: any) {
      setNotification({ type: 'error', message: `Failed to save: ${error.message}` });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateIntegration('profile', { logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateIntegration = (key: string, value: any) => {
    setOrgSettings({ ...orgSettings, [key]: { ...orgSettings[key], ...value } });
  };

  const tabs = [
    { id: 'profile', name: 'Organization Profile', icon: Building2 },
    { id: 'integrations', name: 'API Integrations', icon: Key },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security & Access', icon: Shield },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your organization's configuration and integrations.</p>
        </div>
        <div className="flex items-center gap-4">
          {notification && (
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2",
              notification.type === 'success' ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
            )}>
              {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {notification.message}
            </div>
          )}
          <button 
            onClick={handleSaveSettings}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                activeTab === tab.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-none" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-8">
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
              <div className="flex items-center gap-6">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-950 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-800 flex flex-col items-center justify-center gap-1 text-gray-400 group-hover:border-blue-300 group-hover:text-blue-500 transition-all overflow-hidden">
                    {orgSettings.profile?.logo ? (
                      <img src={orgSettings.profile.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Building2 className="w-8 h-8" />
                        <span className="text-[10px] font-bold uppercase">Upload</span>
                      </>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold uppercase tracking-wider">Change</span>
                  </div>
                  <input 
                    id="logo-upload"
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Organization Identity</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">This will be shown on your dashboard and campaign reports.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Organization Name</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={orgSettings.profile?.name || ''}
                    onChange={(e) => updateIntegration('profile', { name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Industry</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={orgSettings.profile?.industry || ''}
                    onChange={(e) => updateIntegration('profile', { industry: e.target.value })}
                  >
                    <option className="bg-white dark:bg-gray-900">Religious Organization</option>
                    <option className="bg-white dark:bg-gray-900">Non-Profit / NGO</option>
                    <option className="bg-white dark:bg-gray-900">Education</option>
                    <option className="bg-white dark:bg-gray-900">Business</option>
                    <option className="bg-white dark:bg-gray-900">Political Campaign</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Default Country Code</label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="text"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={orgSettings.profile?.countryCode || ''}
                      onChange={(e) => updateIntegration('profile', { countryCode: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timezone</label>
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <select 
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={orgSettings.profile?.timezone || ''}
                      onChange={(e) => updateIntegration('profile', { timezone: e.target.value })}
                    >
                      <option className="bg-white dark:bg-gray-900">(GMT+01:00) Lagos</option>
                      <option className="bg-white dark:bg-gray-900">(GMT+00:00) London</option>
                      <option className="bg-white dark:bg-gray-900">(GMT-05:00) New York</option>
                    </select>
                  </div>
                </div>
                <div className="md:col-span-2 p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">Sender Branding</h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Configure how your organization name appears in outgoing messages.</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-3 bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800">
                      <input 
                        type="checkbox"
                        id="autoBranding"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={orgSettings.profile?.autoBranding ?? true}
                        onChange={(e) => updateIntegration('profile', { autoBranding: e.target.checked })}
                      />
                      <div className="flex flex-col">
                        <label htmlFor="autoBranding" className="text-xs font-bold text-gray-700 dark:text-gray-300">Auto-include Organization Name</label>
                        <p className="text-[9px] text-gray-500">Prefixes every SMS/WhatsApp message with your Brand Name (e.g. "[ABC Corp]: ...")</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Brand Name (as it appears in messages)</label>
                      <input 
                        type="text"
                        placeholder="e.g. GBC Lagos"
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                        value={orgSettings.profile?.brandName || ''}
                        onChange={(e) => updateIntegration('profile', { brandName: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">SaaS Integration Hub</h2>
                    <p className="text-blue-100 text-sm">Configure how your organization connects to communication providers.</p>
                  </div>
                </div>
              </div>

              {editingIntegration ? (
                <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-8 animate-in slide-in-from-right-4 duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setEditingIntegration(null)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                      >
                        <ArrowRight className="w-5 h-5 text-gray-400 rotate-180" />
                      </button>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Configure {editingIntegration}</h3>
                    </div>
                  </div>

                  {editingIntegration === 'Twilio' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account SID</label>
                        <input 
                          type="text"
                          placeholder="AC..."
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={orgSettings.twilio.accountSid}
                          onChange={(e) => updateIntegration('twilio', { accountSid: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Auth Token</label>
                        <input 
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={orgSettings.twilio.authToken}
                          onChange={(e) => updateIntegration('twilio', { authToken: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">SMS From Number</label>
                        <input 
                          type="text"
                          placeholder="+1234567890"
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={orgSettings.twilio.smsFromNumber}
                          onChange={(e) => updateIntegration('twilio', { smsFromNumber: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">WhatsApp From Number</label>
                        <input 
                          type="text"
                          placeholder="+14155238886"
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={orgSettings.twilio.whatsappFromNumber}
                          onChange={(e) => updateIntegration('twilio', { whatsappFromNumber: e.target.value })}
                        />
                        <p className="text-[10px] text-gray-400 italic">Use +14155238886 for Sandbox testing</p>
                      </div>
                      <div className="col-span-2">
                        <button 
                          onClick={async () => {
                            if (!orgSettings.twilio.accountSid || !orgSettings.twilio.authToken) {
                              setNotification({ type: 'error', message: 'Please enter Account SID and Auth Token first.' });
                              return;
                            }
                            try {
                              const data = await outreachService.testTwilioConnection(orgSettings.twilio.accountSid, orgSettings.twilio.authToken);
                              setNotification({ type: 'success', message: `Twilio Connected! Account: ${data.friendlyName}` });
                            } catch (error: any) {
                              setNotification({ type: 'error', message: `Twilio Connection failed: ${error.message}` });
                            }
                            setTimeout(() => setNotification(null), 5000);
                          }}
                          className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl text-xs hover:bg-blue-100 transition-all border border-blue-100"
                        >
                          Test Twilio Connection
                        </button>
                      </div>
                    </div>
                  )}

/*
                  {editingIntegration === 'Resend' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">
                      <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">API Key</label>
                        <input 
                          type="password"
                          placeholder="re_..."
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={orgSettings.email?.apiKey || ''}
                          onChange={(e) => updateIntegration('email', { apiKey: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">From Email</label>
                        <input 
                          type="email"
                          placeholder="info@yourdomain.com"
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={orgSettings.email?.fromEmail || ''}
                          onChange={(e) => updateIntegration('email', { fromEmail: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sender Name</label>
                        <input 
                          type="text"
                          placeholder="Your Brand"
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={orgSettings.email?.fromName || ''}
                          onChange={(e) => updateIntegration('email', { fromName: e.target.value })}
                        />
                      </div>
                      <div className="col-span-2 p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl flex items-start gap-3">
                        <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-orange-900 dark:text-orange-200">Domain Verification Required</p>
                          <p className="text-[10px] text-orange-800 dark:text-orange-300">Ensure your domain is verified in your <a href="https://resend.com/domains" target="_blank" className="underline font-black">Resend Dashboard</a> before sending emails from a custom domain.</p>
                        </div>
                      </div>
                    </div>
                  )}
*/

                  {editingIntegration === 'WhatsApp Business API' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">API Key / Access Token</label>
                        <input 
                          type="password"
                          placeholder="EA..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={orgSettings.whatsapp.apiKey}
                          onChange={(e) => updateIntegration('whatsapp', { apiKey: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number ID</label>
                        <input 
                          type="text"
                          placeholder="123456789..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={orgSettings.whatsapp.phoneNumberId}
                          onChange={(e) => updateIntegration('whatsapp', { phoneNumberId: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* {editingIntegration === 'Bland.ai' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      ... (commented out)
                    </div>
                  )} */}

                  {/* {editingIntegration === 'ElevenLabs' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      ... (commented out)
                    </div>
                  )} */}

                  {/* {editingIntegration === 'Vapi' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      ... (commented out)
                    </div>
                  )} */}

                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setEditingIntegration(null)}
                      className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all bg-white dark:bg-gray-900"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveSettings}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {[
                    { 
                      name: 'Twilio', 
                      description: 'Connect your Twilio account for SMS and WhatsApp.', 
                      icon: MessageSquare, 
                      color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
                      connected: !!orgSettings.twilio.accountSid && !!orgSettings.twilio.authToken && (!!orgSettings.twilio.smsFromNumber || !!orgSettings.twilio.whatsappFromNumber)
                    },
                    { 
                      name: 'WhatsApp Business API', 
                      description: 'Direct integration with Meta for official business messaging.', 
                      icon: MessageSquare, 
                      color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
                      connected: !!orgSettings.whatsapp.apiKey
                    },
/*
                    { 
                      name: 'Resend', 
                      description: 'Professional email outreach using Resend API.', 
                      icon: Mail, 
                      color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
                      connected: !!orgSettings.email?.apiKey && !!orgSettings.email?.fromEmail
                    },
*/
                    /* { 
                      name: 'Bland.ai', 
                      description: 'Power your AI Voice campaigns with natural conversations.', 
                      icon: Phone, 
                      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
                      connected: orgSettings.voice.provider === 'bland' && !!orgSettings.voice.apiKey
                    },
                    { 
                      name: 'Vapi', 
                      description: 'Advanced AI voice assistant platform for real-time calls.', 
                      icon: Phone, 
                      color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
                      connected: orgSettings.voice.provider === 'vapi' && !!orgSettings.voice.apiKey
                    },
                    { 
                      name: 'ElevenLabs', 
                      description: 'High-quality AI voices and direct conversational agents.', 
                      icon: Globe, 
                      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
                      connected: (orgSettings.voice.provider === 'elevenlabs' && !!orgSettings.voice.apiKey) || !!orgSettings.voice.elevenLabsKey
                    }, */
                  ].map((integration) => (
                    <div key={integration.name} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className={cn("p-4 rounded-2xl", integration.color)}>
                          <integration.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{integration.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {integration.connected ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-bold">
                            <Check className="w-4 h-4" />
                            <span>Connected</span>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setEditingIntegration(integration.name)}
                            className="px-6 py-2 bg-gray-900 dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors text-sm shadow-lg dark:shadow-none"
                          >
                            Connect
                          </button>
                        )}
                        <button 
                          onClick={() => setEditingIntegration(integration.name)}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Notification Preferences</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage how you receive updates and alerts.</p>
                </div>
              </div>

              <div className="space-y-6">
/*
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Notifications
                  </h4>
                  <div className="space-y-3">
                    {[
                      { id: 'campaignSuccess', label: 'Campaign Success Alerts', description: 'Get notified when a campaign completes successfully.', key: 'campaignSuccess' },
                      { id: 'billingAlerts', label: 'Billing & Subscriptions', description: 'Important updates regarding your invoices and plan.', key: 'billingAlerts' },
                      { id: 'securityAlerts', label: 'Security Alerts', description: 'Notifications about new logins and security changes.', key: 'securityAlerts' },
                      { id: 'newsletter', label: 'Product Updates', description: 'Monthly newsletter with new features and tips.', key: 'newsletter' },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="space-y-1">
                          <label htmlFor={item.id} className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</label>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            id={item.id}
                            className="sr-only peer"
                            checked={orgSettings.notifications.email[item.key as keyof typeof orgSettings.notifications.email]}
                            onChange={(e) => {
                              const newEmail = { ...orgSettings.notifications.email, [item.key]: e.target.checked };
                              updateIntegration('notifications', { email: newEmail });
                            }}
                          />
                          <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
*/

                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Mobile & Chat
                  </h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="space-y-1">
                      <label htmlFor="whatsappNotif" className="text-sm font-bold text-gray-900 dark:text-white">WhatsApp Notifications</label>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Receive campaign summaries directly on WhatsApp.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        id="whatsappNotif"
                        className="sr-only peer"
                        checked={orgSettings.notifications.whatsappNotifications}
                        onChange={(e) => updateIntegration('notifications', { whatsappNotifications: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Security & Access Control</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage account security and access protocols.</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Account Security
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h5 className="text-sm font-bold text-gray-900 dark:text-white">Two-Factor Authentication</h5>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">Add an extra layer of security to your account.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={orgSettings.security.twoFactorEnabled}
                            onChange={(e) => {
                              const newSec = { ...orgSettings.security, twoFactorEnabled: e.target.checked };
                              updateIntegration('security', { security: newSec });
                            }}
                          />
                          <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h5 className="text-sm font-bold text-gray-900 dark:text-white">Login Alerts</h5>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">Receive an email whenever someone logs into your account.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={orgSettings.security.loginAlerts}
                            onChange={(e) => {
                              const newSec = { ...orgSettings.security, loginAlerts: e.target.checked };
                              updateIntegration('security', { security: newSec });
                            }}
                          />
                          <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Active Sessions
                  </h4>
                  <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="p-4 flex items-center justify-between bg-blue-50/30 dark:bg-blue-900/10">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">Current Session (MacBook Pro)</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">Lagos, Nigeria • Chrome • IP: 102.89.x.x</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded uppercase">Active Now</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-sm font-bold text-red-600 uppercase tracking-wider flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Danger Zone
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-left group">
                      <div className="space-y-1">
                        <h5 className="text-sm font-bold text-gray-900 dark:text-white">Export Data</h5>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Download a full archive of your organization data.</p>
                      </div>
                      <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </button>
                    <button className="flex items-center justify-between p-4 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-left group">
                      <div className="space-y-1">
                        <h5 className="text-sm font-bold text-red-600">Delete Organization</h5>
                        <p className="text-[10px] text-red-500/70">Permanently remove all data and campaigns.</p>
                      </div>
                      <Trash2 className="w-5 h-5 text-red-400 group-hover:text-red-600 transition-colors" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
