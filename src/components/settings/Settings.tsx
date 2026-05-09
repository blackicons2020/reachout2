import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { 
  Building2, 
  Key, 
  Bell, 
  Shield, 
  Globe, 
  Clock, 
  Check, 
  Save,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  LogOut,
  Trash2,
  Download,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { outreachService } from '@/services/outreachService';

export function Settings() {
  const { profile, refreshAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'integrations' | 'notifications' | 'security'>('profile');
  const [editingIntegration, setEditingIntegration] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  
  const [orgSettings, setOrgSettings] = useState<any>({
    profile: { name: '', industry: 'Religious Organization', countryCode: '+234', timezone: '(GMT+01:00) Lagos', logo: '', autoBranding: true, brandName: '' },
    twilio: { accountSid: '', authToken: '', smsFromNumber: '', whatsappFromNumber: '' },
    africasTalking: { username: '', apiKey: '', smsFrom: '', whatsappFrom: '', voiceFrom: '', isSandbox: true },
    whatsapp: { apiKey: '', phoneNumberId: '' },
    email: { apiKey: '', fromEmail: '', fromName: '' },
    voice: { provider: 'elevenlabs', apiKey: '', phoneNumberId: '', elevenLabsKey: '', agentId: '', usePlatformDefault: false },
    notifications: {
      email: { campaignSuccess: true, billingAlerts: true, securityAlerts: true, newsletter: false },
      push: { all: true, campaignStatus: true },
      whatsappNotifications: false
    },
    security: { twoFactorEnabled: false, loginAlerts: true, dataSharing: true }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (profile?.orgId) {
        try {
          const res = await api.get(`/organizations/${profile.orgId}`);
          const data = res.data;
          
          setOrgSettings({
            ...orgSettings,
            ...data.settings,
            profile: {
              ...orgSettings.profile,
              name: data.name || orgSettings.profile.name,
              logo: data.logo || orgSettings.profile.logo,
              ...data.settings?.profile
            },
            twilio: {
              ...orgSettings.twilio,
              ...data.settings?.twilio
            },
            whatsapp: {
              ...orgSettings.whatsapp,
              ...data.settings?.whatsapp
            },
            africasTalking: {
              ...orgSettings.africasTalking,
              ...data.settings?.africasTalking
            },
            notifications: {
              ...orgSettings.notifications,
              ...data.settings?.notifications
            }
          });
        } catch (err) {
          console.error('Failed to fetch settings:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchSettings();
  }, [profile?.orgId]);

  const handleSaveSettings = async () => {
    if (!profile?.orgId) return;

    try {
      await api.patch(`/organizations/${profile.orgId}`, {
        name: orgSettings.profile.name,
        settings: orgSettings,
        logo: orgSettings.profile.logo,
      });
      setNotification({ type: 'success', message: 'Settings saved successfully!' });
      setEditingIntegration(null);
      await refreshAuth?.();
      setTimeout(() => setNotification(null), 3000);
    } catch (error: any) {
      setNotification({ type: 'error', message: `Failed to save: ${error.message}` });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const updateIntegration = (key: string, value: any) => {
    setOrgSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], ...value }
    }));
  };

  const handleTestTwilio = async () => {
    if (!orgSettings.twilio?.accountSid || !orgSettings.twilio?.authToken) {
      setNotification({ type: 'error', message: 'Please enter Account SID and Auth Token first' });
      return;
    }

    setIsTesting(true);
    try {
      await outreachService.testTwilioConnection(orgSettings.twilio.accountSid, orgSettings.twilio.authToken);
      setNotification({ type: 'success', message: 'Twilio connection successful!' });
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Twilio connection failed' });
    } finally {
      setIsTesting(false);
      setTimeout(() => setNotification(null), 5000);
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

  const tabs = [
    { id: 'profile', name: 'Organization Profile', icon: Building2 },
    { id: 'integrations', name: 'API Integrations', icon: Key },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security & Access', icon: Shield },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

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
                  <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Organization Identity</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">This will be shown on your dashboard and campaign reports.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Organization Name</label>
                  <input type="text" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={orgSettings.profile?.name || ''} onChange={(e) => updateIntegration('profile', { name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Industry</label>
                  <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={orgSettings.profile?.industry || ''} onChange={(e) => updateIntegration('profile', { industry: e.target.value })}>
                    <option>Religious Organization</option>
                    <option>Non-Profit / NGO</option>
                    <option>Education</option>
                    <option>Business</option>
                    <option>Political Campaign</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Default Country Code</label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
                    <input type="text" className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={orgSettings.profile?.countryCode || ''} onChange={(e) => updateIntegration('profile', { countryCode: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Timezone</label>
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
                    <select className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={orgSettings.profile?.timezone || ''} onChange={(e) => updateIntegration('profile', { timezone: e.target.value })}>
                      <option>(GMT+01:00) Lagos</option>
                      <option>(GMT+00:00) London</option>
                      <option>(GMT-05:00) New York</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              {editingIntegration ? (
                <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-8 animate-in slide-in-from-right-4 duration-200">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setEditingIntegration(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                      <ArrowRight className="w-5 h-5 text-gray-400 rotate-180" />
                    </button>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Configure {editingIntegration}</h3>
                  </div>

                  {editingIntegration === 'Twilio' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Account SID</label>
                        <input type="text" placeholder="AC..." className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={orgSettings.twilio?.accountSid || ''} onChange={(e) => updateIntegration('twilio', { accountSid: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Auth Token</label>
                        <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={orgSettings.twilio?.authToken || ''} onChange={(e) => updateIntegration('twilio', { authToken: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SMS From Number</label>
                        <input type="text" placeholder="+1234567890" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={orgSettings.twilio?.smsFromNumber || ''} onChange={(e) => updateIntegration('twilio', { smsFromNumber: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">WhatsApp From Number</label>
                        <input type="text" placeholder="+14155238886" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={orgSettings.twilio?.whatsappFromNumber || ''} onChange={(e) => updateIntegration('twilio', { whatsappFromNumber: e.target.value })} />
                      </div>
                    </div>
                  )}

                  {editingIntegration === 'Africa\'s Talking' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Username</label>
                          <input type="text" placeholder="sandbox or username" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={orgSettings.africasTalking?.username || ''} onChange={(e) => updateIntegration('africasTalking', { username: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">API Key</label>
                          <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={orgSettings.africasTalking?.apiKey || ''} onChange={(e) => updateIntegration('africasTalking', { apiKey: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SMS Sender ID / Shortcode</label>
                          <input type="text" placeholder="MySenderID" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={orgSettings.africasTalking?.smsFrom || ''} onChange={(e) => updateIntegration('africasTalking', { smsFrom: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">WhatsApp Number / Channel</label>
                          <input type="text" placeholder="+234..." className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={orgSettings.africasTalking?.whatsappFrom || ''} onChange={(e) => updateIntegration('africasTalking', { whatsappFrom: e.target.value })} />
                        </div>
                        {/* 
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Voice Number</label>
                          <input type="text" placeholder="+234..." className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={orgSettings.africasTalking?.voiceFrom || ''} onChange={(e) => updateIntegration('africasTalking', { voiceFrom: e.target.value })} />
                        </div>
                        */}
                        <div className="space-y-4">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Environment</label>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => updateIntegration('africasTalking', { isSandbox: true })}
                              className={cn(
                                "flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all",
                                orgSettings.africasTalking?.isSandbox 
                                  ? "bg-orange-50 border-orange-500 text-orange-600" 
                                  : "bg-gray-50 border-gray-100 text-gray-400"
                              )}
                            >
                              Sandbox (Test)
                            </button>
                            <button
                              onClick={() => updateIntegration('africasTalking', { isSandbox: false })}
                              className={cn(
                                "flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all",
                                !orgSettings.africasTalking?.isSandbox 
                                  ? "bg-green-50 border-green-500 text-green-600" 
                                  : "bg-gray-50 border-gray-100 text-gray-400"
                              )}
                            >
                              Live (Production)
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row gap-3 pt-4">
                    <button 
                      onClick={handleTestTwilio} 
                      disabled={isTesting}
                      className="flex-1 px-6 py-3 border border-blue-200 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-white dark:bg-gray-900 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                      <span>Test Connection</span>
                    </button>
                    <div className="flex flex-1 gap-3">
                      <button onClick={() => setEditingIntegration(null)} className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900">Cancel</button>
                      <button onClick={handleSaveSettings} className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200">Save Config</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {[
                    { name: 'Twilio', description: 'SMS and WhatsApp integration.', icon: MessageSquare, color: 'bg-red-50 text-red-600', connected: !!orgSettings.twilio?.accountSid && !!orgSettings.twilio?.authToken },
                    { name: 'Africa\'s Talking', description: 'Local African SMS, Voice & WhatsApp.', icon: Smartphone, color: 'bg-orange-50 text-orange-600', connected: !!orgSettings.africasTalking?.apiKey },
                    { name: 'WhatsApp Business API', description: 'Direct Meta integration.', icon: MessageSquare, color: 'bg-green-50 text-green-600', connected: !!orgSettings.whatsapp?.apiKey },
                  ].map((integration) => (
                    <div key={integration.name} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className={cn("p-4 rounded-2xl", integration.color)}><integration.icon className="w-6 h-6" /></div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{integration.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {integration.connected && <div className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-bold flex items-center gap-2"><Check className="w-4 h-4" /> Connected</div>}
                        <button onClick={() => setEditingIntegration(integration.name)} className="px-6 py-2 bg-gray-900 dark:bg-blue-600 text-white font-bold rounded-xl text-sm shadow-lg">Configure</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notification Preferences</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Control how and when you receive updates from ReachOut.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest">Email Notifications</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'campaignSuccess', label: 'Campaign Performance Reports', desc: 'Get a summary after each outreach campaign completes.' },
                      { key: 'billingAlerts', label: 'Billing & Subscription', desc: 'Invoices, payment failures, and usage alerts.' },
                      { key: 'securityAlerts', label: 'Security Alerts', desc: 'Notifications about new logins or password changes.' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={orgSettings.notifications?.email?.[item.key]} 
                            onChange={(e) => setOrgSettings({
                              ...orgSettings,
                              notifications: {
                                ...orgSettings.notifications,
                                email: { ...orgSettings.notifications.email, [item.key]: e.target.checked }
                              }
                            })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest">Other Channels</h4>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">WhatsApp Notifications</p>
                        <p className="text-xs text-gray-500">Receive critical system alerts directly on your WhatsApp.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={orgSettings.notifications?.whatsappNotifications} 
                          onChange={(e) => setOrgSettings({
                            ...orgSettings,
                            notifications: { ...orgSettings.notifications, whatsappNotifications: e.target.checked }
                          })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Security Settings</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Enhance the protection of your organization's data.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm text-blue-600">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">Two-Factor Authentication (2FA)</p>
                        <p className="text-xs text-gray-500">Add an extra layer of security to your account.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={orgSettings.security?.twoFactorEnabled} 
                        onChange={(e) => setOrgSettings({
                          ...orgSettings,
                          security: { ...orgSettings.security, twoFactorEnabled: e.target.checked }
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">Login Alerts</p>
                        <p className="text-xs text-gray-500">Notify me of new login attempts.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={orgSettings.security?.loginAlerts} 
                          onChange={(e) => setOrgSettings({
                            ...orgSettings,
                            security: { ...orgSettings.security, loginAlerts: e.target.checked }
                          })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="p-5 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">Data Sharing</p>
                        <p className="text-xs text-gray-500">Allow AI models to learn from your data.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={orgSettings.security?.dataSharing} 
                          onChange={(e) => setOrgSettings({
                            ...orgSettings,
                            security: { ...orgSettings.security, dataSharing: e.target.checked }
                          })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50/30 dark:bg-red-900/10 p-8 rounded-3xl border border-red-100 dark:border-red-900/30 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Danger Zone
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Irreversible actions regarding your organization data.</p>
                </div>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-red-100 dark:border-red-900/30">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Delete Organization</p>
                    <p className="text-xs text-gray-500">Once deleted, all data, contacts and campaigns will be permanently removed.</p>
                  </div>
                  <button className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-100 dark:shadow-none whitespace-nowrap">
                    Delete Permanently
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
