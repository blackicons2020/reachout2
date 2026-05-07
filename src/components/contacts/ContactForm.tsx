import React, { useState, useEffect } from 'react';
import { X, User, Phone, Tag, MapPin, Save, Loader2, Map, Calendar, MessageSquare, Shield, Building2, GraduationCap, Briefcase, Star } from 'lucide-react';
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
  const [state, setState] = useState(contact?.state || '');
  const [city, setCity] = useState(contact?.city || '');
  const [tags, setTags] = useState<string>(contact?.tags?.join(', ') || '');
  const [status, setStatus] = useState<any>(contact?.status || 'active');
  const [notes, setNotes] = useState(contact?.notes || '');

  // Specialized Fields
  const [location, setLocation] = useState(contact?.location || '');
  const [outreachDate, setOutreachDate] = useState(contact?.outreachDate || '');
  const [source, setSource] = useState(contact?.source || '');
  const [prayerRequests, setPrayerRequests] = useState(contact?.prayerRequests || '');
  const [attendanceStatus, setAttendanceStatus] = useState(contact?.attendanceStatus || '');
  
  const [lga, setLga] = useState(contact?.lga || '');
  const [ward, setWard] = useState(contact?.ward || '');
  const [pollingUnit, setPollingUnit] = useState(contact?.pollingUnit || '');
  const [votingInterest, setVotingInterest] = useState(contact?.votingInterest || '');
  const [participationHistory, setParticipationHistory] = useState(contact?.participationHistory || '');

  const [occupation, setOccupation] = useState(contact?.occupation || '');
  const [community, setCommunity] = useState(contact?.community || '');
  const [feedbackHistory, setFeedbackHistory] = useState(contact?.feedbackHistory || '');

  const [customerType, setCustomerType] = useState(contact?.customerType || '');
  const [lastInteraction, setLastInteraction] = useState(contact?.lastInteraction || '');
  const [engagementScore, setEngagementScore] = useState(contact?.engagementScore || 0);
  const [purchaseHistory, setPurchaseHistory] = useState(contact?.purchaseHistory || '');

  const [department, setDepartment] = useState(contact?.department || '');
  const [level, setLevel] = useState(contact?.level || '');
  const [faculty, setFaculty] = useState(contact?.faculty || '');
  const [guardianContact, setGuardianContact] = useState(contact?.guardianContact || '');
  const [performanceCategory, setPerformanceCategory] = useState(contact?.performanceCategory || '');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (contact) {
      setFirstName(contact.firstName || '');
      setLastName(contact.lastName || '');
      setPhone(contact.phone || '');
      setEmail(contact.email || '');
      setState(contact.state || '');
      setCity(contact.city || '');
      setTags(contact.tags?.join(', ') || '');
      setStatus(contact.status || 'active');
      setNotes(contact.notes || '');
      
      // Load specialized fields
      setLocation(contact.location || '');
      setOutreachDate(contact.outreachDate || '');
      setSource(contact.source || '');
      setPrayerRequests(contact.prayerRequests || '');
      setAttendanceStatus(contact.attendanceStatus || '');
      setLga(contact.lga || '');
      setWard(contact.ward || '');
      setPollingUnit(contact.pollingUnit || '');
      setVotingInterest(contact.votingInterest || '');
      setParticipationHistory(contact.participationHistory || '');
      setOccupation(contact.occupation || '');
      setCommunity(contact.community || '');
      setFeedbackHistory(contact.feedbackHistory || '');
      setCustomerType(contact.customerType || '');
      setLastInteraction(contact.lastInteraction || '');
      setEngagementScore(contact.engagementScore || 0);
      setPurchaseHistory(contact.purchaseHistory || '');
      setDepartment(contact.department || '');
      setLevel(contact.level || '');
      setFaculty(contact.faculty || '');
      setGuardianContact(contact.guardianContact || '');
      setPerformanceCategory(contact.performanceCategory || '');
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const payload: Partial<Contact> = {
      firstName,
      lastName,
      phone,
      email,
      state,
      city,
      tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      status,
      notes,
      location,
      lga,
      ward,
      outreachDate,
      source,
      prayerRequests,
      attendanceStatus,
      pollingUnit,
      votingInterest,
      participationHistory,
      occupation,
      community,
      feedbackHistory,
      customerType,
      lastInteraction,
      engagementScore,
      purchaseHistory,
      department,
      level,
      faculty,
      guardianContact,
      performanceCategory
    };

    await onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border dark:border-slate-800">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-950/50">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
              {contact ? 'Edit Record' : 'Add New Record'}
            </h2>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">
              {organizationType === 'religious' ? 'Soul Database Entry' :
               organizationType === 'political' ? 'Voter Database Entry' :
               organizationType === 'government' ? 'Citizen Database Entry' :
               organizationType === 'business' ? 'Customer Profile' :
               'Student Academic Record'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <form id="contact-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Core Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Information</span>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">First Name</label>
                  <input 
                    type="text" required placeholder="John"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium"
                    value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Last Name</label>
                  <input 
                    type="text" required placeholder="Doe"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium"
                    value={lastName} onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="tel" required placeholder="+234..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium"
                      value={phone} onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Email Address (Optional)</label>
                  <input 
                    type="email" placeholder="john@example.com"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Specialized Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                {organizationType === 'religious' ? <Star className="w-4 h-4 text-amber-500" /> :
                 organizationType === 'political' ? <Shield className="w-4 h-4 text-blue-600" /> :
                 organizationType === 'government' ? <Building2 className="w-4 h-4 text-indigo-600" /> :
                 organizationType === 'business' ? <Briefcase className="w-4 h-4 text-emerald-600" /> :
                 <GraduationCap className="w-4 h-4 text-purple-600" />}
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Organization Specific Fields</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {organizationType === 'religious' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Location</label>
                      <input 
                        type="text" placeholder="e.g. Street Outreach"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium"
                        value={location} onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Outreach Date</label>
                      <input 
                        type="date"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium"
                        value={outreachDate} onChange={(e) => setOutreachDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Source</label>
                      <select 
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium dark:text-white"
                        value={source} onChange={(e) => setSource(e.target.value)}
                      >
                        <option value="">Select source...</option>
                        <option value="street outreach">Street Outreach</option>
                        <option value="crusade">Crusade</option>
                        <option value="church program">Church Program</option>
                        <option value="referral">Referral</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Attendance Status</label>
                      <input 
                        type="text" placeholder="e.g. Regular"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium"
                        value={attendanceStatus} onChange={(e) => setAttendanceStatus(e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Prayer Requests</label>
                      <textarea 
                        rows={3} placeholder="Enter prayer points..."
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium resize-none"
                        value={prayerRequests} onChange={(e) => setPrayerRequests(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {(organizationType === 'political' || organizationType === 'government') && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">State</label>
                      <input 
                        type="text" placeholder="e.g. Lagos"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium"
                        value={state} onChange={(e) => setState(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">LGA</label>
                      <input 
                        type="text" placeholder="Local Government Area"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium"
                        value={lga} onChange={(e) => setLga(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ward</label>
                      <input 
                        type="text" placeholder="Ward Number/Name"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium"
                        value={ward} onChange={(e) => setWard(e.target.value)}
                      />
                    </div>
                    {organizationType === 'political' ? (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Polling Unit</label>
                          <input 
                            type="text" placeholder="PU Code/Name"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium"
                            value={pollingUnit} onChange={(e) => setPollingUnit(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Voting Interest</label>
                          <input 
                            type="text" placeholder="e.g. undecided"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium"
                            value={votingInterest} onChange={(e) => setVotingInterest(e.target.value)}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Occupation</label>
                          <input 
                            type="text" placeholder="e.g. Teacher"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium"
                            value={occupation} onChange={(e) => setOccupation(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Community</label>
                          <input 
                            type="text" placeholder="Community Name"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium"
                            value={community} onChange={(e) => setCommunity(e.target.value)}
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                {organizationType === 'business' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Customer Type</label>
                      <input 
                        type="text" placeholder="e.g. Wholesale, Retail"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium"
                        value={customerType} onChange={(e) => setCustomerType(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Engagement Score</label>
                      <input 
                        type="number" min="0" max="100"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium"
                        value={engagementScore} onChange={(e) => setEngagementScore(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Purchase History</label>
                      <textarea 
                        rows={2} placeholder="Brief summary of recent purchases..."
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium resize-none"
                        value={purchaseHistory} onChange={(e) => setPurchaseHistory(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {organizationType === 'academic' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Faculty</label>
                      <input 
                        type="text" placeholder="e.g. Engineering"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium"
                        value={faculty} onChange={(e) => setFaculty(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Department</label>
                      <input 
                        type="text" placeholder="e.g. Civil Engineering"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium"
                        value={department} onChange={(e) => setDepartment(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Level / Year</label>
                      <input 
                        type="text" placeholder="e.g. 400L"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium"
                        value={level} onChange={(e) => setLevel(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Performance</label>
                      <select 
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium dark:text-white"
                        value={performanceCategory} onChange={(e) => setPerformanceCategory(e.target.value)}
                      >
                        <option value="">Select performance...</option>
                        <option value="Excellent">Excellent</option>
                        <option value="Average">Average</option>
                        <option value="Below Average">Below Average</option>
                      </select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Guardian Contact</label>
                      <input 
                        type="text" placeholder="Name & Phone of Guardian"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium"
                        value={guardianContact} onChange={(e) => setGuardianContact(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Categorization Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                <Tag className="w-4 h-4 text-rose-500" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categorization & Tags</span>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium dark:text-white"
                    value={status} onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    {organizationType === 'political' && (
                      <>
                        <option value="engaged">Engaged</option>
                        <option value="cold">Cold</option>
                        <option value="converted">Converted</option>
                      </>
                    )}
                    <option value="lead">Lead</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tags (Comma separated)</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" placeholder={organizationType === 'political' ? 'active_supporter, volunteer' : 'VIP, Member'}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium"
                      value={tags} onChange={(e) => setTags(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notes & Observations</span>
              </div>
              <textarea 
                rows={4} placeholder="Add any additional context..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white font-medium resize-none"
                value={notes} onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </form>
        </div>

        <div className="p-8 border-t border-gray-100 dark:border-slate-800 flex gap-4 bg-gray-50/50 dark:bg-slate-950/50">
          <button 
            type="button" onClick={onClose}
            className="flex-1 px-6 py-3.5 text-gray-700 dark:text-gray-300 font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 dark:hover:bg-slate-800 rounded-2xl transition-all border border-gray-200 dark:border-slate-700/50 bg-white dark:bg-slate-800"
          >
            Cancel
          </button>
          <button 
            type="submit" form="contact-form" disabled={isSaving}
            className="flex-1 px-6 py-3.5 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : (contact ? 'Update Record' : 'Save Record')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
