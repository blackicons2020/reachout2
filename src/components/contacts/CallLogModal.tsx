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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Log Call Outcome</h3>
            <p className="text-sm text-gray-500">Contact: {contact.firstName} {contact.lastName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {outcomes.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOutcome(item.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    outcome === item.id
                      ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-50'
                      : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <span className={`text-sm font-medium ${outcome === item.id ? 'text-blue-700' : 'text-gray-600'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Engagement Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all resize-none h-32"
              placeholder="What did you discuss? Any specific feedback or requests?"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Next Follow-up (Optional)</label>
            <input
              type="datetime-local"
              value={nextFollowUp}
              onChange={(e) => setNextFollowUp(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'Saving...' : 'Save Call Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
