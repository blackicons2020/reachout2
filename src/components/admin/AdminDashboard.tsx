import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Search, 
  Mail, 
  Clock, 
  UserPlus,
  Trash2,
  Edit2
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { UserProfile, UserRole } from '@/types';

export function AdminDashboard() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const fetchMembers = async () => {
    if (!profile?.orgId) return;
    try {
      const res = await api.get('/organizations/members');
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.error('AdminDashboard fetch error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    const interval = setInterval(fetchMembers, 30000);
    return () => clearInterval(interval);
  }, [profile?.orgId]);

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      await api.patch(`/users/${userId}`, { role: newRole });
      fetchMembers();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove this user from your organization?')) return;
    try {
      await api.delete(`/users/${userId}`);
      fetchMembers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const copyInviteCode = () => {
    if (profile?.orgId) {
      navigator.clipboard.writeText(profile.orgId);
      alert('Organization ID copied to clipboard! Share this with your team members so they can join.');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.displayName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Admin Control Center
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage user permissions and system access for your organization.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button 
            onClick={copyInviteCode}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
          >
            <Mail className="w-5 h-5 text-blue-600" />
            <span>Copy Join Code</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Admins', value: users.filter(u => u.role === 'admin' || u.role === 'owner').length, icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Editors', value: users.filter(u => u.role === 'editor').length, icon: Edit2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Viewers', value: users.filter(u => u.role === 'viewer').length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
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

      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-5 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-5 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-5 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id || (user as any)._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black">
                        {(user.displayName || user.email[0]).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{user.displayName || 'No Name'}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <select 
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id || (user as any)._id, e.target.value as UserRole)}
                      className="bg-gray-50 dark:bg-gray-900 border-none rounded-lg px-2 py-1 text-xs font-bold uppercase"
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => handleDeleteUser(user.id || (user as any)._id)}
                      disabled={user.role === 'owner'}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
