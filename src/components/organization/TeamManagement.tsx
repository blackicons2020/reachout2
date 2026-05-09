import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, MapPin, BarChart3, Mail, Phone, ExternalLink } from 'lucide-react';
import { teamService } from '../../services/teamService';
import { Member } from '../../types';

export const TeamManagement: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'member',
    department: '',
    regions: ''
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const data = await teamService.getMembers();
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await teamService.inviteMember({
        ...inviteForm,
        regions: inviteForm.regions.split(',').map(r => r.trim())
      });
      
      // Only open WhatsApp manually if automated send failed or wasn't configured
      if (!result.automatedSend && result.whatsappUrl) {
        window.open(result.whatsappUrl, '_blank');
      }
      
      setShowInvite(false);
      fetchMembers();
      
      if (result.automatedSend) {
        alert('Invitation sent automatically via WhatsApp API!');
      } else {
        alert('Invitation link generated! Opening WhatsApp for manual send...');
      }
    } catch (error) {
      console.error('Failed to invite member:', error);
      alert('Failed to send invitation.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Team Management</h1>
          <p className="text-gray-500 font-medium">Manage organization members, roles, and performance</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 transition-all"
        >
          <UserPlus className="w-5 h-5" />
          Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Users} label="Total Members" value={members.length} color="bg-blue-500" />
        <StatCard icon={Shield} label="Admins" value={members.filter(m => m.role === 'admin').length} color="bg-purple-500" />
        <StatCard icon={BarChart3} label="Avg Performance" value={`${Math.round(members.reduce((acc, m) => acc + (m.performanceScore || 0), 0) / (members.length || 1))}%`} color="bg-green-500" />
        <StatCard icon={MapPin} label="Active Regions" value={new Set(members.flatMap(m => m.assignedRegions)).size} color="bg-orange-500" />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Member</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Role & Dept</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Regions</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Performance</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Follow-ups</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-400">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full w-fit mb-1 ${
                      member.role === 'admin' ? 'bg-purple-50 text-purple-600' : 
                      member.role === 'manager' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'
                    }`}>
                      {member.role.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">{member.department || 'General'}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-1">
                    {member.assignedRegions.map((region, i) => (
                      <span key={i} className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
                        {region}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-24">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${member.performanceScore}%` }}
                      />
                    </div>
                    <span className="font-bold text-gray-700">{member.performanceScore}%</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm font-bold text-gray-900">{member.totalCompletedFollowUps}</div>
                  <div className="text-xs text-gray-400">{member.successfulCalls} successful</div>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-xl font-bold text-gray-900">Invite Team Member</h3>
              <p className="text-sm text-gray-500">Member will receive an invite via WhatsApp</p>
            </div>
            <form onSubmit={handleInvite} className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                  value={inviteForm.name}
                  onChange={e => setInviteForm({...inviteForm, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                  <input
                    required
                    type="email"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                    value={inviteForm.email}
                    onChange={e => setInviteForm({...inviteForm, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phone (WhatsApp)</label>
                  <input
                    required
                    type="tel"
                    placeholder="+234..."
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                    value={inviteForm.phone}
                    onChange={e => setInviteForm({...inviteForm, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all bg-white"
                    value={inviteForm.role}
                    onChange={e => setInviteForm({...inviteForm, role: e.target.value})}
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="member">Member</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                    value={inviteForm.department}
                    onChange={e => setInviteForm({...inviteForm, department: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Regions (comma separated)</label>
                <input
                  type="text"
                  placeholder="Lagos, Abuja, Ward A..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                  value={inviteForm.regions}
                  onChange={e => setInviteForm({...inviteForm, regions: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-gray-100`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="text-2xl font-black text-gray-900">{value}</div>
    <div className="text-sm font-semibold text-gray-400">{label}</div>
  </div>
);
