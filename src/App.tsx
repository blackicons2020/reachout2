import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { PageWrapper } from './components/layout/PageWrapper';
import { Dashboard } from './components/dashboard/Dashboard';
import { ContactList } from './components/contacts/ContactList';
import { ContactImport } from './components/contacts/ContactImport';
import { ContactForm } from './components/contacts/ContactForm';
import { CampaignForm } from './components/campaigns/CampaignForm';
import { Analytics } from './components/analytics/Analytics';
import { Billing } from './components/billing/Billing';
import { Settings } from './components/settings/Settings';
import { AuthForm } from './components/auth/AuthForm';
import { CompleteProfile } from './components/auth/CompleteProfile';
import { Contact, Campaign } from './types';
import { cn } from './lib/utils';
import { MessageSquare, X, AlertCircle, CheckCircle2, Loader2, Shield, Activity, Layers } from 'lucide-react';
import api from './lib/api';
import Reports from './components/reports/Reports';
import CallLogs from './components/reports/CallLogs';
import Members from './components/organization/Members';
import Notifications from './components/notifications/Notifications';
import Inbox from './components/inbox/Inbox';
import { ThemeProvider } from './hooks/useTheme';
import { ReligiousDashboard } from './components/dashboards/ReligiousDashboard';
import { PoliticalDashboard } from './components/dashboards/PoliticalDashboard';
import { NonProfitDashboard } from './components/dashboards/NonProfitDashboard';
import { BusinessDashboard } from './components/dashboards/BusinessDashboard';
import { EducationDashboard } from './components/dashboards/EducationDashboard';

export default function App() {
  const { user, profile, organization, loading: authLoading, refreshAuth } = useAuth();
  const role = profile?.role || 'owner';
  const isSuperAdmin = role === 'superadmin';
  const isAdmin = role === 'admin' || role === 'owner';
  const isSubscriptionActive = organization?.subscription?.status === 'active' || isSuperAdmin;
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [inbox, setInbox] = useState<any[]>([]);
  const [orgSettings, setOrgSettings] = useState<any>({});
  
  const [isImporting, setIsImporting] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [duplicateData, setDuplicateData] = useState<any | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const fetchData = async () => {
    if (!user || !profile?.orgId) return;
    try {
      const [contactsRes, campaignsRes, orgRes, membersRes] = await Promise.all([
        api.get('/contacts'),
        api.get('/campaigns'),
        api.get(`/organizations/${profile.orgId}`),
        api.get('/organizations/members')
      ]);
      setContacts(contactsRes.data);
      setCampaigns(campaignsRes.data);
      setOrgSettings(orgRes.data.settings || {});
      setMembers(membersRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    // Simple polling for real-time feel since we moved away from onSnapshot
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user, profile?.orgId]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleLogout = async () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-change'));
  };

  const handleImportContacts = async (newContacts: any[]) => {
    if (!profile?.orgId) return;
    try {
      await Promise.all(newContacts.map(c => api.post('/contacts', c)));
      await fetchData();
      setNotification({ type: 'success', message: `Successfully imported ${newContacts.length} contacts` });
      setIsImporting(false);
    } catch (error: any) {
      setNotification({ type: 'error', message: `Import failed: ${error.message}` });
    }
  };

  const handleSaveContact = async (data: Partial<Contact>) => {
    try {
      if (editingContact) {
        await api.patch(`/contacts/${editingContact.id}`, data);
        setEditingContact(null);
      } else {
        await api.post('/contacts', data);
      }
      await fetchData();
      setIsAddingContact(false);
      setNotification({ type: 'success', message: 'Contact saved successfully' });
    } catch (error: any) {
      setNotification({ type: 'error', message: `Save failed: ${error.message}` });
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await api.delete(`/contacts/${id}`);
      await fetchData();
      setNotification({ type: 'success', message: 'Contact deleted successfully' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleSaveCampaign = async (data: any) => {
    try {
      let response;
      if (editingCampaign) {
        response = await api.patch(`/campaigns/${editingCampaign.id}`, data);
        setEditingCampaign(null);
      } else {
        response = await api.post('/campaigns', data);
      }
      
      if (data.schedule === 'now') {
        await api.post('/outreach/trigger', { campaignId: response.data._id || response.data.id });
      }
      
      await fetchData();
      setIsCreatingCampaign(false);
      setNotification({ type: 'success', message: data.schedule === 'now' ? 'Campaign launched!' : 'Campaign scheduled!' });
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin"></div>
          <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-600 animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Initializing Platform</h2>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-50">Securing environment...</p>
        </div>
      </div>
    );
  }

  const FREE_TRIAL_LIMIT = 10;
  const hasReachedLimit = !isSubscriptionActive && contacts.length >= FREE_TRIAL_LIMIT;
  const canAccessCoreFeatures = isSubscriptionActive || contacts.length <= FREE_TRIAL_LIMIT;

  return (
    <ThemeProvider>
      <Router>
        {!user ? (
        <Routes>
          <Route path="/login" element={<AuthForm type="login" />} />
          <Route path="/signup" element={<AuthForm type="signup" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : !profile ? (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">Loading User Profile...</p>
          <button onClick={handleLogout} className="text-xs text-blue-600 font-bold hover:underline">Or Logout</button>
        </div>
      ) : profile.setupCompleted === false ? (
        <Routes>
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="*" element={<Navigate to="/complete-profile" />} />
        </Routes>
      ) : (
        <PageWrapper notifications={notifications} contactCount={contacts.length}>
          {notification && (
            <div className={cn(
              "fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-8 duration-300",
              notification.type === 'success' ? "bg-green-600 text-white" : "bg-red-600 text-white"
            )}>
              {notification.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              <p className="font-bold text-sm">{notification.message}</p>
              <button onClick={() => setNotification(null)} className="ml-4 p-1 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <Routes>
            <Route path="/" element={isSuperAdmin ? <Navigate to="/superadmin" /> : (canAccessCoreFeatures ? (
              organization?.type === 'religious' ? <ReligiousDashboard campaigns={campaigns} /> :
              organization?.type === 'political' ? <PoliticalDashboard campaigns={campaigns} /> :
              organization?.type === 'nonprofit' ? <NonProfitDashboard campaigns={campaigns} /> :
              organization?.type === 'education' ? <EducationDashboard campaigns={campaigns} /> :
              organization?.type === 'business' ? <BusinessDashboard campaigns={campaigns} /> :
              <Dashboard campaigns={campaigns} />
            ) : <Navigate to="/billing" />)} />
            <Route 
              path="/contacts" 
              element={
                <ContactList 
                  contacts={contacts} 
                  onAddContact={() => {
                    if (hasReachedLimit) {
                      setNotification({ type: 'error', message: 'Trial limit reached. Please subscribe.' });
                      return;
                    }
                    setIsAddingContact(true);
                  }} 
                  onEditContact={(contact) => {
                    setEditingContact(contact);
                    setIsAddingContact(true);
                  }}
                  onDeleteContact={handleDeleteContact}
                  onImportContacts={() => setIsImporting(true)}
                  canManage={isAdmin}
                  organizationType={organization?.type}
                />
              } 
            />
            <Route path="/campaigns" element={
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage outreach campaigns.</p>
                  </div>
                  <button onClick={() => setIsCreatingCampaign(true)} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg">New Campaign</button>
                </div>
                {/* Simplified Campaign Table - keeping it basic for the migration preview */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <th className="py-4 text-[10px] font-bold uppercase text-gray-500">Name</th>
                        <th className="py-4 text-[10px] font-bold uppercase text-gray-500">Type</th>
                        <th className="py-4 text-[10px] font-bold uppercase text-gray-500">Status</th>
                        <th className="py-4 text-[10px] font-bold uppercase text-gray-500 text-center">Sent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map(c => (
                        <tr key={c.id || (c as any)._id} className="border-b border-gray-50 dark:border-gray-800/50">
                          <td className="py-4 font-bold">{c.name}</td>
                          <td className="py-4 uppercase text-xs">{c.type}</td>
                          <td className="py-4 text-xs">
                            <span className={cn(
                              "px-2 py-1 rounded-full",
                              c.status === 'completed' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                            )}>{c.status}</span>
                          </td>
                          <td className="py-4 text-center font-bold">{c.stats?.sent || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            } />
            <Route path="/reports" element={<Reports campaigns={campaigns} />} />
            <Route path="/calls" element={<CallLogs />} />
            <Route path="/organization/members" element={<Members members={members} />} />
            <Route path="/inbox" element={<Inbox messages={inbox} />} />
            <Route path="/notifications" element={<Notifications notifications={notifications} />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </PageWrapper>
      )}

      {isImporting && (
        <ContactImport 
          onImport={handleImportContacts}
          onClose={() => setIsImporting(false)}
        />
      )}

      {isAddingContact && (
        <ContactForm 
          contact={editingContact}
          onSave={handleSaveContact}
          onClose={() => {
            setIsAddingContact(false);
            setEditingContact(null);
          }}
        />
      )}

      {isCreatingCampaign && (
        <CampaignForm 
          campaign={editingCampaign || duplicateData}
          onSave={handleSaveCampaign}
          onClose={() => {
            setIsCreatingCampaign(false);
            setEditingCampaign(null);
            setDuplicateData(null);
          }}
          contacts={contacts}
        />
      )}
      </Router>
    </ThemeProvider>
  );
}
