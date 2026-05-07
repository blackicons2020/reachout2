import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Send, 
  Heart, 
  Calendar, 
  Clock, 
  ArrowRight,
  Plus,
  MessageSquare,
  Sparkles,
  Bell
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '@/lib/utils';

const StatCard = ({ title, value, subValue, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-3 rounded-2xl", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex -space-x-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    </div>
    <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
    <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1 tracking-tight">{value}</h3>
    <p className="text-[10px] font-bold text-green-600 dark:text-green-400 mt-2 uppercase tracking-wide">{subValue}</p>
  </div>
);

export function ReligiousDashboard({ campaigns = [] }: { campaigns?: any[] }) {
  const { profile, organization } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (profile?.orgId) {
        try {
          const res = await api.get('/contacts');
          setContacts(res.data);
        } catch (err) {
          console.error('ReligiousDashboard fetch error:', err);
        }
      }
    };
    fetchContacts();
  }, [profile]);

  const outreachStats = campaigns.reduce((acc: any, c: any) => ({
    sent: acc.sent + (c.stats?.sent || 0),
    delivered: acc.delivered + (c.stats?.delivered || 0)
  }), { sent: 0, delivered: 0 });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Spiritual Impact Dashboard</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Religious Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Managing {organization?.name}'s Souls & Outreach</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Outreach
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Souls Database', path: '/contacts', icon: Users, color: 'bg-blue-500' },
          { label: 'Outreach', path: '/campaigns', icon: Send, color: 'bg-emerald-500' },
          { label: 'Service Reminders', path: '/campaigns', icon: MessageSquare, color: 'bg-purple-500' },
          { label: 'Prayer Requests', path: '/inbox', icon: Heart, color: 'bg-rose-500' },
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
          title="Souls reached this week" 
          value={contacts.length.toLocaleString()} 
          subValue={`+${contacts.filter(c => Date.now() - (c.createdAt || 0) < 7 * 24 * 60 * 60 * 1000).length} first-time visitors`} 
          icon={Users} 
          color="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
        />
        <StatCard 
          title="Outreach engagement rate" 
          value={outreachStats.sent > 0 ? `${Math.round((outreachStats.delivered / outreachStats.sent) * 100)}%` : '0%'} 
          subValue="Active spiritual follow-up" 
          icon={Heart} 
          color="bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" 
        />
        <StatCard 
          title="Upcoming services" 
          value={campaigns.filter(c => c.status === 'scheduled').length} 
          subValue="Service reminders active" 
          icon={Calendar} 
          color="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Growth & Outreach</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Spiritual engagement analytics</p>
            </div>
            <div className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest">
              +12% Trend
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[]}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8">Outreach Modules</h3>
          <div className="space-y-4">
            {[
              { label: 'Follow-up Automations', status: 'Active', icon: Clock, color: 'text-blue-500' },
              { label: 'Prayer Request Tracking', status: '8 New', icon: Heart, color: 'text-rose-500' },
              { label: 'Event Announcements', status: 'Scheduled', icon: Calendar, color: 'text-amber-500' },
              { label: 'Service Reminders', status: 'Automatic', icon: Bell, color: 'text-purple-500' }
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
