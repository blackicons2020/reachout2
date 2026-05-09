import React, { useState } from 'react';
import { X, Phone, CheckCircle, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import { teamService } from '../../services/teamService';
import { Contact } from '../../types';

interface CallLogModalProps {
  contact: Contact;
  onClose: () => void;
  onSuccess: () => void;
}

const outcomes = [
  { id: 'not_called', label: 'Not Called', icon: Clock, color: 'text-gray-500' },
  { id: 'called_no_answer', label: 'No Answer', icon: Phone, color: 'text-red-500' },
  { id: 'reached', label: 'Reached / Spoke', icon: CheckCircle, color: 'text-blue-500' },
  { id: 'interested', label: 'Interested', icon: MessageSquare, color: 'text-green-500' },
  { id: 'follow_up_later', label: 'Follow Up Later', icon: Clock, color: 'text-yellow-500' },
  { id: 'unreachable', label: 'Unreachable', icon: AlertCircle, color: 'text-orange-500' },
  { id: 'converted', label: 'Converted / Success', icon: CheckCircle, color: 'text-purple-500' },
];

export const CallLogModal: React.FC<CallLogModalProps> = ({ contact, onClose, onSuccess }) => {
  const [outcome, setOutcome] = useState('reached');
  const [notes, setNotes] = useState('');
  const [nextFollowUp, setNextFollowUp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await teamService.logCall({
        contactId: contact.id || (contact as any)._id,
        outcome,
        notes,
        nextFollowUpDate: nextFollowUp ? new Date(nextFollowUp).getTime() : undefined
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to log call:', error);
      alert('Failed to log call. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Log Call Outcome</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Contact: {contact.firstName} {contact.lastName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-2 gap-2">
            {outcomes.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOutcome(item.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all text-left ${
                    outcome === item.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-4 ring-blue-50 dark:ring-blue-900/10'
                      : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 bg-gray-50 dark:bg-gray-950'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span className={`text-xs font-bold ${outcome === item.id ? 'text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Engagement Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/10 focus:border-blue-500 outline-none transition-all resize-none h-24 text-sm"
              placeholder="What did you discuss? Any specific feedback or requests?"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Next Follow-up (Optional)</label>
            <input
              type="datetime-local"
              value={nextFollowUp}
              onChange={(e) => setNextFollowUp(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/10 focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2 sticky bottom-0 bg-white dark:bg-gray-900">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 text-sm"
            >
              {loading ? 'Saving...' : 'Save Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
