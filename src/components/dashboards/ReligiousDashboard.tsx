import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Send, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  Plus,
  ArrowRight,
  Heart,
  Bell,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
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

export function ReligiousDashboard({ campaigns = [] }: { campaigns?: any[] }) {
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

  const outreachStats = campaigns
    .reduce((acc: any, c: any) => ({
      sent: acc.sent + (c.stats?.sent || 0),
      delivered: acc.delivered + (c.stats?.delivered || 0)
    }), { sent: 0, delivered: 0 });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Religious Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Managing {organization?.name}'s souls and outreach.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl font-bold text-sm">
            <Clock className="w-4 h-4" />
            <span>Spiritual Impact Tracking</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Add Soul', path: '/contacts', icon: Plus, color: 'bg-blue-600' },
          { label: 'New Outreach', path: '/campaigns', icon: Send, color: 'bg-green-600' },
          { label: 'Service Reminders', path: '/campaigns', icon: Bell, color: 'bg-purple-600' },
          { label: 'Follow-up System', path: '/contacts', icon: Calendar, color: 'bg-gray-900' },
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
          title="Total Souls" 
          value={contacts.length.toLocaleString()} 
          subValue={`+${contacts.filter((c: any) => Date.now() - c.createdAt < 7 * 24 * 60 * 60 * 1000).length} new believers this week`} 
          icon={Heart} 
          color="bg-red-50 text-red-600" 
        />
        <StatCard 
          title="Outreach Messages" 
          value={outreachStats.sent.toLocaleString()} 
          subValue={`${Math.round((outreachStats.delivered / outreachStats.sent) * 100 || 0)}% engagement rate`} 
          icon={Send} 
          color="bg-green-50 text-green-600" 
        />
        <StatCard 
          title="Active Reminders" 
          value={campaigns.filter(c => c.status === 'scheduled').length} 
          subValue="Upcoming spiritual engagements" 
          icon={Bell} 
          color="bg-blue-50 text-blue-600" 
        />
      </div>

      <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-gray-100 dark:border-slate-800/50 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Spiritual Outreach Growth</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <Tooltip />
              <Bar dataKey="sent" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
