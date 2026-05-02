import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  ArrowRight, 
  Loader2, 
  Globe,
  Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '../layout/Logo';

const ORG_TYPES = [
  'Religious Organization',
  'Non-profit/NGO',
  'Education',
  'Business',
  'Political Organization',
  'Others'
];

export function CompleteProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: '',
    name: '',
    state: '',
    city: '',
    email: user?.email || '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const orgId = `org_${Math.random().toString(36).substring(2, 11)}`;
      
      // Create Organization
      await setDoc(doc(db, 'organizations', orgId), {
        id: orgId,
        name: formData.name,
        type: formData.type,
        state: formData.state,
        city: formData.city,
        email: formData.email,
        phone: formData.phone,
        ownerId: user.uid,
        settings: {
          twilio: {},
          voice: { provider: 'elevenlabs' }
        },
        createdAt: Date.now()
      });

      // Update User Profile
      await updateDoc(doc(db, 'users', user.uid), {
        orgId: orgId,
        setupCompleted: true,
        displayName: formData.name // Using org name as initial display name or we could add a user name field
      });

      navigate('/');
    } catch (err: any) {
      console.error('Setup error:', err);
      setError(err.message || 'Failed to complete setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <Logo className="w-16 h-16 mx-auto shadow-xl shadow-blue-200 dark:shadow-none mb-6" size={64} />
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Complete Your Profile</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Let's set up your organization to get started with ReachOut</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl shadow-gray-200 dark:shadow-none border border-gray-100 dark:border-gray-800">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-bold animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Org Type */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-700 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Type of Organization
                </label>
                <select
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="" className="bg-white dark:bg-gray-900 text-gray-500">Select a type...</option>
                  {ORG_TYPES.map(type => (
                    <option key={type} value={type} className="bg-white dark:bg-gray-900">{type}</option>
                  ))}
                </select>
              </div>

              {/* Org Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-700 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Name of Organization
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grace Foundation"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* State */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-700 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  State
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. California"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-700 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  City/Town
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. San Francisco"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-700 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="contact@org.com"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-700 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 dark:shadow-none flex items-center justify-center gap-3 group disabled:opacity-50 mt-8"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>Complete Setup</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
