import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  ArrowRight, 
  Loader2, 
  Globe,
  Tag,
  User,
  Shield,
  GraduationCap,
  Briefcase,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '../layout/Logo';

const ORG_TYPES = [
  { label: 'Religious Organization', value: 'religious' },
  { label: 'Political Organization', value: 'political' },
  { label: 'Government Agency', value: 'government' },
  { label: 'Business/Commercial', value: 'business' },
  { label: 'Academic Institution', value: 'academic' }
];

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

export function CompleteProfile() {
  const { user, organization, refreshAuth } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = user?.role === 'owner';
  const orgType = isOwner ? null : organization?.type;

  const [formData, setFormData] = useState({
    // Personal Info
    name: user?.displayName || '',
    gender: '',
    department: '',
    lga: '',
    ward: '',
    registrationNumber: '',
    office: '',
    // Org Info
    orgType: '',
    orgName: '',
    orgState: '',
    orgCity: '',
    orgEmail: user?.email || '',
    orgPhone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      await api.post('/auth/complete-profile', formData);
      await refreshAuth?.();
      navigate('/');
    } catch (err: any) {
      console.error('Setup error:', err);
      setError(err.response?.data?.message || 'Failed to complete setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center">
          <Logo className="w-10 h-10 mx-auto mb-4" size={40} />
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">
            {isOwner ? 'Set Up Your Organization' : 'Complete Your Profile'}
          </h1>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
            {isOwner ? 'Configure your workspace to get started' : `Join ${organization?.name || 'the team'} as a member`}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Personal Details</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text" required placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white text-sm"
                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Gender</label>
                  <select
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white text-sm"
                    value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="">Select gender...</option>
                    {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                {/* Specialized Personal Fields based on Org Type */}
                {orgType === 'religious' && (
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Department / Unit</label>
                    <input
                      type="text" required placeholder="e.g. Media Unit, Choir"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white text-sm"
                      value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                )}

                {orgType === 'political' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">LGA</label>
                      <input
                        type="text" required placeholder="Local Government Area"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white text-sm"
                        value={formData.lga} onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ward</label>
                      <input
                        type="text" required placeholder="Ward Name/Number"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white text-sm"
                        value={formData.ward} onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {orgType === 'academic' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Department</label>
                      <input
                        type="text" required placeholder="e.g. Computer Science"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white text-sm"
                        value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Registration Number</label>
                      <input
                        type="text" required placeholder="ID / Matric Number"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white text-sm"
                        value={formData.registrationNumber} onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {orgType === 'business' && (
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Department</label>
                    <input
                      type="text" required placeholder="e.g. Sales, Marketing"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white text-sm"
                      value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                )}

                {orgType === 'government' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Office</label>
                      <input
                        type="text" required placeholder="e.g. Director's Office"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white text-sm"
                        value={formData.office} onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Department</label>
                      <input
                        type="text" required placeholder="e.g. Administration"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white text-sm"
                        value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Organization Section (Only for Owners) */}
            {isOwner && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Organization Setup</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Org Type</label>
                    <select
                      required
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white text-sm"
                      value={formData.orgType} onChange={(e) => setFormData({ ...formData, orgType: e.target.value })}
                    >
                      <option value="">Select type...</option>
                      {ORG_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Org Name</label>
                    <input
                      type="text" required placeholder="e.g. Grace Foundation"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white text-sm"
                      value={formData.orgName} onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">State</label>
                    <input
                      type="text" required placeholder="e.g. California"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white text-sm"
                      value={formData.orgState} onChange={(e) => setFormData({ ...formData, orgState: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">City</label>
                    <input
                      type="text" required placeholder="e.g. San Francisco"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white text-sm"
                      value={formData.orgCity} onChange={(e) => setFormData({ ...formData, orgCity: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 dark:shadow-none flex items-center justify-center gap-3 group disabled:opacity-50 mt-4"
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
