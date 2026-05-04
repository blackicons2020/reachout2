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
import { generateId, cn } from './lib/utils';
import { MessageSquare, Phone, Send, Edit2, Trash2, X, Copy, AlertCircle, CheckCircle2, Loader2, Shield, Activity, Mail, Layers, MessageCircle } from 'lucide-react';
import { outreachService } from './services/outreachService';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  where, 
  orderBy, 
  getDoc,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from './lib/firebase';
import { signOut } from 'firebase/auth';
import Reports from './components/reports/Reports';
import CallLogs from './components/reports/CallLogs';
import Members from './components/organization/Members';
import Notifications from './components/notifications/Notifications';
import Inbox from './components/inbox/Inbox';


import { ThemeProvider } from './hooks/useTheme';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';
import { AIChat } from './components/ai/AIChat';
import { ReligiousDashboard } from './components/dashboards/ReligiousDashboard';
import { PoliticalDashboard } from './components/dashboards/PoliticalDashboard';
import { NonProfitDashboard } from './components/dashboards/NonProfitDashboard';
import { BusinessDashboard } from './components/dashboards/BusinessDashboard';
import { EducationDashboard } from './components/dashboards/EducationDashboard';

export default function App() {
  const { user, profile, organization, loading: authLoading } = useAuth();
  const role = profile?.role || 'owner';
  const isSuperAdmin = role === 'superadmin';
  const isViewer = role === 'viewer';
  const isEditor = role === 'editor';
  const isAdmin = role === 'admin' || role === 'owner';
  const isSubscriptionActive = organization?.subscription?.status === 'active' || isSuperAdmin;
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [inbox, setInbox] = useState<any[]>([]);
  const [orgSettings, setOrgSettings] = useState<any>({});
  const [systemConfig, setSystemConfig] = useState<any>(null);
  
  const [isImporting, setIsImporting] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [duplicateData, setDuplicateData] = useState<any | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    // Listen to global system config
    const unsubConfig = onSnapshot(doc(db, 'system_configs', 'global'), (doc) => {
      if (doc.exists()) {
        setSystemConfig(doc.data());
      }
    });
    return () => unsubConfig();
  }, []);

  useEffect(() => {
    const adminEmails = ['superadmin@outreach.com', 'johnmeke2013@gmail.com'];
    if (user?.email && adminEmails.includes(user.email) && profile && profile.role !== 'superadmin') {
      console.log("Bootstrapping SuperAdmin role for:", user.email);
      updateDoc(doc(db, 'users', user.uid), { 
        role: 'superadmin',
        isSuperAdmin: true 
      }).catch(err => console.error("Self-promotion error:", err));
    }
  }, [user, profile]);

  useEffect(() => {
    if (user && profile?.orgId) {
      const orgId = profile.orgId;

      // Listen to org settings
      const unsubSettings = onSnapshot(doc(db, 'organizations', orgId), (doc) => {
        if (doc.exists()) {
          setOrgSettings(doc.data().settings || {});
        }
      });

      // Listen to contacts
      const qContacts = query(collection(db, 'organizations', orgId, 'contacts'), orderBy('createdAt', 'desc'));
      const unsubContacts = onSnapshot(qContacts, (snapshot) => {
        setContacts(snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as Contact));
      });

      // Listen to campaigns
      const qCampaigns = query(collection(db, 'organizations', orgId, 'campaigns'), orderBy('createdAt', 'desc'));
      const unsubCampaigns = onSnapshot(qCampaigns, (snapshot) => {
        setCampaigns(snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as Campaign));
      });

      // Listen to members
      const qMembers = query(collection(db, 'users'), where('orgId', '==', orgId));
      const unsubMembers = onSnapshot(qMembers, (snapshot) => {
        setMembers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      // Listen to inbox
      const qInbox = query(collection(db, 'organizations', orgId, 'messages'), orderBy('timestamp', 'desc'));
      const unsubInbox = onSnapshot(qInbox, (snapshot) => {
        setInbox(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      // Listen to notifications
      const qNotifications = query(collection(db, 'organizations', orgId, 'notifications'), orderBy('createdAt', 'desc'));
      const unsubNotifications = onSnapshot(qNotifications, (snapshot) => {
        setNotifications(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      return () => {
        unsubSettings();
        unsubContacts();
        unsubCampaigns();
        unsubMembers();
        unsubInbox();
        unsubNotifications();
      };
    }
  }, [user, profile]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Initial Trial Notification
  useEffect(() => {
    if (user && profile?.orgId && !isSubscriptionActive && !isSuperAdmin) {
      const checkAndSendTrialNotice = async () => {
        const noticeRef = collection(db, 'organizations', profile.orgId, 'notifications');
        // Check if we already sent the trial welcome
        const q = query(noticeRef, where('type', '==', 'trial_welcome'));
        const docSnap = await getDoc(doc(noticeRef, 'trial_welcome')); // Use a fixed ID for safety or just a query
        
        // Actually, just sending a toast for immediate feedback and adding a persistent one if missing
        setNotification({ 
          type: 'error', 
          message: 'Free Trial Active: You have a limit of 10 contacts. Please subscribe for unlimited access.' 
        });

        // Add persistent notification if it doesn't exist
        try {
          const welcomeDoc = await getDoc(doc(db, 'organizations', profile.orgId, 'notifications', 'trial_welcome'));
          if (!welcomeDoc.exists()) {
            await setDoc(doc(db, 'organizations', profile.orgId, 'notifications', 'trial_welcome'), {
              type: 'trial_welcome',
              message: 'Welcome to Outreach Trial! You can add up to 10 contacts and send messages to them. Subscribe to unlock unlimited contacts and team features.',
              createdAt: Date.now(),
              read: false,
              memberId: 'all'
            });
          }
        } catch (err) {
          console.error("Trial welcome sync error:", err);
        }
      };
      
      checkAndSendTrialNotice();
    }
  }, [user?.uid, !!profile, isSubscriptionActive]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleImportContacts = async (newContacts: any[]) => {
    if (!profile?.orgId) return;
    
    try {
      const batch = writeBatch(db);
      newContacts.forEach(c => {
        const contactRef = doc(collection(db, 'organizations', profile.orgId, 'contacts'));
        batch.set(contactRef, {
          id: contactRef.id,
          orgId: profile.orgId,
          firstName: c.firstName,
          lastName: c.lastName,
          phone: c.phone,
          email: c.email || '',
          tags: c.tags || [],
          groups: c.groups || [],
          customFields: {},
          createdAt: Date.now(),
          status: 'active'
        });
      });
      await batch.commit();
      setNotification({ type: 'success', message: `Successfully imported ${newContacts.length} contacts` });
      setIsImporting(false);
    } catch (error: any) {
      setNotification({ type: 'error', message: `Import failed: ${error.message}` });
    }
  };

  const handleSaveContact = async (data: Partial<Contact>) => {
    if (!profile?.orgId) {
      console.error("No orgId found in profile", profile);
      setNotification({ type: 'error', message: 'No organization ID found. Please refresh.' });
      return;
    }
    
    console.log("Saving contact:", data);
    try {
      if (editingContact) {
        await updateDoc(doc(db, 'organizations', profile.orgId, 'contacts', editingContact.id), data);
        setEditingContact(null);
      } else {
        const contactRef = collection(db, 'organizations', profile.orgId, 'contacts');
        await addDoc(contactRef, {
          ...data,
          orgId: profile.orgId,
          createdAt: Date.now(),
          status: 'active'
        });
      }
      setIsAddingContact(false);
      setNotification({ type: 'success', message: 'Contact saved successfully' });
    } catch (error: any) {
      console.error("Error saving contact:", error);
      setNotification({ type: 'error', message: `Save failed: ${error.message}` });
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!profile?.orgId) return;
    try {
      await deleteDoc(doc(db, 'organizations', profile.orgId, 'contacts', id));
      setNotification({ type: 'success', message: 'Contact deleted successfully' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (!profile?.orgId) return;
    try {
      const batch = writeBatch(db);
      ids.forEach(id => {
        batch.delete(doc(db, 'organizations', profile.orgId, 'contacts', id));
      });
      await batch.commit();
      setNotification({ type: 'success', message: `${ids.length} contacts deleted successfully` });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleBulkAddTag = async (ids: string[], tag: string) => {
    if (!profile?.orgId) return;
    try {
      const batch = writeBatch(db);
      ids.forEach(id => {
        const c = contacts.find(contact => contact.id === id);
        if (c) {
          const tags = Array.from(new Set([...c.tags, tag]));
          batch.update(doc(db, 'organizations', profile.orgId, 'contacts', id), { tags });
        }
      });
      await batch.commit();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkAddGroup = async (ids: string[], group: string) => {
    if (!profile?.orgId) return;
    try {
      const batch = writeBatch(db);
      ids.forEach(id => {
        const c = contacts.find(contact => contact.id === id);
        if (c) {
          const groups = Array.from(new Set([...c.groups, group]));
          batch.update(doc(db, 'organizations', profile.orgId, 'contacts', id), { groups });
        }
      });
      await batch.commit();
    } catch (err) {
      console.error(err);
    }
  };

  const handleInviteMember = async (data: any) => {
    if (!profile?.orgId) return;

    const brandName = orgSettings.profile?.brandName || organization?.name || 'our organization';
    const inviteLink = `${window.location.origin}/signup?invite=${profile.orgId}`;
    const message = `[${brandName}]: Hello ${data.name}! You are invited to join us. Onboard here: ${inviteLink}`;

    try {
      if (data.channel === 'sms' || data.channel === 'whatsapp') {
        if (!orgSettings.twilio?.accountSid || !orgSettings.twilio?.authToken || !orgSettings.twilio?.fromNumber) {
          throw new Error('Twilio is not configured. Please go to Settings > Integrations to set it up.');
        }

        if (data.channel === 'sms') {
          await outreachService.sendSMS({
            phoneNumber: data.phone,
            message: message,
            apiKey: orgSettings.twilio.authToken,
            accountSid: orgSettings.twilio.accountSid,
            fromNumber: orgSettings.twilio.fromNumber
          });
        } else {
          await outreachService.sendWhatsApp({
            phoneNumber: data.phone,
            message: message,
            apiKey: orgSettings.twilio.authToken,
            accountSid: orgSettings.twilio.accountSid,
            fromNumber: orgSettings.twilio.fromNumber
          });
        }
        setNotification({ type: 'success', message: `Invitation sent via ${data.channel.toUpperCase()}!` });
      } else {
        // For email, we'd normally use a mail service, but for now we'll simulate it
        console.log(`Email Invite to ${data.email}: ${message}`);
        setNotification({ type: 'success', message: 'Invitation sent via Email! (Simulated)' });
      }
    } catch (error: any) {
      console.error('Invite Error:', error);
      setNotification({ type: 'error', message: `Failed to send invite: ${error.message}` });
    }
  };

  const handleAssignContacts = (memberId: string, groupName: string) => {
    // Update user profile with assignments
  };

  const handleDeleteMember = async (id: string) => {
    // Delete user profile?
  };

  const handleMarkAsRead = async (id: string) => {
    if (!profile?.orgId) return;
    try {
      await updateDoc(doc(db, 'organizations', profile.orgId, 'notifications', id), { read: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAllNotifications = async () => {
    if (!profile?.orgId) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach(n => {
        batch.delete(doc(db, 'organizations', profile.orgId, 'notifications', n.id));
      });
      await batch.commit();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMemberNotification = async (data: { memberId?: string, message: string }) => {
    if (!profile?.orgId) return;
    try {
      await addDoc(collection(db, 'organizations', profile.orgId, 'notifications'), {
        memberId: data.memberId || 'all',
        message: data.message,
        createdAt: Date.now(),
        read: false
      });
      setNotification({ type: 'success', message: 'Notification sent' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCampaign = async (data: any) => {
    if (!profile?.orgId) return;

    try {
      let scheduleAt: number | undefined;
      let nextRunAt: number | undefined;

      if (data.schedule === 'future') {
        const sortedTimes = (data.scheduleTimes || []).sort();
        if (sortedTimes.length > 0) {
          scheduleAt = new Date(`${data.scheduleDate}T${sortedTimes[0]}`).getTime();
          if (data.recurring) {
            nextRunAt = scheduleAt;
          }
        }
      }

      const brandName = orgSettings.profile?.brandName || organization?.name;
      const autoBranding = orgSettings.profile?.autoBranding ?? true;
      const finalMessage = (autoBranding && brandName) 
        ? `[${brandName}]: ${data.message}` 
        : data.message;

      const campaignData: any = {
        orgId: profile.orgId,
        type: data.type,
        status: 'scheduled',
        name: data.name,
        message: finalMessage,
        targetGroups: data.targetGroups,
        targetTags: [],
        scheduleAt: data.schedule === 'now' ? Date.now() : (scheduleAt || null),
        scheduleTimes: data.scheduleTimes || [],
        voiceId: data.voiceId || null,
        voiceProvider: data.voiceProvider || null,
        stats: {
          total: 0,
          sent: 0,
          delivered: 0,
          failed: 0
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      if (data.recurring) {
        campaignData.recurring = {
          ...data.recurring,
          nextRunAt: nextRunAt || null
        };
      }

      // Calculate total potential contacts
      const targetContacts = data.targetGroups.includes('All Contacts') 
        ? contacts 
        : contacts.filter(c => (c.groups || []).some(g => data.targetGroups.includes(g)));
      
      if (targetContacts.length === 0) {
        throw new Error('No contacts found in the selected target groups. Please add contacts or select different groups.');
      }
      
      campaignData.stats.total = targetContacts.length;

      if (editingCampaign) {
        await updateDoc(doc(db, 'organizations', profile.orgId, 'campaigns', editingCampaign.id), campaignData);
        setEditingCampaign(null);
      } else {
        const campaignRef = await addDoc(collection(db, 'organizations', profile.orgId, 'campaigns'), campaignData);
        
        // If "Send Now", trigger immediately
        if (data.schedule === 'now') {
          try {
            const response = await fetch('/api/outreach/trigger', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orgId: profile.orgId, campaignId: campaignRef.id })
            });
            
            if (!response.ok) {
              const err = await response.json();
              throw new Error(err.message || 'Failed to trigger campaign execution');
            }
            
            setNotification({ type: 'success', message: `Campaign launched! Sending to ${targetContacts.length} contacts.` });
          } catch (err: any) {
            console.error('Trigger Error:', err);
            setNotification({ type: 'error', message: `Campaign created but failed to trigger: ${err.message}` });
          }
        } else {
          setNotification({ type: 'success', message: `Campaign scheduled for ${targetContacts.length} contacts.` });
        }
      }

      setIsCreatingCampaign(false);
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message });
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!profile?.orgId) return;
    try {
      await deleteDoc(doc(db, 'organizations', profile.orgId, 'campaigns', id));
      setNotification({ type: 'success', message: 'Campaign deleted successfully' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleCancelCampaign = async (id: string) => {
    if (!profile?.orgId) return;
    try {
      await updateDoc(doc(db, 'organizations', profile.orgId, 'campaigns', id), { status: 'failed' });
      setNotification({ type: 'success', message: 'Campaign cancelled' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin"></div>
          <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-600 animate-pulse" />
        </div>
        <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-700">
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Initializing Platform</h2>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-50">Securing environment...</p>
        </div>
      </div>
    );
  }

  // Autonomous Maintenance Mode Guard
  if (systemConfig?.maintenanceMode && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-black border border-gray-800 rounded-[3rem] p-12 text-center space-y-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="relative">
            <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-transform duration-500">
              <Activity className="w-12 h-12 animate-pulse" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none mb-4">System Overhaul</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs leading-relaxed">
              We are currently performing autonomous platform maintenance. Access will be restored shortly.
            </p>
          </div>
          <div className="pt-8 border-t border-gray-800">
            <div className="flex items-center justify-center gap-2 text-blue-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest">Autonomous Sync in progress</span>
            </div>
          </div>
          {user && (
             <button 
               onClick={handleLogout}
               className="text-xs font-black text-gray-600 hover:text-white uppercase tracking-tighter transition-colors mt-4"
             >
               Logout
             </button>
          )}
        </div>
      </div>
    );
  }

  const FREE_TRIAL_LIMIT = 10;
  const isTrial = !isSubscriptionActive && contacts.length < FREE_TRIAL_LIMIT;
  const hasReachedLimit = !isSubscriptionActive && contacts.length >= FREE_TRIAL_LIMIT;
  const canAccessCoreFeatures = isSubscriptionActive || contacts.length <= FREE_TRIAL_LIMIT;

  // Granular permissions
  const canAddEditContacts = (isAdmin || isEditor) && (isSubscriptionActive || contacts.length < FREE_TRIAL_LIMIT);
  const canDeleteContacts = isAdmin && (isSubscriptionActive || contacts.length <= FREE_TRIAL_LIMIT);
  const canManageCampaigns = (isAdmin || isEditor) && (isSubscriptionActive || contacts.length <= FREE_TRIAL_LIMIT);
  const canManageMembers = isAdmin;
  const canManageBilling = isAdmin;
  const canManageSettings = isAdmin;

  const canManage = isAdmin || isEditor; 

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
              canAccessCoreFeatures ? (
                <ContactList 
                  contacts={contacts} 
                  onAddContact={() => {
                    if (hasReachedLimit) {
                      setNotification({ type: 'error', message: 'Trial limit reached. Please subscribe to add more than 10 contacts.' });
                      return;
                    }
                    canAddEditContacts && setIsAddingContact(true);
                  }} 
                  onEditContact={(contact) => {
                    if (!canAddEditContacts) return;
                    setEditingContact(contact);
                    setIsAddingContact(true);
                  }}
                  onDeleteContact={(id) => canDeleteContacts && handleDeleteContact(id)}
                  onBulkDelete={(ids) => canDeleteContacts && handleBulkDelete(ids)}
                  onBulkAddTag={(ids, tag) => canAddEditContacts && handleBulkAddTag(ids, tag)}
                  onBulkAddGroup={(ids, group) => canAddEditContacts && handleBulkAddGroup(ids, group)}
                  onImportContacts={() => {
                    if (hasReachedLimit) {
                      setNotification({ type: 'error', message: 'Trial limit reached. Please subscribe to import more contacts.' });
                      return;
                    }
                    canAddEditContacts && setIsImporting(true);
                  }} 
                  canManage={canAddEditContacts}
                  organizationType={organization?.type}
                />
              ) : <Navigate to="/billing" />
            } 
          />
          <Route path="/campaigns" element={canAccessCoreFeatures ? <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track your outreach campaigns.</p>
              </div>
              {canManageCampaigns && (
                <button 
                  onClick={() => {
                    if (hasReachedLimit) {
                      setNotification({ type: 'error', message: 'Trial limit reached. Please subscribe to create more campaigns.' });
                      return;
                    }
                    setEditingCampaign(null);
                    setIsCreatingCampaign(true);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none"
                >
                  New Campaign
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Campaigns', value: campaigns.length.toString(), icon: Layers, color: 'text-blue-500' },
                { label: 'SMS Campaigns', value: campaigns.filter(c => c.type === 'sms').length.toString(), icon: MessageSquare, color: 'text-blue-500' },
                { label: 'WhatsApp', value: campaigns.filter(c => c.type === 'whatsapp').length.toString(), icon: MessageSquare, color: 'text-green-500' },
              ].filter(Boolean).map((stat: any) => (
                <div key={stat.label} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md group">
                  <div className="flex items-center gap-3 mb-4">
                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                    <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</h3>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-950/50">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">All Campaigns</h3>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Channel</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Audience</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Sent</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Delivered</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Failures</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      {canManageCampaigns && <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {campaigns.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{c.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {c.type === 'sms' && <MessageSquare className="w-4 h-4 text-blue-500" />}
                            {c.type === 'whatsapp' && <MessageSquare className="w-4 h-4 text-green-500" />}
                            {/* {c.type === 'email' && <Mail className="w-4 h-4 text-orange-500" />} */}
                            {/* {c.type === 'voice' && <Phone className="w-4 h-4 text-purple-500" />} */}
                            <span className="text-xs font-medium uppercase dark:text-gray-300">{c.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {c.targetGroups && c.targetGroups.length > 0 ? c.targetGroups.map(g => (
                              <span key={g} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-[10px] font-bold uppercase">
                                {g}
                              </span>
                            )) : (
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-[10px] font-bold uppercase">
                                All Contacts
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">{c.stats.sent}</td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-green-600 dark:text-green-400">{c.stats.delivered}</td>
                        <td className="px-6 py-4 text-center text-xs text-gray-400 dark:text-gray-500 font-medium">{c.stats.failed > 0 ? c.stats.failed : '—'}</td>
                        <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-400">
                          {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            c.status === 'completed' ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400" :
                            c.status === 'sending' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                            c.status === 'scheduled' ? "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" :
                            "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                          )}>
                            {c.status}
                          </span>
                        </td>
                        {canManageCampaigns && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 transition-opacity">
                              <button 
                                onClick={() => {
                                  setDuplicateData(c);
                                  setIsCreatingCampaign(true);
                                }}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                title="Duplicate / Resend"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              {c.status === 'scheduled' && (
                                <>
                                  <button 
                                    onClick={() => {
                                      setEditingCampaign(c);
                                      setIsCreatingCampaign(true);
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleCancelCampaign(c.id)}
                                    className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {isAdmin && (
                                <button 
                                  onClick={() => handleDeleteCampaign(c.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {campaigns.length === 0 && (
                  <div className="text-center py-20 bg-gray-50/50 dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700/50">
                    <Send className="w-12 h-12 text-gray-200 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">No campaigns yet</h3>
                    <p className="text-gray-500 dark:text-gray-400">Create your first campaign to start reaching out.</p>
                  </div>
                )}
              </div>
            </div>
          </div> : <Navigate to="/billing" />} />
          <Route path="/analytics" element={canAccessCoreFeatures ? <Analytics /> : <Navigate to="/billing" />} />
          <Route path="/reports" element={canAccessCoreFeatures ? <Reports campaigns={campaigns} /> : <Navigate to="/billing" />} />
          <Route path="/notifications" element={<Notifications notifications={notifications} onMarkAsRead={handleMarkAsRead} onClearAll={handleClearAllNotifications} />} />
          <Route path="/inbox" element={canAccessCoreFeatures ? <Inbox messages={inbox} onSimulateReply={(msg: any) => setInbox([msg, ...inbox])} /> : <Navigate to="/billing" />} />
          <Route path="/members" element={canManageMembers ? <Members members={members} contacts={contacts} onInvite={handleInviteMember} onAssign={handleAssignContacts} onDelete={handleDeleteMember} onNotify={handleSendMemberNotification} /> : <Navigate to="/" />} />
          <Route path="/billing" element={canManageBilling ? <Billing /> : <Navigate to="/" />} />
          <Route path="/settings" element={canManageSettings ? <Settings /> : <Navigate to="/" />} />
          <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/superadmin" element={isSuperAdmin ? <SuperAdminDashboard /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
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
          organizationType={organization?.type}
          onSave={handleSaveContact}
          onClose={() => {
            setIsAddingContact(false);
            setEditingContact(null);
          }}
        />
      )}

      {isCreatingCampaign && (
        <CampaignForm 
          onSave={handleSaveCampaign} 
          onClose={() => {
            setIsCreatingCampaign(false);
            setEditingCampaign(null);
            setDuplicateData(null);
          }} 
          initialData={editingCampaign || duplicateData}
          isDuplicating={!!duplicateData}
          brandName={orgSettings.profile?.brandName || organization?.name}
          autoBranding={orgSettings.profile?.autoBranding}
          availableGroups={Array.from(new Set((contacts || []).flatMap(c => c.groups || [])))}
          organizationType={organization?.type}
        />
      )}
      {user && <AIChat />}
    </Router>
    </ThemeProvider>
  );
}
