import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Tag, Users, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Contact } from '@/types';

interface ContactFormProps {
  contact?: Contact | null;
  onSave: (contact: Partial<Contact>) => void;
  onClose: () => void;
}

export function ContactForm({ contact, onSave, onClose }: ContactFormProps) {
  const [firstName, setFirstName] = useState(contact?.firstName || '');
  const [lastName, setLastName] = useState(contact?.lastName || '');
  const [phone, setPhone] = useState(contact?.phone || '');
  const [email, setEmail] = useState(contact?.email || '');
  const [city, setCity] = useState(contact?.city || '');
  const [state, setState] = useState(contact?.state || '');
  const [tags, setTags] = useState<string>(contact?.tags?.join(', ') || '');
  const [groups, setGroups] = useState<string>(contact?.groups?.join(', ') || '');
  const [status, setStatus] = useState<Contact['status']>(contact?.status || 'active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      firstName,
      lastName,
      phone,
      email,
      city,
      state,
      tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      groups: groups.split(',').map(g => g.trim()).filter(g => g !== ''),
      status
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
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{contact ? 'Update Contact' : 'Save Contact'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
