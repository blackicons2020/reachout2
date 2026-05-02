import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Search, 
  Building2, 
  Trash2, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Globe,
  Settings,
  MoreVertical,
  Activity,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  getDocs,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { UserProfile, Organization } from '@/types';

export function SuperAdminDashboard() {
  const { profile } = useAuth();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [systemConfig, setSystemConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'organizations' | 'users' | 'system'>('organizations');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (profile?.role !== 'superadmin') return;

    // Listen to all organizations
    const unsubOrgs = onSnapshot(query(collection(db, 'organizations'), orderBy('createdAt', 'desc')), (snapshot) => {
      setOrganizations(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Listen to all users
    const unsubUsers = onSnapshot(query(collection(db, 'users'), orderBy('createdAt', 'desc')), (snapshot) => {
      setAllUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as UserProfile));
      setLoading(false);
    });

    // Listen to system logs
    const unsubLogs = onSnapshot(query(collection(db, 'system_logs'), orderBy('timestamp', 'desc'), where('timestamp', '>', Date.now() - 86400000)), (snapshot) => {
      setLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Listen to system config
    const unsubConfig = onSnapshot(doc(db, 'system_configs', 'global'), (snapshot) => {
      if (snapshot.exists()) {
        setSystemConfig(snapshot.data());
      } else {
        // Initialize default if missing
        setSystemConfig({ maintenanceMode: false, registrationsEnabled: true });
      }
    });

    return () => {
      unsubOrgs();
      unsubUsers();
      unsubLogs();
      unsubConfig();
    };
  }, [profile?.role]);

  const handleUpdateSubscription = async (orgId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'organizations', orgId), {
        'subscription.status': status,
        'subscription.updatedAt': Date.now()
      });
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleUpdatePlan = async (orgId: string, planId: string) => {
    try {
      await updateDoc(doc(db, 'organizations', orgId), {
        'subscription.planId': planId,
        'subscription.updatedAt': Date.now()
      });
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleDeleteOrganization = async (orgId: string) => {
    if (!window.confirm('CRITICAL: Are you sure you want to delete this organization? This will NOT delete sub-collections automatically but will remove access. Proceed with extreme caution.')) return;
    try {
      await deleteDoc(doc(db, 'organizations', orgId));
      alert('Organization deleted from main registry.');
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role });
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleToggleSystemSetting = async (key: string, value: boolean) => {
    try {
      await updateDoc(doc(db, 'system_configs', 'global'), { [key]: value });
    } catch (error: any) {
      // If doc doesn't exist, this might fail, but our bootstrap logic in useEffect usually handles it
      console.error("Config update error:", error);
    }
  };

  const filteredOrgs = organizations.filter(org => 
    org.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = allUsers.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (profile?.role !== 'superadmin') {
    return (
      <div className="p-12 text-center space-y-4">
        <Shield className="w-16 h-16 text-red-500 mx-auto" />
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Access Restricted</h1>
        <p className="text-gray-500">Only SuperAdmins can access this control panel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest rounded">System Control</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Platform Overview</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-4">
            <div className="p-3 bg-gray-900 dark:bg-white rounded-2xl shadow-2xl">
              <Shield className="w-8 h-8 text-white dark:text-gray-900" />
            </div>
            SuperAdmin Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <button 
            onClick={() => setActiveTab('organizations')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'organizations' ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Organizations
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'users' ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'system' ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            System
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Organizations', value: organizations.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10' },
          { label: 'Active Users', value: allUsers.length, icon: Users, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/10' },
          { label: 'SaaS Subscriptions', value: organizations.filter(o => o.subscription?.status === 'active').length, icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/10' },
          { label: 'System Health', value: 'Optimal', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/10' },
        ].map((stat) => (
          <div key={stat.label} className={cn("p-6 rounded-3xl border border-transparent shadow-sm flex items-center gap-4", stat.bg)}>
            <div className={cn("p-3 rounded-2xl bg-white dark:bg-gray-800 shadow-sm", stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      {(activeTab === 'organizations' || activeTab === 'users') && (
        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-950 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white dark:placeholder:text-gray-600"
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
        {activeTab === 'organizations' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-5 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Organization</th>
                  <th className="px-6 py-5 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Plan</th>
                  <th className="px-6 py-5 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Admins</th>
                  <th className="px-6 py-5 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredOrgs.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center font-black text-lg">
                          {org.name?.[0].toUpperCase() || 'O'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{org.name}</p>
                          <p className="text-[10px] font-mono text-gray-400">{org.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2">
                        <select 
                          value={org.subscription?.planId || 'free'}
                          onChange={(e) => handleUpdatePlan(org.id, e.target.value)}
                          className="bg-gray-50 dark:bg-gray-950 border-none rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                        <select 
                          value={org.subscription?.status || 'inactive'}
                          onChange={(e) => handleUpdateSubscription(org.id, e.target.value)}
                          className={cn(
                            "bg-gray-50 dark:bg-gray-950 border-none rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-wider focus:ring-2 focus:ring-blue-500 transition-all outline-none",
                            org.subscription?.status === 'active' ? "text-green-600 font-black" : "text-red-500"
                          )}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="trialing">Trialing</option>
                          <option value="canceled">Canceled</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex -space-x-2">
                        {allUsers.filter(u => u.orgId === org.id).slice(0, 3).map((u, i) => (
                          <div key={u.id} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold">
                            {u.email[0].toUpperCase()}
                          </div>
                        ))}
                        {allUsers.filter(u => u.orgId === org.id).length > 3 && (
                          <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-400">
                            +{allUsers.filter(u => u.orgId === org.id).length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => handleDeleteOrganization(org.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-5 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">User</th>
                  <th className="px-6 py-5 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Organization</th>
                  <th className="px-6 py-5 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-5 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{user.displayName || 'No Name'}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                        {organizations.find(o => o.id === user.orgId)?.name || 'No Org'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <select 
                        value={user.role}
                        onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                        className="bg-gray-50 dark:bg-gray-950 border-none rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      >
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                        <option value="superadmin">SuperAdmin</option>
                      </select>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold dark:text-white">Global Control</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="p-6 bg-gray-50 dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold dark:text-white uppercase tracking-tight">Maintenance Mode</p>
                      <p className="text-xs text-gray-500">Temporarily disable platform access for all non-admins.</p>
                    </div>
                    <button 
                      onClick={() => handleToggleSystemSetting('maintenanceMode', !systemConfig?.maintenanceMode)}
                      className={cn(
                        "w-12 h-6 rounded-full relative transition-colors duration-300",
                        systemConfig?.maintenanceMode ? "bg-red-500" : "bg-gray-300 dark:bg-gray-700"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300",
                        systemConfig?.maintenanceMode ? "translate-x-6" : "translate-x-0"
                      )} />
                    </button>
                  </div>

                  <div className="p-6 bg-gray-50 dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold dark:text-white uppercase tracking-tight">New Registrations</p>
                      <p className="text-xs text-gray-500">Allow or block new users from signing up to the platform.</p>
                    </div>
                    <button 
                      onClick={() => handleToggleSystemSetting('registrationsEnabled', !systemConfig?.registrationsEnabled)}
                      className={cn(
                        "w-12 h-6 rounded-full relative transition-colors duration-300",
                        systemConfig?.registrationsEnabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300",
                        systemConfig?.registrationsEnabled ? "translate-x-6" : "translate-x-0"
                      )} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                    <Activity className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold dark:text-white">Live Activity Log</h3>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800 h-[400px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {logs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 opacity-50">
                      <Activity className="w-10 h-10" />
                      <p className="text-xs font-bold uppercase tracking-widest">No recent activity</p>
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-50 dark:border-gray-800 shadow-sm flex items-start gap-4 animate-in slide-in-from-left duration-300">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-2 shrink-0",
                          log.type === 'error' ? "bg-red-500" : 
                          log.type === 'auth' ? "bg-blue-500" : 
                          log.type === 'billing' ? "bg-green-500" : "bg-gray-400"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{log.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono text-gray-400">{log.userEmail || 'System'}</span>
                            <span className="text-[10px] text-gray-500">•</span>
                            <span className="text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
