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
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';
import { Contact, Campaign } from './types';
import { generateId, cn } from './lib/utils';
import { Shield, CheckCircle2, AlertCircle, Loader2, Copy, Edit2, Trash2 } from 'lucide-react';
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
import api from './lib/api';

function AppContent() {
  const { user, profile, organization, loading: authLoading } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [members, setMembers] = useState<any[]>([]);
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
      const [contactsRes, campaignsRes, membersRes] = await Promise.all([
        api.get('/contacts'),
        api.get('/campaigns'),
        api.get('/organizations/members')
      ]);
      setContacts(contactsRes.data);
      setCampaigns(campaignsRes.data);
      setMembers(membersRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    if (user && profile?.orgId) {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [user, profile?.orgId]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<AuthForm type="login" />} />
        <Route path="/signup" element={<AuthForm type="signup" />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (profile?.setupCompleted === false) {
    return (
      <Routes>
        <Route path="*" element={<CompleteProfile />} />
      </Routes>
    );
  }

  const role = profile?.role || 'owner';
  const isSuperAdmin = role === 'superadmin';
  const isAdmin = role === 'admin' || role === 'owner';
  const isSubscriptionActive = organization?.subscription?.status === 'active' || isSuperAdmin;
  const FREE_TRIAL_LIMIT = 10;
  const hasReachedLimit = !isSubscriptionActive && contacts.length >= FREE_TRIAL_LIMIT;
  const canAccessCoreFeatures = isSubscriptionActive || contacts.length <= FREE_TRIAL_LIMIT;

  const handleSaveContact = async (data: Partial<Contact>) => {
    try {
      if (editingContact) await api.patch(`/contacts/${editingContact.id}`, data);
      else await api.post('/contacts', data);
      await fetchData();
      setIsAddingContact(false);
      setEditingContact(null);
      setNotification({ type: 'success', message: 'Contact saved!' });
    } catch (e: any) {
      setNotification({ type: 'error', message: e.message });
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      await api.delete(`/campaigns/${id}`);
      await fetchData();
      setNotification({ type: 'success', message: 'Campaign deleted successfully' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleSaveCampaign = async (data: any) => {
    try {
      let res;
      if (editingCampaign) res = await api.patch(`/campaigns/${editingCampaign.id}`, data);
      else res = await api.post('/campaigns', data);
      if (data.schedule === 'now') await api.post('/outreach/trigger', { campaignId: res.data._id || res.data.id });
      await fetchData();
      setIsCreatingCampaign(false);
      setEditingCampaign(null);
      setDuplicateData(null);
      setNotification({ type: 'success', message: 'Campaign updated!' });
    } catch (e: any) {
      setNotification({ type: 'error', message: e.message });
    }
  };

  return (
    <PageWrapper notifications={[]} contactCount={contacts.length}>
      <Routes>
        <Route path="/" element={
          isSuperAdmin ? <Navigate to="/superadmin" /> : (canAccessCoreFeatures ? (
            organization?.type === 'religious' ? <ReligiousDashboard campaigns={campaigns} /> :
            organization?.type === 'political' ? <PoliticalDashboard campaigns={campaigns} /> :
            organization?.type === 'nonprofit' ? <NonProfitDashboard campaigns={campaigns} /> :
            organization?.type === 'education' ? <EducationDashboard campaigns={campaigns} /> :
            organization?.type === 'business' ? <BusinessDashboard campaigns={campaigns} /> :
            <Dashboard campaigns={campaigns} />
          ) : <Navigate to="/billing" />)
        } />
        <Route path="/contacts" element={<ContactList contacts={contacts} onAddContact={() => hasReachedLimit ? setNotification({ type: 'error', message: 'Limit reached' }) : setIsAddingContact(true)} onEditContact={(c) => { setEditingContact(c); setIsAddingContact(true); }} onDeleteContact={async (id) => { await api.delete(`/contacts/${id}`); fetchData(); }} onImportContacts={() => setIsImporting(true)} canManage={isAdmin} organizationType={organization?.type} />} />
        <Route path="/campaigns" element={
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Campaigns</h1>
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-0.5">Manage outreach efforts</p>
              </div>
              <button onClick={() => setIsCreatingCampaign(true)} className="px-5 py-2.5 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">New Campaign</button>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left table-auto">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50">
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Name</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Type</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Schedule</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Sent</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center text-green-600">Delivered</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center text-red-600">Failed</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {campaigns.map(c => (
                      <tr key={c.id || (c as any)._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-black text-gray-900 dark:text-white text-sm">{c.name}</div>
                          <div className="text-[10px] text-gray-400 uppercase font-bold truncate max-w-[200px]">{c.message}</div>
                        </td>
                        <td className="px-6 py-4 text-[10px] font-black uppercase text-gray-500">{c.type}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                            c.status === 'completed' ? "bg-green-100 text-green-700" : 
                            c.status === 'failed' ? "bg-red-100 text-red-700" :
                            "bg-blue-100 text-blue-700"
                          )}>{c.status}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-bold text-gray-900 dark:text-white">
                            {c.scheduleAt ? new Date(c.scheduleAt).toLocaleDateString() : 'Now'}
                          </div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase">
                            {c.scheduleAt ? new Date(c.scheduleAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-black text-gray-900 dark:text-white text-xs">{c.stats?.sent || 0}</td>
                        <td className="px-6 py-4 text-center font-black text-green-600 text-sm">{c.stats?.delivered || 0}</td>
                        <td className="px-6 py-4 text-center font-black text-red-600 text-sm">{c.stats?.failed || 0}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setDuplicateData({ ...c, name: `Copy of ${c.name}` }); setIsCreatingCampaign(true); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-blue-600" title="Copy">
                              <Copy className="w-4 h-4" />
                            </button>
                            <button onClick={() => { setEditingCampaign(c); setIsCreatingCampaign(true); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-blue-600" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteCampaign(c.id || (c as any)._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-gray-400 hover:text-red-600" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {campaigns.length === 0 && (
                      <tr><td colSpan={8} className="px-6 py-20 text-center text-gray-400 font-black uppercase tracking-widest text-xs">No active campaigns</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        } />
        <Route path="/reports" element={<Reports campaigns={campaigns} />} />
        <Route path="/call-logs" element={<CallLogs />} />
        <Route path="/members" element={<Members members={members} />} />
        <Route path="/inbox" element={<Inbox messages={[]} />} />
        <Route path="/notifications" element={<Notifications notifications={[]} />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/superadmin" element={<SuperAdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {isImporting && <ContactImport onImport={async (l) => { await Promise.all(l.map(c => api.post('/contacts', c))); fetchData(); setIsImporting(false); }} onClose={() => setIsImporting(false)} />}
      {isAddingContact && <ContactForm contact={editingContact} onSave={handleSaveContact} onClose={() => { setIsAddingContact(false); setEditingContact(null); }} organizationType={organization?.type} />}
      {isCreatingCampaign && (
        <CampaignForm 
          initialData={editingCampaign || duplicateData} 
          onSave={handleSaveCampaign} 
          onClose={() => { 
            setIsCreatingCampaign(false); 
            setEditingCampaign(null); 
            setDuplicateData(null); 
          }} 
          availableGroups={Array.from(new Set(contacts.flatMap(c => c.groups || [])))}
          organizationType={organization?.type}
          brandName={organization?.name}
        />
      )}
      
      {notification && (
        <div className={cn("fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-8", notification.type === 'success' ? "bg-green-600 text-white" : "bg-red-600 text-white")}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="font-black text-xs uppercase tracking-widest">{notification.message}</p>
        </div>
      )}
    </PageWrapper>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}
