import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  Plus, 
  Link as LinkIcon, 
  MoreVertical, 
  Mail, 
  Shield, 
  Clock, 
  Smartphone,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Bell,
  Send,
  X,
  MessageSquare,
  Phone,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { Contact } from '@/types';

interface MembersProps {
  members: any[];
  contacts: Contact[];
  onInvite: (data: any) => void;
  onAssign: (memberId: string, groupName: string) => void;
  onDelete: (memberId: string) => void;
  onNotify: (data: { memberId?: string, message: string }) => void;
}

export default function Members({ members, contacts, onInvite, onAssign, onDelete, onNotify }: MembersProps) {
  const { profile } = useAuth();
  const role = profile?.role || 'owner';
  const canManageMembers = role === 'owner' || role === 'admin';

  const [isNotifying, setIsNotifying] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [viewingMember, setViewingMember] = useState<any>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [notificationText, setNotificationText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Invite Form State
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteChannel, setInviteChannel] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [inviteRole, setInviteRole] = useState('Field Agent');

  // Assign Form State
  const [assignMemberId, setAssignMemberId] = useState('');
  const [assignGroupName, setAssignGroupName] = useState('');

  const groups = Array.from(new Set(contacts.flatMap(c => c.groups))).sort();

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    // Call real notify prop
    onNotify({
      memberId: selectedMember?.id,
      message: notificationText
    });

    // Simulate sending UI
    setTimeout(() => {
      setIsSending(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsNotifying(false);
        setSelectedMember(null);
        setNotificationText('');
      }, 2000);
    }, 1000);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInvite({ 
      name: inviteName, 
      email: inviteEmail, 
      phone: invitePhone,
      channel: inviteChannel,
      role: inviteRole 
    });
    setIsInviting(false);
    setInviteName('');
    setInviteEmail('');
    setInvitePhone('');
    setInviteChannel('email');
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (assignMemberId && assignGroupName) {
      onAssign(assignMemberId, assignGroupName);
      setAssignMemberId('');
      setAssignGroupName('');
      alert('Contacts assigned successfully!');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Organization Members</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your team and their access levels.</p>
        </div>
        {canManageMembers && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setSelectedMember(null);
                setIsNotifying(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
            >
              <Bell className="w-4 h-4" />
              <span>Notify All</span>
            </button>
            <button 
              onClick={() => {
                const inviteLink = `${window.location.origin}/signup?invite=${profile?.orgId}`;
                navigator.clipboard.writeText(inviteLink);
                alert('Invitation link copied to clipboard!');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
            >
              <LinkIcon className="w-4 h-4" />
              <span>Invite via Link</span>
            </button>
            <button 
              onClick={() => setIsInviting(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              <Plus className="w-4 h-4" />
              <span>Invite Member</span>
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50 transition-colors">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search members..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-bold">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assigned Contacts</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">App</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                {canManageMembers && <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {members.map((member, i) => (
                <tr 
                  key={i} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group cursor-pointer"
                  onClick={() => {
                    setViewingMember(member);
                    setIsViewingDetails(true);
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold uppercase transition-transform group-hover:scale-110 shadow-sm">
                        {(member.name || member.email || 'U').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{member.name || member.email || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    <span className="text-sm font-medium">{member.role}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    <span className="text-sm font-medium">{member.assigned}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    <span className="text-sm">{member.lastActive}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      member.app === 'Installed' ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                    )}>
                      {member.app}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      member.status === 'Active' ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                    )}>
                      {member.status}
                    </span>
                  </td>
                  {canManageMembers && (
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 transition-opacity relative">
                        <button 
                          onClick={() => {
                            setSelectedMember(member);
                            setIsNotifying(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Send Notification"
                        >
                          <Bell className="w-5 h-5" />
                        </button>
                        <div className="relative">
                          <button 
                            onClick={() => setActiveMenuId(activeMenuId === member.id ? null : member.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            < MoreVertical className="w-5 h-5" />
                          </button>
                          
                          {activeMenuId === member.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setActiveMenuId(null)}
                              />
                              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button 
                                  onClick={() => {
                                    setViewingMember(member);
                                    setIsViewingDetails(true);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center gap-2"
                                >
                                  <Users className="w-4 h-4" />
                                  View Details
                                </button>
                                <button 
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to remove ${member.name}?`)) {
                                      onDelete(member.id);
                                    }
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remove Member
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {canManageMembers && (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Assign Contacts to Member</h3>
          <form onSubmit={handleAssignSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Select Member</label>
                <select 
                  required
                  value={assignMemberId}
                  onChange={(e) => setAssignMemberId(e.target.value)}
                  className="w-full p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                >
                  <option value="" className="dark:bg-gray-900">Choose a member...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id} className="dark:bg-gray-900">{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Select Contact Group</label>
                <select 
                  required
                  value={assignGroupName}
                  onChange={(e) => setAssignGroupName(e.target.value)}
                  className="w-full p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                >
                  <option value="" className="dark:bg-gray-900">Choose a group...</option>
                  <option value="All Contacts" className="dark:bg-gray-900">All Contacts</option>
                  {groups.map(g => (
                    <option key={g} value={g} className="dark:bg-gray-900">{g} ({contacts.filter(c => c.groups.includes(g)).length})</option>
                  ))}
                </select>
              </div>
            </div>
            <button 
              type="submit"
              className="mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none"
            >
              Assign Contacts
            </button>
          </form>
        </div>
      )}

      {/* Member Details Modal */}
      {isViewingDetails && viewingMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200 border dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center font-bold text-xl uppercase">
                  {(viewingMember.name || viewingMember.email || 'U').split(' ').filter(Boolean).map((n: any) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{viewingMember.name || viewingMember.email || 'Anonymous'}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{viewingMember.role}</span>
                    <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      viewingMember.status === 'Active' ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"
                    )}>
                      {viewingMember.status}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsViewingDetails(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/40">
                  <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-2">
                    <Users className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Assigned Group</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{viewingMember.assigned || 'None'}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    {contacts.filter(c => c.groups.includes(viewingMember.assigned)).length} Contacts
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-100 dark:border-green-900/40">
                  <div className="flex items-center gap-3 text-green-600 dark:text-green-400 mb-2">
                    <Send className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Messages Sent</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">124</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">89% Delivered</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40">
                  <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 mb-2">
                    <Phone className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Calls Made</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">42</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">32 Answered</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Assigned Contacts List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Assigned Contacts
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden text-gray-900 dark:text-gray-100">
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left">
                        <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800 z-10">
                          <tr>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Name</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {contacts.filter(c => c.groups.includes(viewingMember.assigned)).length > 0 ? (
                            contacts.filter(c => c.groups.includes(viewingMember.assigned)).map(contact => (
                              <tr key={contact.id} className="hover:bg-white dark:hover:bg-gray-800 transition-colors">
                                <td className="px-4 py-3">
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">{contact.firstName} {contact.lastName}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{contact.phone}</p>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-[10px] font-bold uppercase">
                                    {contact.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={2} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm italic">
                                No contacts assigned to this group.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {[
                      { type: 'call', contact: 'Amaka Adeola', time: '10 mins ago', outcome: 'Answered', duration: '2m 15s' },
                      { type: 'whatsapp', contact: 'John Smith', time: '1 hr ago', outcome: 'Read' },
                      { type: 'sms', contact: 'Sarah Kalu', time: '2 hrs ago', outcome: 'Delivered' },
                      { type: 'call', contact: 'Bode Okafor', time: 'Yesterday', outcome: 'No Answer', duration: '0s' },
                    ].map((activity, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-xl",
                            activity.type === 'call' ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" :
                            activity.type === 'whatsapp' ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400" :
                            "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          )}>
                            {activity.type === 'call' ? <Phone className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{activity.contact}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{activity.outcome}</p>
                          {activity.duration && <p className="text-[10px] text-gray-500 dark:text-gray-400">{activity.duration}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex gap-3 bg-gray-50/50 dark:bg-gray-900/50">
              <button 
                onClick={() => setIsViewingDetails(false)}
                className="w-full px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white font-bold rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-600 transition-all shadow-lg"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {isNotifying && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200 border dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedMember ? `Notify ${selectedMember.name}` : 'Notify All Members'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Send a push notification to the mobile app.</p>
              </div>
              <button 
                onClick={() => setIsNotifying(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-gray-900 dark:text-gray-100">
              <form id="notification-form" onSubmit={handleSendNotification} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Message Content</label>
                  <textarea 
                    required
                    value={notificationText}
                    onChange={(e) => setNotificationText(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[120px] font-medium dark:text-white placeholder:text-gray-400"
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex gap-3 bg-gray-50/50 dark:bg-gray-900/50">
              <button 
                type="button"
                onClick={() => setIsNotifying(false)}
                className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all bg-white dark:bg-gray-800"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="notification-form"
                disabled={isSending || showSuccess}
                className={cn(
                  "flex-1 px-6 py-3 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2",
                  showSuccess ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200",
                  isSending && "opacity-70 cursor-not-allowed"
                )}
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : showSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Sent!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Notification</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200 border dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invite New Member</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add a team member to your organization.</p>
              </div>
              <button 
                onClick={() => setIsInviting(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-gray-900 dark:text-gray-100">
              <form id="invite-form" onSubmit={handleInviteSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                  <input 
                    required
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium dark:text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
                  <input 
                    required={inviteChannel === 'email'}
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium dark:text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone Number (Optional for SMS/WhatsApp)</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      required={inviteChannel !== 'email'}
                      type="tel"
                      value={invitePhone}
                      onChange={(e) => setInvitePhone(e.target.value)}
                      placeholder="+234..."
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium dark:text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invitation Channel</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'email', label: 'Email', icon: Mail },
                      { id: 'sms', label: 'SMS', icon: MessageSquare },
                      { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone }
                    ].map((channel) => (
                      <button
                        key={channel.id}
                        type="button"
                        onClick={() => setInviteChannel(channel.id as any)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-[10px] font-bold uppercase",
                          inviteChannel === channel.id 
                            ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400" 
                            : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        )}
                      >
                        <channel.icon className="w-5 h-5" />
                        {channel.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</label>
                  <select 
                    required
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium dark:text-white"
                  >
                    <option className="bg-white dark:bg-gray-800">Field Agent</option>
                    <option className="bg-white dark:bg-gray-800">Campaign Sender</option>
                    <option className="bg-white dark:bg-gray-800">Caller</option>
                    <option className="bg-white dark:bg-gray-800">Viewer</option>
                    <option className="bg-white dark:bg-gray-800">Admin</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex gap-3 bg-gray-50/50 dark:bg-gray-900/50">
              <button 
                type="button"
                onClick={() => setIsInviting(false)}
                className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all bg-white dark:bg-gray-800"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="invite-form"
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
