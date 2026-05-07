import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Send, 
  ShoppingBag, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  Plus,
  Tag,
  BarChart3,
  PieChart as PieChartIcon
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

export function BusinessDashboard({ campaigns = [] }: { campaigns?: any[] }) {
  const { profile, organization } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (profile?.orgId) {
        try {
          const res = await api.get('/contacts');
          setContacts(res.data);
        } catch (err) {
          console.error('BusinessDashboard fetch error:', err);
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
            <ShoppingBag className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Growth Engine</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Driving {organization?.name}'s Customer Engagement</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Promotion
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Customers', path: '/contacts', icon: Users, color: 'bg-blue-500' },
          { label: 'Engagements', path: '/campaigns', icon: Send, color: 'bg-emerald-500' },
          { label: 'Promotions', path: '/campaigns', icon: Tag, color: 'bg-amber-500' },
          { label: 'Analytics', path: '/reports', icon: BarChart3, color: 'bg-purple-500' },
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
          title="Total Customers" 
          value={contacts.length.toLocaleString()} 
          subValue={`+${contacts.filter(c => Date.now() - (c.createdAt || 0) < 7 * 24 * 60 * 60 * 1000).length} new this week`} 
          icon={Users} 
          color="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
        />
        <StatCard 
          title="Campaign Performance" 
          value="94%" 
          subValue="High delivery & open rate" 
          icon={TrendingUp} 
          color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
        />
        <StatCard 
          title="Active Promotions" 
          value={campaigns.filter(c => c.status === 'sending').length} 
          subValue="Live engagement campaigns" 
          icon={Tag} 
          color="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8">Sales & Engagement</h3>
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
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8">Marketing Modules</h3>
          <div className="space-y-4">
            {[
              { label: 'Customer CRM', status: 'Updated', icon: Users, color: 'text-blue-500' },
              { label: 'Engagement Campaigns', status: 'Active', icon: Send, color: 'text-emerald-500' },
              { label: 'Customer Segmentation', status: 'Smart', icon: PieChartIcon, color: 'text-purple-500' },
              { label: 'Marketing Analytics', status: 'Insightful', icon: TrendingUp, color: 'text-blue-600' }
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
