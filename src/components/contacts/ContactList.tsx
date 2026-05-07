import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
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
  onImportContacts,
  canManage = true,
  organizationType = 'business'
}: ContactListProps & { organizationType?: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'lastContacted' | 'status' | 'location'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [newTag, setNewTag] = useState('');

  const availableTags = Array.from(new Set(contacts.flatMap(c => c.tags || []))).sort();

  const filteredAndSortedContacts = contacts
    .filter(contact => {
      const matchesSearch = `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        contact.city?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
      const matchesTag = tagFilter === 'all' || (contact.tags || []).includes(tagFilter);

      return matchesSearch && matchesStatus && matchesTag;
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
        comparison = (a.city || '').localeCompare(b.city || '');
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
      setSelectedContacts(filteredAndSortedContacts.map(c => c.id || (c as any)._id));
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {organizationType === 'religious' ? 'Souls Database' : 
             organizationType === 'political' ? 'Voter Database' : 
             'Contacts'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your organization's contact list and data.</p>
        </div>
        {canManage && (
          <div className="flex items-center gap-3">
            <button onClick={onImportContacts} className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg hover:bg-gray-50 transition-colors font-bold text-sm"><Upload className="w-4 h-4" /><span>Import</span></button>
            <button onClick={onAddContact} className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 dark:shadow-none"><Plus className="w-4 h-4" /><span>Add Contact</span></button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-4 bg-gray-50/50 dark:bg-gray-900/50">
          {selectedContacts.length > 0 ? (
            <div className="flex-1 flex items-center gap-4 animate-in slide-in-from-left-2 text-gray-900 dark:text-gray-100">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">{selectedContacts.length} selected</span>
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <Tag className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                  <input type="text" placeholder="Add tag..." className="pl-9 pr-10 py-1.5 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg outline-none w-36" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && newTag.trim()) { onBulkAddTag(selectedContacts, newTag.trim()); setNewTag(''); setSelectedContacts([]); } }} />
                  <button onClick={() => { if (newTag.trim()) { onBulkAddTag(selectedContacts, newTag.trim()); setNewTag(''); setSelectedContacts([]); } }} className="absolute right-2 p-1 text-blue-600"><Plus className="w-4 h-4" /></button>
                </div>
                <button onClick={() => { onBulkDelete(selectedContacts); setSelectedContacts([]); }} className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"><Trash2 className="w-4 h-4" /><span>Delete</span></button>
              </div>
              <button onClick={() => setSelectedContacts([])} className="ml-auto text-sm text-gray-500 hover:text-gray-700">Clear</button>
            </div>
          ) : (
            <>
              <div className="relative flex-1 min-w-[300px] group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input type="text" placeholder="Search by name, phone, or location..." className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-800 dark:bg-slate-950 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <button onClick={() => setShowFilters(!showFilters)} className={cn("flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors font-bold text-sm", showFilters ? "bg-blue-600 border-blue-600 text-white" : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-800 hover:bg-gray-50")}>
                <Filter className="w-4 h-4" /><span>Filters</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg hover:bg-gray-50 font-bold text-sm"><Download className="w-4 h-4" /><span>Export</span></button>
            </>
          )}
        </div>

        {showFilters && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-950 grid grid-cols-2 gap-4 animate-in slide-in-from-top duration-200">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"><option value="all">All Statuses</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="lead">Lead</option><option value="customer">Customer</option></select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tag</label>
              <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"><option value="all">All Tags</option>{availableTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}</select>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-3 w-10"><input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={selectedContacts.length === filteredAndSortedContacts.length && filteredAndSortedContacts.length > 0} onChange={toggleSelectAll} /></th>
                <th className="px-6 py-3"><button onClick={() => toggleSort('name')} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-blue-600">Name {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}</button></th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3"><button onClick={() => toggleSort('location')} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-blue-600">City {sortBy === 'location' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}</button></th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</th>
                <th className="px-6 py-3"><button onClick={() => toggleSort('status')} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-blue-600">Status {sortBy === 'status' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}</button></th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedContacts.map((contact) => (
                <tr key={contact.id || (contact as any)._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group">
                  <td className="px-6 py-4"><input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={selectedContacts.includes(contact.id || (contact as any)._id)} onChange={() => toggleSelectContact(contact.id || (contact as any)._id)} /></td>
                  <td className="px-6 py-4">
                    <button onClick={() => onEditContact(contact)} className="flex items-center gap-3 hover:text-blue-600 transition-colors group/name">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold text-xs group-hover/name:bg-blue-600 group-hover/name:text-white transition-all uppercase">{(contact.firstName?.[0] || 'U')}</div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{contact.firstName} {contact.lastName}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-medium">{contact.phone}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">{contact.city || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map(tag => <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] rounded-full border border-gray-200 dark:border-gray-600">{tag}</span>)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", contact.status === 'active' ? "bg-green-50 text-green-600" : contact.status === 'inactive' ? "bg-gray-50 text-gray-600" : "bg-blue-50 text-blue-600")}>
                      {contact.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onEditContact(contact)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                      {canManage && <button onClick={() => onDeleteContact(contact.id || (contact as any)._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>}
                    </div>
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
