import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Search, 
  Building2, 
  Trash2, 
  MoreVertical, 
  Activity, 
  CreditCard, 
  Settings,
  Send
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function SuperAdminDashboard() {
  const { profile } = useAuth();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [systemConfig, setSystemConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'organizations' | 'users' | 'system'>('organizations');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (profile?.role !== 'superadmin') return;

    const fetchData = async () => {
      try {
        const [orgsRes, usersRes, logsRes, configRes] = await Promise.all([
          api.get('/admin/organizations'),
          api.get('/admin/users'),
          api.get('/admin/logs'),
          api.get('/admin/config')
        ]);
        setOrganizations(orgsRes.data);
        setAllUsers(usersRes.data);
        setLogs(logsRes.data);
        setSystemConfig(configRes.data);
        setLoading(false);
      } catch (err) {
        console.error('SuperAdmin fetch error:', err);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [profile?.role]);

  const handleUpdateSubscription = async (orgId: string, status: string) => {
    try {
      await api.patch(`/admin/organizations/${orgId}`, {
        'subscription.status': status,
        'subscription.updatedAt': Date.now()
      });
      setOrganizations(prev => prev.map(o => o._id === orgId ? { ...o, subscription: { ...o.subscription, status } } : o));
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleUpdatePlan = async (orgId: string, planId: string) => {
    try {
      await api.patch(`/admin/organizations/${orgId}`, {
        'subscription.planId': planId,
        'subscription.updatedAt': Date.now()
      });
      setOrganizations(prev => prev.map(o => o._id === orgId ? { ...o, subscription: { ...o.subscription, planId } } : o));
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      await api.patch(`/users/${userId}`, { role });
      setAllUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u));
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleToggleSystemSetting = async (key: string, value: boolean) => {
    try {
      const res = await api.patch('/admin/config', { [key]: value });
      setSystemConfig(res.data);
    } catch (error: any) {
      console.error("Config update error:", error);
    }
  };

  const filteredOrgs = organizations.filter(org => 
    org.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org._id?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-4">
            <div className="p-3 bg-gray-900 dark:bg-white rounded-2xl shadow-2xl">
              <Shield className="w-8 h-8 text-white dark:text-gray-900" />
            </div>
            SuperAdmin Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          {(['organizations', 'users', 'system'] as const).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                activeTab === tab ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Organizations', value: organizations.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10' },
          { label: 'Active Users', value: allUsers.filter(u => u.role !== 'suspended').length, icon: Users, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/10' },
          { label: 'Total Logs', value: logs.length, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/10' },
          { label: 'SaaS Subscriptions', value: organizations.filter(o => o.subscription?.status === 'active').length, icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/10' },
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

      {(activeTab === 'organizations' || activeTab === 'users') && (
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
          />
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
        {activeTab === 'organizations' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-5 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Organization</th>
                  <th className="px-6 py-5 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Plan</th>
                  <th className="px-6 py-5 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredOrgs.map((org) => (
                  <tr key={org._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center font-black">
                          {org.name?.[0].toUpperCase() || 'O'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{org.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <select 
                        value={org.subscription?.planId || 'standard-basic'}
                        onChange={(e) => handleUpdatePlan(org._id, e.target.value)}
                        className="bg-gray-50 dark:bg-gray-950 border-none rounded-lg px-2 py-1 text-[10px] font-black uppercase"
                      >
                        <option value="standard-basic">Basic</option>
                        <option value="standard-growth">Growth</option>
                        <option value="standard-pro">Pro</option>
                        <option value="standard-elite">Elite</option>
                      </select>
                    </td>
                    <td className="px-6 py-5">
                      <select 
                        value={org.subscription?.status || 'inactive'}
                        onChange={(e) => handleUpdateSubscription(org._id, e.target.value)}
                        className={cn(
                          "bg-gray-50 dark:bg-gray-950 border-none rounded-lg px-2 py-1 text-[10px] font-black uppercase",
                          org.subscription?.status === 'active' ? "text-green-600" : "text-red-500"
                        )}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
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
                  <th className="px-6 py-5 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{user.displayName || user.email}</p>
                        <p className="text-[10px] text-gray-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <select 
                        value={user.role}
                        onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                        className="bg-gray-50 dark:bg-gray-950 border-none rounded-lg px-2 py-1 text-[10px] font-black uppercase"
                      >
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                        <option value="superadmin">SuperAdmin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div>
                <p className="font-bold dark:text-white uppercase tracking-tight">Maintenance Mode</p>
                <p className="text-xs text-gray-500">Temporarily disable platform access.</p>
              </div>
              <button 
                onClick={() => handleToggleSystemSetting('maintenanceMode', !systemConfig?.maintenanceMode)}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-colors duration-300",
                  systemConfig?.maintenanceMode ? "bg-red-500" : "bg-gray-300 dark:bg-gray-700"
                )}
              >
                <div className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform", systemConfig?.maintenanceMode ? "translate-x-6" : "")} />
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 h-[300px] overflow-y-auto space-y-2">
              <h3 className="text-xs font-black uppercase text-gray-400 mb-4">System Activity</h3>
              {logs.map((log) => (
                <div key={log._id} className="text-[10px] border-b border-gray-100 dark:border-gray-800 pb-2">
                  <span className="font-bold text-blue-500 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className="dark:text-gray-300">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
