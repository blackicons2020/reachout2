import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Mail, 
  Phone, 
  Tag,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Users,
  Trash2,
  Edit2,
  CheckSquare,
  Eye,
  ArrowUp,
  ArrowDown,
  MapPin,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Contact } from '@/types';

interface ContactListProps {
  contacts: Contact[];
  onAddContact: () => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkAddTag: (ids: string[], tag: string) => void;
  onBulkAddGroup: (ids: string[], group: string) => void;
  onImportContacts: () => void;
  canManage?: boolean;
}

export function ContactList({ 
  contacts, 
  onAddContact, 
  onEditContact, 
  onDeleteContact, 
  onBulkDelete,
  onBulkAddTag,
  onBulkAddGroup,
  onImportContacts,
  canManage = true
}: ContactListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'lastContacted' | 'status' | 'location'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');

  const [newTag, setNewTag] = useState('');
  const [newGroup, setNewGroup] = useState('');

  const availableGroups = Array.from(new Set(contacts.flatMap(c => c.groups))).sort();
  const availableTags = Array.from(new Set(contacts.flatMap(c => c.tags))).sort();

  const filteredAndSortedContacts = contacts
    .filter(contact => {
      const matchesSearch = `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.state?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
      const matchesGroup = groupFilter === 'all' || (contact.groups || []).includes(groupFilter);
      const matchesTag = tagFilter === 'all' || (contact.tags || []).includes(tagFilter);

      return matchesSearch && matchesStatus && matchesGroup && matchesTag;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      } else if (sortBy === 'createdAt') {
        comparison = (a.createdAt || 0) - (b.createdAt || 0);
      } else if (sortBy === 'lastContacted') {
        comparison = (a.lastContactedAt || 0) - (b.lastContactedAt || 0);
      } else if (sortBy === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      } else if (sortBy === 'location') {
        comparison = `${a.city || ''} ${a.state || ''}`.localeCompare(`${b.city || ''} ${b.state || ''}`);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedContacts.length === filteredAndSortedContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredAndSortedContacts.map(c => c.id));
    }
  };

  const toggleSelectContact = (id: string) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter(cId => cId !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your organization's contact list and groups.</p>
        </div>
        {canManage && (
          <div className="flex items-center gap-3">
            <button 
              onClick={onImportContacts}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-bold text-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
            <button 
              onClick={onAddContact}
              className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-4 bg-gray-50/50 dark:bg-gray-900/50">
          {selectedContacts.length > 0 ? (
            <div className="flex-1 flex items-center gap-4 animate-in slide-in-from-left-2 text-gray-900 dark:text-gray-100">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                {selectedContacts.length} selected
              </span>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-2" />
              <div className="flex items-center gap-2">
                {canManage && (
                  <div className="flex items-center gap-2">
                    <div className="relative flex items-center">
                      <Tag className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                      <input 
                        type="text"
                        placeholder="Add tag..."
                        className="pl-9 pr-10 py-1.5 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-36"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newTag.trim()) {
                            onBulkAddTag(selectedContacts, newTag.trim());
                            setNewTag('');
                            setSelectedContacts([]);
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          if (newTag.trim()) {
                            onBulkAddTag(selectedContacts, newTag.trim());
                            setNewTag('');
                            setSelectedContacts([]);
                          }
                        }}
                        className="absolute right-2 p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="relative flex items-center">
                      <Users className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                      <input 
                        type="text"
                        list="available-groups"
                        placeholder="Add to group..."
                        className="pl-9 pr-10 py-1.5 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-40"
                        value={newGroup}
                        onChange={(e) => setNewGroup(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newGroup.trim()) {
                            onBulkAddGroup(selectedContacts, newGroup.trim());
                            setNewGroup('');
                            setSelectedContacts([]);
                          }
                        }}
                      />
                      <datalist id="available-groups">
                        {availableGroups.map(g => <option key={g} value={g} className="bg-white dark:bg-gray-800" />)}
                      </datalist>
                      <button 
                        onClick={() => {
                          if (newGroup.trim()) {
                            onBulkAddGroup(selectedContacts, newGroup.trim());
                            setNewGroup('');
                            setSelectedContacts([]);
                          }
                        }}
                        className="absolute right-2 p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                {canManage && (
                  <button 
                    onClick={() => {
                      onBulkDelete(selectedContacts);
                      setSelectedContacts([]);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Selected</span>
                  </button>
                )}
              </div>
              <button 
                onClick={() => setSelectedContacts([])}
                className="ml-auto text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Clear selection
              </button>
            </div>
          ) : (
            <>
              <div className="relative flex-1 min-w-[300px] group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="Search by name, phone, email, or location..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-800 dark:bg-slate-950 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:placeholder:text-slate-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors font-bold text-sm",
                  showFilters 
                    ? "bg-blue-600 border-blue-600 text-white" 
                    : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-bold text-sm">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </>
          )}
        </div>

        {showFilters && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-950 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in slide-in-from-top duration-200">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="lead">Lead</option>
                <option value="customer">Customer</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Group</label>
              <select 
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Groups</option>
                {availableGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tag</label>
              <select 
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Tags</option>
                {availableTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-3 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 dark:border-gray-800 text-blue-600 focus:ring-blue-500 dark:bg-gray-900"
                    checked={selectedContacts.length === filteredAndSortedContacts.length && filteredAndSortedContacts.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-3">
                  <button onClick={() => toggleSort('name')} className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-blue-600 transition-colors">
                    Name
                    {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </button>
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3">
                  <button onClick={() => toggleSort('location')} className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-blue-600 transition-colors">
                    Location
                    {sortBy === 'location' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </button>
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tags</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Groups</th>
                <th className="px-6 py-3">
                  <button onClick={() => toggleSort('lastContacted')} className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-blue-600 transition-colors">
                    Last Contacted
                    {sortBy === 'lastContacted' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </button>
                </th>
                <th className="px-6 py-3">
                  <button onClick={() => toggleSort('status')} className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-blue-600 transition-colors">
                    Status
                    {sortBy === 'status' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </button>
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">View</th>
                {canManage && <th className="px-6 py-3 w-10"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => toggleSelectContact(contact.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => onEditContact(contact)}
                      className="flex items-center gap-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group/name"
                    >
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold text-xs group-hover/name:bg-blue-600 group-hover/name:text-white transition-all uppercase">
                        {(contact.firstName?.[0] || '')}{(contact.lastName?.[0] || contact.email?.[0] || 'U')}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100 group-hover/name:text-blue-600 dark:group-hover/name:text-blue-400">{contact.firstName} {contact.lastName}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{contact.phone}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{contact.email || '-'}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm">
                        {contact.city || contact.state ? (
                          `${contact.city || ''}${contact.city && contact.state ? ', ' : ''}${contact.state || ''}`
                        ) : (
                          '-'
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {contact.groups.map(group => (
                        <span key={group} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full border border-blue-100 dark:border-blue-800">
                          {group}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {contact.lastContactedAt ? new Date(contact.lastContactedAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      contact.status === 'active' ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400" :
                      contact.status === 'inactive' ? "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400" :
                      contact.status === 'lead' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                      "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                    )}>
                      {contact.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => onEditContact(contact)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {canManage && (
                        <button 
                          onClick={() => onDeleteContact(contact.id)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete Contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                  {canManage && (
                    <td className="px-6 py-4 relative text-gray-900 dark:text-white">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === contact.id ? null : contact.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {activeMenu === contact.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setActiveMenu(null)}
                          />
                          <div className="absolute right-6 top-10 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                            <button 
                              onClick={() => {
                                onEditContact(contact);
                                setActiveMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center gap-2"
                            >
                              <Tag className="w-4 h-4 text-gray-400" />
                              <span>Edit Contact</span>
                            </button>
                            <button 
                              onClick={() => {
                                onDeleteContact(contact.id);
                                setActiveMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                              <span>Delete Contact</span>
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {filteredAndSortedContacts.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-slate-800">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                      <p className="text-lg font-medium">No contacts found</p>
                      <p className="text-sm">Try adjusting your search or add a new contact.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/50">
          <span>Showing {filteredAndSortedContacts.length} of {contacts.length} contacts</span>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-gray-300 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 border border-gray-300 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
