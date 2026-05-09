import React, { useState, useEffect } from 'react';
import { Phone, CheckCircle, Clock, Star, MessageSquare, AlertCircle, Search, Filter, PhoneCall } from 'lucide-react';
import { teamService } from '../../services/teamService';
import api from '../../lib/api';
import { Contact } from '../../types';
import { CallLogModal } from '../contacts/CallLogModal';

export const MemberDashboard: React.FC = () => {
  const [assignedContacts, setAssignedContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAssignedContacts();
  }, []);

  const fetchAssignedContacts = async () => {
    try {
      // In a real app, the backend would filter by the logged-in member
      // For now we get all contacts
      const response = await api.get('/contacts');
      setAssignedContacts(response.data); 
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = assignedContacts.filter(c => {
    const matchesSearch = `${c.firstName} ${c.lastName} ${c.phone}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || c.followUpStatus === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">My Follow-ups</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Manage your assigned contacts and engagement tasks</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 dark:text-white rounded-2xl focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/10 outline-none transition-all shadow-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm">
            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact List */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <FilterButton active={filter === 'all'} label="All" onClick={() => setFilter('all')} />
            <FilterButton active={filter === 'not_called'} label="Pending" onClick={() => setFilter('not_called')} />
            <FilterButton active={filter === 'reached'} label="Reached" onClick={() => setFilter('reached')} />
            <FilterButton active={filter === 'follow_up_later'} label="Later" onClick={() => setFilter('follow_up_later')} />
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : filteredContacts.length > 0 ? (
            filteredContacts.map(contact => (
              <div 
                key={contact.id} 
                className={`p-6 bg-white dark:bg-gray-900 rounded-3xl border transition-all hover:shadow-xl hover:shadow-gray-100 dark:hover:shadow-none group cursor-pointer ${
                  selectedContact?.id === contact.id ? 'border-blue-500 ring-4 ring-blue-50 dark:ring-blue-900/10' : 'border-gray-50 dark:border-gray-800'
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors text-xs">
                        {contact.firstName} {contact.lastName}
                      </h3>
                      <p className="text-sm text-gray-400 font-medium">
                        {contact.phone}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {contact.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] font-bold bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      contact.followUpStatus === 'reached' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                      contact.followUpStatus === 'called_no_answer' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}>
                      {(contact.followUpStatus || 'NOT CALLED').replace('_', ' ').toUpperCase()}
                    </span>
                    <p className="text-[10px] font-bold text-gray-300 dark:text-gray-600 mt-2 uppercase tracking-tighter">
                      AI Priority: {contact.engagementScore && contact.engagementScore > 70 ? 'High' : 'Medium'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-400 dark:text-gray-500">No contacts found</h3>
              <p className="text-gray-400 dark:text-gray-500">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>

        {/* Selected Contact Details / Activity */}
        <div className="space-y-6">
          {selectedContact ? (
            <>
              <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">{selectedContact.firstName} {selectedContact.lastName}</h2>
                  <p className="text-gray-400 font-medium">{selectedContact.city}, {selectedContact.state}</p>
                </div>

                <div className="flex flex-col gap-3 mb-8">
                  <button 
                    onClick={async () => {
                      try {
                        await api.post(`/contacts/${selectedContact._id}/call`);
                        alert('Connecting to your phone... Please answer to start the call.');
                      } catch (err) {
                        console.error(err);
                        alert('Failed to initiate call. Check your Twilio settings.');
                      }
                    }}
                    className="w-full py-4 bg-green-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-100 dark:shadow-none"
                  >
                    Call & Track AI
                  </button>
                  <button 
                    onClick={() => setIsLogModalOpen(true)}
                    className="w-full py-4 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-100 dark:shadow-none"
                  >
                    Manual Log Outcome
                  </button>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">AI Insights</h4>
                  <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed italic">
                      "Likely interested in upcoming community events. Suggest starting with a warm introduction regarding recent {selectedContact.tags[0] || 'outreach'}."
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-50 dark:border-gray-800">
                  <h4 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Follow-up History</h4>
                  <div className="space-y-4">
                    {selectedContact.followUpHistory && selectedContact.followUpHistory.length > 0 ? (
                      selectedContact.followUpHistory.map((history, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{history.callOutcome.replace('_', ' ')}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(history.timestamp).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{history.notes}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic">No history yet</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900/50 p-12 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 text-center">
              <PhoneCall className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 dark:text-gray-500 font-bold">Select a contact to view details and log activities</p>
            </div>
          )}
        </div>
      </div>

      {isLogModalOpen && selectedContact && (
        <CallLogModal 
          contact={selectedContact}
          onClose={() => setIsLogModalOpen(false)}
          onSuccess={fetchAssignedContacts}
        />
      )}
    </div>
  );
};

const FilterButton = ({ active, label, onClick }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
        : 'bg-white text-gray-400 hover:text-gray-600 border border-gray-50 shadow-sm'
    }`}
  >
    {label}
  </button>
);
