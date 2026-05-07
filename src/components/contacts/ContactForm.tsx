import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Tag, Users, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Contact } from '@/types';

interface ContactFormProps {
  contact?: Contact | null;
  organizationType?: string;
  onSave: (contact: Partial<Contact>) => void;
  onClose: () => void;
}

export function ContactForm({ contact, organizationType, onSave, onClose }: ContactFormProps) {
  const [firstName, setFirstName] = useState(contact?.firstName || '');
  const [lastName, setLastName] = useState(contact?.lastName || '');
  const [phone, setPhone] = useState(contact?.phone || '');
  const [email, setEmail] = useState(contact?.email || '');
  const [city, setCity] = useState(contact?.city || '');
  const [state, setState] = useState(contact?.state || '');
  const [tags, setTags] = useState<string>(contact?.tags?.join(', ') || '');
  const [groups, setGroups] = useState<string>(contact?.groups?.join(', ') || '');
  const [status, setStatus] = useState<Contact['status']>(contact?.status || 'active');
  
  // Specific fields
  const [location, setLocation] = useState(contact?.location || '');
  const [source, setSource] = useState(contact?.source || '');
  const [lga, setLga] = useState(contact?.lga || '');
  const [ward, setWard] = useState(contact?.ward || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFirstName(contact?.firstName || '');
    setLastName(contact?.lastName || '');
    setPhone(contact?.phone || '');
    setEmail(contact?.email || '');
    setCity(contact?.city || '');
    setState(contact?.state || '');
    setTags(contact?.tags?.join(', ') || '');
    setGroups(contact?.groups?.join(', ') || '');
    setStatus(contact?.status || 'active');
    setLocation(contact?.location || '');
    setSource(contact?.source || '');
    setLga(contact?.lga || '');
    setWard(contact?.ward || '');
    setIsSaving(false);
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave({
      firstName,
      lastName,
      phone,
      email,
      city,
      state,
      tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      groups: groups.split(',').map(g => g.trim()).filter(g => g !== ''),
      status,
      location,
      source,
      lga,
      ward
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border dark:border-slate-800">
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-950/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{contact ? 'Edit Contact' : 'Add New Contact'}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Enter the details for this contact.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="contact-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    required
                    placeholder="John"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white dark:placeholder:text-slate-500"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Last Name</label>
                <input 
                  type="text"
                  required
                  placeholder="Doe"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white dark:placeholder:text-slate-500"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="tel"
                  required
                  placeholder="+234..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white dark:placeholder:text-slate-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Address (Optional)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="email"
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white dark:placeholder:text-slate-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">City</label>
                <input 
                  type="text"
                  placeholder="Lagos"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white dark:placeholder:text-slate-500"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">State</label>
                <input 
                  type="text"
                  placeholder="Lagos State"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white dark:placeholder:text-slate-500"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
            </div>

            {organizationType === 'religious' && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Location / Church Branch</label>
                  <input 
                    type="text"
                    placeholder="e.g. Main Sanctuary"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Outreach Source</label>
                  <input 
                    type="text"
                    placeholder="e.g. Street Evangelism"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                </div>
              </div>
            )}

            {organizationType === 'political' && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">LGA</label>
                  <input 
                    type="text"
                    placeholder="Local Government Area"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white"
                    value={lga}
                    onChange={(e) => setLga(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ward</label>
                  <input 
                    type="text"
                    placeholder="Ward Number/Name"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tags (comma separated)</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="VIP, Member, Lead"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white dark:placeholder:text-slate-500"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Groups (comma separated)</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Zone A, Choir, Staff"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white dark:placeholder:text-slate-500"
                  value={groups}
                  onChange={(e) => setGroups(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</label>
                <select 
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium dark:text-white"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="active" className="dark:bg-slate-950">Active</option>
                  <option value="inactive" className="dark:bg-slate-950">Inactive</option>
                  <option value="lead" className="dark:bg-slate-950">Lead</option>
                  <option value="customer" className="dark:bg-slate-950">Customer</option>
                  {organizationType === 'political' && (
                    <>
                      <option value="engaged" className="dark:bg-slate-950">Engaged</option>
                      <option value="cold" className="dark:bg-slate-950">Cold</option>
                      <option value="converted" className="dark:bg-slate-950">Converted</option>
                    </>
                  )}
                </select>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-gray-100 dark:border-slate-800 flex gap-3 bg-gray-50/50 dark:bg-slate-950/50">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-slate-800 rounded-xl transition-all border border-gray-200 dark:border-slate-700/50 bg-white dark:bg-slate-800"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="contact-form"
            disabled={isSaving}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving...' : (contact ? 'Update Contact' : 'Save Contact')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
