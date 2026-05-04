import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Send, 
  BookOpen, 
  Bell,
  Clock,
  Plus,
  ArrowRight,
  GraduationCap,
  Megaphone
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

const StatCard = ({ title, value, subValue, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-gray-100 dark:border-slate-800/50 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">{title}</p>
    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
    <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-2">{subValue}</p>
  </div>
);

export function EducationDashboard({ campaigns = [] }: { campaigns?: any[] }) {
  const { profile, organization } = useAuth();
  const { theme } = useTheme();
  const [contacts, setContacts] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (profile?.orgId) {
      const unsubContacts = onSnapshot(collection(db, 'organizations', profile.orgId, 'contacts'), (snap) => {
        setContacts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsubContacts();
    }
  }, [profile]);

  const notifyStats = campaigns
    .reduce((acc: any, c: any) => ({
      sent: acc.sent + (c.stats?.sent || 0),
      delivered: acc.delivered + (c.stats?.delivered || 0)
    }), { sent: 0, delivered: 0 });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Academic Portal</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Communications for {organization?.name}.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-xl font-bold text-sm">
            <GraduationCap className="w-4 h-4" />
            <span>Academic Year Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Enroll Student', path: '/contacts', icon: Plus, color: 'bg-blue-600' },
          { label: 'New Announcement', path: '/campaigns', icon: Megaphone, color: 'bg-orange-600' },
          { label: 'Academic Alerts', path: '/campaigns', icon: Bell, color: 'bg-red-600' },
          { label: 'Parent Engagement', path: '/contacts', icon: Users, color: 'bg-gray-900' },
        ].map((action) => (
          <Link 
            key={action.label}
            to={action.path}
            className="group flex items-center justify-between p-4 bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-100 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-xl text-white group-hover:scale-110 transition-transform", action.color)}>
                <action.icon className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-gray-900 dark:text-white">{action.label}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Student Database" 
          value={contacts.length.toLocaleString()} 
          subValue={`Active enrollment tracking`} 
          icon={BookOpen} 
          color="bg-blue-50 text-blue-600" 
        />
        <StatCard 
          title="Notifications Sent" 
          value={notifyStats.sent.toLocaleString()} 
          subValue={`${Math.round((notifyStats.delivered / notifyStats.sent) * 100 || 0)}% read rate`} 
          icon={Megaphone} 
          color="bg-orange-50 text-orange-600" 
        />
        <StatCard 
          title="Urgent Alerts" 
          value={campaigns.filter(c => c.status === 'sending').length} 
          subValue="In-progress notifications" 
          icon={Bell} 
          color="bg-red-50 text-red-600" 
        />
      </div>

      <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-gray-100 dark:border-slate-800/50 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Communication Volume</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <Tooltip />
              <Bar dataKey="sent" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
