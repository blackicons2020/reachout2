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
  Calendar,
  Map,
  Star,
  Shield,
  Building2,
  Briefcase,
  GraduationCap
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
  organizationType?: string;
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
}: ContactListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [newTag, setNewTag] = useState('');

  const availableTags = Array.from(new Set(contacts.flatMap(c => c.tags || []))).sort();

  const filteredAndSortedContacts = contacts
    .filter(contact => {
      const matchesSearch = 
        `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        contact.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.lga?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.department?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
      const matchesTag = tagFilter === 'all' || (contact.tags || []).includes(tagFilter);

      return matchesSearch && matchesStatus && matchesTag;
    })
    .sort((a, b) => {
      let comparison = 0;
      const valA = (a as any)[sortBy] || '';
      const valB = (b as any)[sortBy] || '';
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      } else {
        comparison = (valA || 0) - (valB || 0);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleSort = (field: string) => {
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

  // Dynamic Column Helper
  const renderColumns = () => {
    const baseCols = [
      { id: 'name', label: 'Name', sortable: true },
      { id: 'phone', label: 'Phone', sortable: false },
    ];

    let dynamicCols: any[] = [];
    if (organizationType === 'religious') {
      dynamicCols = [
        { id: 'location', label: 'Location', sortable: true },
        { id: 'outreachDate', label: 'Outreach Date', sortable: true },
        { id: 'source', label: 'Source', sortable: true },
      ];
    } else if (organizationType === 'political') {
      dynamicCols = [
        { id: 'state', label: 'State', sortable: true },
        { id: 'lga', label: 'LGA', sortable: true },
        { id: 'ward', label: 'Ward', sortable: true },
      ];
    } else if (organizationType === 'government') {
      dynamicCols = [
        { id: 'state', label: 'State', sortable: true },
        { id: 'lga', label: 'LGA', sortable: true },
        { id: 'ward', label: 'Ward', sortable: true },
        { id: 'occupation', label: 'Occupation', sortable: true },
      ];
    } else if (organizationType === 'business') {
      dynamicCols = [
        { id: 'customerType', label: 'Type', sortable: true },
        { id: 'engagementScore', label: 'Eng. Score', sortable: true },
      ];
    } else if (organizationType === 'academic') {
      dynamicCols = [
        { id: 'department', label: 'Department', sortable: true },
        { id: 'level', label: 'Level', sortable: true },
        { id: 'faculty', label: 'Faculty', sortable: true },
      ];
    }

    return [...baseCols, ...dynamicCols, { id: 'status', label: 'Status', sortable: true }];
  };

  const columns = renderColumns();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {organizationType === 'religious' ? <Star className="w-4 h-4 text-amber-500" /> :
             organizationType === 'political' ? <Shield className="w-4 h-4 text-blue-600" /> :
             organizationType === 'government' ? <Building2 className="w-4 h-4 text-indigo-600" /> :
             organizationType === 'business' ? <Briefcase className="w-4 h-4 text-emerald-600" /> :
             <GraduationCap className="w-4 h-4 text-purple-600" />}
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Database Management</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
            {organizationType === 'religious' ? 'Souls Database' : 
             organizationType === 'political' ? 'Voter Database' : 
             organizationType === 'government' ? 'Citizens Database' :
             organizationType === 'business' ? 'Customers' :
             organizationType === 'academic' ? 'Students Database' :
             'Contacts'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">
            Manage your organization's verified contact list and specialized data.
          </p>
        </div>
        {canManage && (
          <div className="flex items-center gap-3">
            <button onClick={onImportContacts} className="flex items-center gap-2 px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-2xl hover:bg-gray-50 transition-all font-black uppercase text-[10px] tracking-widest shadow-sm">
              <Upload className="w-4 h-4" /><span>Import</span>
            </button>
            <button onClick={onAddContact} className="flex items-center gap-2 px-6 py-2.5 text-white bg-blue-600 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none font-black uppercase text-[10px] tracking-widest">
              <Plus className="w-4 h-4" /><span>Add Contact</span>
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-4 bg-gray-50/50 dark:bg-gray-950/50">
          {selectedContacts.length > 0 ? (
            <div className="flex-1 flex items-center gap-4 animate-in slide-in-from-left-2 text-gray-900 dark:text-gray-100">
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 rounded-full uppercase tracking-widest">{selectedContacts.length} selected</span>
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <Tag className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                  <input type="text" placeholder="Add tag..." className="pl-9 pr-10 py-2 text-xs font-bold border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl outline-none w-48 focus:ring-2 focus:ring-blue-500 transition-all uppercase tracking-tight" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && newTag.trim()) { onBulkAddTag(selectedContacts, newTag.trim()); setNewTag(''); setSelectedContacts([]); } }} />
                  <button onClick={() => { if (newTag.trim()) { onBulkAddTag(selectedContacts, newTag.trim()); setNewTag(''); setSelectedContacts([]); } }} className="absolute right-2 p-1 text-blue-600"><Plus className="w-4 h-4" /></button>
                </div>
                <button onClick={() => { onBulkDelete(selectedContacts); setSelectedContacts([]); }} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-[10px] font-black uppercase tracking-widest"><Trash2 className="w-4 h-4" /><span>Delete</span></button>
              </div>
              <button onClick={() => setSelectedContacts([])} className="ml-auto text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-700">Clear Selection</button>
            </div>
          ) : (
            <>
              <div className="relative flex-1 min-w-[300px] group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input type="text" placeholder="Search by name, phone, lga, department..." className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-gray-800 dark:text-white rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium shadow-inner" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <button onClick={() => setShowFilters(!showFilters)} className={cn("flex items-center gap-2 px-5 py-3 border rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest shadow-sm", showFilters ? "bg-blue-600 border-blue-600 text-white" : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-800 hover:bg-gray-50")}>
                <Filter className="w-4 h-4" /><span>Filters</span>
              </button>
              <button className="flex items-center gap-2 px-5 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-2xl hover:bg-gray-50 font-black uppercase text-[10px] tracking-widest shadow-sm"><Download className="w-4 h-4" /><span>Export</span></button>
            </>
          )}
        </div>

        {showFilters && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-950 grid grid-cols-2 gap-6 animate-in slide-in-from-top duration-200">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Status Filter</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-4 py-3 text-sm font-bold bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="engaged">Engaged</option>
                <option value="cold">Cold</option>
                <option value="converted">Converted</option>
                <option value="lead">Lead</option>
                <option value="customer">Customer</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tag Filter</label>
              <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="w-full px-4 py-3 text-sm font-bold bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Tags</option>
                {availableTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                <th className="px-8 py-4 w-10"><input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={selectedContacts.length === filteredAndSortedContacts.length && filteredAndSortedContacts.length > 0} onChange={toggleSelectAll} /></th>
                {columns.map(col => (
                  <th key={col.id} className="px-6 py-4">
                    {col.sortable ? (
                      <button onClick={() => toggleSort(col.id)} className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                        {col.label} {sortBy === col.id && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </button>
                    ) : (
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{col.label}</span>
                    )}
                  </th>
                ))}
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredAndSortedContacts.map((contact) => (
                <tr key={contact.id || (contact as any)._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all group">
                  <td className="px-8 py-5"><input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={selectedContacts.includes(contact.id || (contact as any)._id)} onChange={() => toggleSelectContact(contact.id || (contact as any)._id)} /></td>
                  <td className="px-6 py-5">
                    <button onClick={() => onEditContact(contact)} className="flex items-center gap-4 hover:text-blue-600 transition-all group/name">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-xs">{contact.firstName} {contact.lastName}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{contact.id?.slice(-6) || 'NEW'}</p>
                      </div>
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-bold text-xs">
                      {contact.phone}
                    </div>
                  </td>

                  {/* Render specialized cells */}
                  {organizationType === 'religious' && (
                    <>
                      <td className="px-6 py-5 text-gray-600 dark:text-gray-400 text-xs font-bold">{contact.location || contact.customFields?.location || '-'}</td>
                      <td className="px-6 py-5 text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase">{contact.outreachDate || contact.customFields?.outreachDate || '-'}</td>
                      <td className="px-6 py-5 text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase">{contact.source || contact.customFields?.source || '-'}</td>
                    </>
                  )}
                  {organizationType === 'political' && (
                    <>
                      <td className="px-6 py-5 text-gray-600 dark:text-gray-400 text-xs font-bold uppercase">{contact.state || '-'}</td>
                      <td className="px-6 py-5 text-gray-600 dark:text-gray-400 text-xs font-bold uppercase">{contact.lga || '-'}</td>
                      <td className="px-6 py-5 text-gray-600 dark:text-gray-400 text-xs font-bold uppercase">{contact.ward || '-'}</td>
                    </>
                  )}
                  {organizationType === 'government' && (
                    <>
                      <td className="px-6 py-5 text-gray-600 dark:text-gray-400 text-xs font-bold uppercase">{contact.state || '-'}</td>
                      <td className="px-6 py-5 text-gray-600 dark:text-gray-400 text-xs font-bold uppercase">{contact.lga || '-'}</td>
                      <td className="px-6 py-5 text-gray-600 dark:text-gray-400 text-xs font-bold uppercase">{contact.ward || '-'}</td>
                      <td className="px-6 py-5 text-gray-600 dark:text-gray-400 text-xs font-bold uppercase">{contact.occupation || '-'}</td>
                    </>
                  )}
                  {organizationType === 'business' && (
                    <>
                      <td className="px-6 py-5 text-gray-600 dark:text-gray-400 text-xs font-bold uppercase">{contact.customerType || '-'}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 w-16 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${contact.engagementScore || 0}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{contact.engagementScore || 0}</span>
                        </div>
                      </td>
                    </>
                  )}
                  {organizationType === 'academic' && (
                    <>
                      <td className="px-6 py-5 text-gray-600 dark:text-gray-400 text-xs font-bold uppercase">{contact.department || '-'}</td>
                      <td className="px-6 py-5 text-gray-600 dark:text-gray-400 text-xs font-bold uppercase">{contact.level || '-'}</td>
                      <td className="px-6 py-5 text-gray-600 dark:text-gray-400 text-xs font-bold uppercase">{contact.faculty || '-'}</td>
                    </>
                  )}

                  <td className="px-6 py-5">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      contact.status === 'active' ? "text-green-500" : 
                      contact.status === 'inactive' ? "text-gray-400" : 
                      contact.status === 'engaged' ? "text-blue-500" :
                      contact.status === 'cold' ? "text-red-400" :
                      "text-blue-500"
                    )}>
                      {contact.status || 'active'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onEditContact(contact)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all shadow-sm hover:shadow-md"><Edit2 className="w-4 h-4" /></button>
                      {canManage && <button onClick={() => onDeleteContact(contact.id || (contact as any)._id)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all shadow-sm hover:shadow-md"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedContacts.length === 0 && (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-950 rounded-3xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">No records found</h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
}
