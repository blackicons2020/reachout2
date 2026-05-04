import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Send, 
  Heart,
  Globe,
  Clock,
  Plus,
  ArrowRight,
  HandHelping,
  Sparkles
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

export function NonProfitDashboard({ campaigns = [] }: { campaigns?: any[] }) {
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

  const donorStats = campaigns
    .reduce((acc: any, c: any) => ({
      sent: acc.sent + (c.stats?.sent || 0),
      delivered: acc.delivered + (c.stats?.delivered || 0)
    }), { sent: 0, delivered: 0 });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Impact Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Driving change at {organization?.name}.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 rounded-xl font-bold text-sm">
            <Heart className="w-4 h-4" />
            <span>Community Impact Mode</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Register Beneficiary', path: '/contacts', icon: Plus, color: 'bg-blue-600' },
          { label: 'New Engagement', path: '/campaigns', icon: HandHelping, color: 'bg-pink-600' },
          { label: 'Donor Outreach', path: '/campaigns', icon: Heart, color: 'bg-orange-600' },
          { label: 'Impact Story', path: '/inbox', icon: Sparkles, color: 'bg-gray-900' },
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
          title="Beneficiaries & Donors" 
          value={contacts.length.toLocaleString()} 
          subValue={`Global community reach`} 
          icon={Globe} 
          color="bg-blue-50 text-blue-600" 
        />
        <StatCard 
          title="Engagements Sent" 
          value={donorStats.sent.toLocaleString()} 
          subValue={`${Math.round((donorStats.delivered / donorStats.sent) * 100 || 0)}% engagement rate`} 
          icon={Send} 
          color="bg-pink-50 text-pink-600" 
        />
        <StatCard 
          title="Active Programs" 
          value={campaigns.length} 
          subValue="Ongoing community projects" 
          icon={HandHelping} 
          color="bg-orange-50 text-orange-600" 
        />
      </div>

      <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-gray-100 dark:border-slate-800/50 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Impact Growth Trend</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <Tooltip />
              <Bar dataKey="sent" fill="#db2777" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
