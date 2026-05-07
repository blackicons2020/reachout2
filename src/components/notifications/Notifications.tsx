import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Clock, CheckCircle2, MessageSquare, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationsProps {
  notifications: any[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export default function Notifications({ notifications, onMarkAsRead, onClearAll }: NotificationsProps) {
  const { user } = useAuth();
  
  // Filter notifications for this user or "all"
  const myNotifications = notifications.filter(n => n.memberId === 'all' || n.memberId === user?.id);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Stay updated with team alerts and system messages.</p>
        </div>
        {myNotifications.length > 0 && (
          <button 
            onClick={onClearAll}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {myNotifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {myNotifications.map((n) => (
              <div 
                key={n.id} 
                className={cn(
                  "p-6 flex items-start gap-4 transition-colors hover:bg-gray-50",
                  !n.read && "bg-blue-50/30 border-l-4 border-l-blue-600"
                )}
                onClick={() => !n.read && onMarkAsRead(n.id)}
              >
                <div className={cn(
                  "p-3 rounded-2xl shrink-0",
                  n.read ? "bg-gray-100 text-gray-400" : "bg-blue-100 text-blue-600 shadow-sm"
                )}>
                  <Bell className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className={cn(
                      "text-sm font-bold",
                      n.read ? "text-gray-600" : "text-gray-900"
                    )}>
                      {n.memberId === 'all' ? 'Team Broadcast' : 'Direct Message'}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <Clock className="w-3 h-3" />
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <p className={cn(
                    "text-sm leading-relaxed",
                    n.read ? "text-gray-500" : "text-gray-700 font-medium"
                  )}>
                    {n.message}
                  </p>
                  {!n.read && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(n.id);
                      }}
                      className="mt-3 text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No notifications yet</h3>
            <p className="text-gray-500 mt-1 max-w-xs mx-auto">
              When you receive alerts or messages from your team, they'll appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
