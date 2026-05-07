import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Send, 
  GraduationCap, 
  Calendar, 
  Clock, 
  ArrowRight,
  Plus,
  Bell,
  BookOpen,
  ClipboardList
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
    </div>
    <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
    <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1 tracking-tight">{value}</h3>
    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-2 uppercase tracking-wide">{subValue}</p>
  </div>
);

export function EducationDashboard({ campaigns = [] }: { campaigns?: any[] }) {
  const { profile, organization } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (profile?.orgId) {
        try {
          const res = await api.get('/contacts');
          setContacts(res.data);
        } catch (err) {
          console.error('EducationDashboard fetch error:', err);
        }
      }
    };
    fetchContacts();
  }, [profile]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Academic Excellence Portal</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Nurturing {organization?.name}'s Student Success</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Notification
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Students Database', path: '/contacts', icon: Users, color: 'bg-blue-500' },
          { label: 'Academic Engagements', path: '/campaigns', icon: Send, color: 'bg-emerald-500' },
          { label: 'Event Reminders', path: '/campaigns', icon: Calendar, color: 'bg-amber-500' },
          { label: 'Academic Campaigns', path: '/campaigns', icon: BookOpen, color: 'bg-purple-500' },
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
          title="Total Students" 
          value={contacts.length.toLocaleString()} 
          subValue="Across all levels" 
          icon={Users} 
          color="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
        />
        <StatCard 
          title="Active Notices" 
          value={campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length} 
          subValue="Ongoing institutional communication" 
          icon={Bell} 
          color="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" 
        />
        <StatCard 
          title="Student Engagement" 
          value="88%" 
          subValue="High responsiveness rate" 
          icon={ClipboardList} 
          color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8">Engagement Over Time</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[]}>
                <defs>
                  <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
                <XAxis hide />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="sent" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorEngage)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8">Academic Modules</h3>
          <div className="space-y-4">
            {[
              { label: 'Academic Notifications', status: 'Active', icon: Bell, color: 'text-blue-500' },
              { label: 'Event Reminders', status: 'Scheduled', icon: Calendar, color: 'text-amber-500' },
              { label: 'Attendance Alerts', status: 'Automatic', icon: ClipboardList, color: 'text-rose-500' },
              { label: 'Departmental Messaging', status: 'Active', icon: BookOpen, color: 'text-purple-500' }
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
