import { 
  Phone, 
  Mail, 
  Calendar, 
  Tag, 
  Users, 
  MessageSquare, 
  History, 
  MoreVertical, 
  ChevronLeft,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Contact, Interaction } from '@/types';
import { MessageModal } from './MessageModal';
import { useState } from 'react';

interface ContactProfileProps {
  contact: Contact;
  interactions: Interaction[];
  onClose: () => void;
}

export function ContactProfile({ contact, interactions, onClose }: ContactProfileProps) {
  const [showMessageModal, setShowMessageModal] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l dark:border-gray-800">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between dark:bg-gray-950">
          <button onClick={onClose} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Back to Contacts</span>
          </button>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
              <Edit2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto dark:bg-gray-900">
          <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-blue-600 text-white rounded-3xl flex items-center justify-center text-3xl font-bold shadow-xl shadow-blue-100 dark:shadow-none">
                {contact.firstName[0]}{contact.lastName[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{contact.firstName} {contact.lastName}</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Added on {new Date(contact.createdAt).toLocaleDateString()}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {contact.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-bold rounded-full border border-gray-200 dark:border-gray-700 uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                  {contact.groups.map(group => (
                    <span key={group} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full border border-blue-100 dark:border-blue-800 uppercase tracking-wider">
                      {group}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <Phone className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Phone</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{contact.phone}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <Mail className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Email</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{contact.email || 'Not provided'}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1 col-span-2">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Location</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {contact.city || contact.state ? (
                    `${contact.city || ''}${contact.city && contact.state ? ', ' : ''}${contact.state || ''}`
                  ) : (
                    'Not provided'
                  )}
                </p>
              </div>
            </div>

            {/* Interaction History */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Interaction History</span>
                </h3>
                <button className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">Filter History</button>
              </div>

              <div className="space-y-4">
                {interactions.map((interaction) => (
                  <div key={interaction.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                        interaction.type === 'sms' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" :
                        interaction.type === 'whatsapp' ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" :
                        "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                      )}>
                        {interaction.type === 'sms' && <MessageSquare className="w-5 h-5" />}
                        {interaction.type === 'whatsapp' && <MessageSquare className="w-5 h-5" />}
                        {/* {interaction.type === 'voice' && <Phone className="w-5 h-5" />} */}
                      </div>
                      <div className="w-px h-full bg-gray-100 dark:bg-gray-800 my-2" />
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-3 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                            {interaction.type} Campaign
                          </span>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">
                            {new Date(interaction.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                          {interaction.content || 'No content recorded for this interaction.'}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800">
                          <div className={cn(
                            "flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg",
                            interaction.status === 'delivered' || interaction.status === 'answered' ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" :
                            interaction.status === 'failed' || interaction.status === 'no-answer' ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" :
                            "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          )}>
                            {interaction.status === 'delivered' || interaction.status === 'answered' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                             interaction.status === 'failed' || interaction.status === 'no-answer' ? <XCircle className="w-3.5 h-3.5" /> :
                             <Clock className="w-3.5 h-3.5" />}
                            <span className="uppercase tracking-wider">{interaction.status}</span>
                          </div>
                          {/* {interaction.recordingUrl && (
                            <button className="text-xs font-bold text-blue-600 hover:underline">Listen to Recording</button>
                          )} */}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {interactions.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700/50">
                    <History className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No interactions recorded yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex gap-4 mt-auto">
          <button 
            onClick={() => setShowMessageModal(true)}
            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Send Message</span>
          </button>
          {/* <button className="flex-1 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
            <Phone className="w-5 h-5" />
            <span>Place Call</span>
          </button> */}
        </div>
      </div>

      {showMessageModal && (
        <MessageModal 
          contact={contact} 
          onClose={() => setShowMessageModal(false)}
          onSuccess={() => {
            // Success feedback is handled by modal closing and potentially refresh
            // You might want to trigger a refresh of interactions here if needed
          }}
        />
      )}
    </div>
  );
}
