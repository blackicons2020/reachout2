import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Send, 
  Flag, 
  MapPin, 
  Clock, 
  ArrowRight,
  Plus,
  Shield,
  Target,
  Zap
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

const StatCard = ({ title, value, subValue, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-3 rounded-2xl", color)}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
    <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1 tracking-tight">{value}</h3>
    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-2 uppercase tracking-wide">{subValue}</p>
  </div>
);

export function PoliticalDashboard({ campaigns = [] }: { campaigns?: any[] }) {
  const { profile, organization } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (profile?.orgId) {
        try {
          const res = await api.get('/contacts');
          setContacts(res.data);
        } catch (err) {
          console.error('PoliticalDashboard fetch error:', err);
        }
      }
    };
    fetchContacts();
  }, [profile]);

  const engagementStats = campaigns.reduce((acc: any, c: any) => ({
    sent: acc.sent + (c.stats?.sent || 0),
    delivered: acc.delivered + (c.stats?.delivered || 0)
  }), { sent: 0, delivered: 0 });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flag className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Campaign Command Center</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Political Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Coordinating {organization?.name}'s Voter Mobilization</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Engagement
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Voter Database', path: '/contacts', icon: Users, color: 'bg-blue-500' },
          { label: 'Engagements', path: '/campaigns', icon: Zap, color: 'bg-amber-500' },
          { label: 'Geo-targeting', path: '/contacts', icon: MapPin, color: 'bg-emerald-500' },
          { label: 'Volunteers', path: '/members', icon: Shield, color: 'bg-rose-500' },
        ].map((action) => (
          <Link 
            key={action.label}
            to={action.path}
            className="group p-5 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-2xl text-white group-hover:scale-110 transition-transform", action.color)}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight">{action.label}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Voters" 
          value={contacts.length.toLocaleString()} 
          subValue={`${contacts.filter(c => c.tags?.includes('active_supporter')).length} active supporters`} 
          icon={Users} 
          color="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
        />
        <StatCard 
          title="Mobilization Score" 
          value="84/100" 
          subValue="High engagement in priority wards" 
          icon={Target} 
          color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
        />
        <StatCard 
          title="Active Engagements" 
          value={campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length} 
          subValue="Ongoing voter outreach" 
          icon={Zap} 
          color="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Regional Engagement</h3>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Met</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="sent" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8">Campaign Modules</h3>
          <div className="space-y-4">
            {[
              { label: 'Election Messaging', status: 'Drafting', icon: Send, color: 'text-blue-500' },
              { label: 'Volunteer Coordination', status: '12 Active', icon: Shield, color: 'text-rose-500' },
              { label: 'Campaign Analytics', status: 'Real-time', icon: Target, color: 'text-emerald-500' },
              { label: 'Voter Segmentation', status: 'Automated', icon: Users, color: 'text-purple-500' }
            ].map((module) => (
              <div key={module.label} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-950 rounded-2xl border border-gray-50 dark:border-gray-900 hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                <div className="flex items-center gap-4">
                  <module.icon className={cn("w-5 h-5", module.color)} />
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{module.label}</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{module.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
