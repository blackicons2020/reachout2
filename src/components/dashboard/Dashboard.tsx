import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Send, 
  MessageSquare, 
  Phone, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

const data = [
  { name: 'Mon', sent: 400, delivered: 380, failed: 20 },
  { name: 'Tue', sent: 300, delivered: 290, failed: 10 },
  { name: 'Wed', sent: 600, delivered: 550, failed: 50 },
  { name: 'Thu', sent: 800, delivered: 780, failed: 20 },
  { name: 'Fri', sent: 500, delivered: 480, failed: 20 },
  { name: 'Sat', sent: 200, delivered: 190, failed: 10 },
  { name: 'Sun', sent: 100, delivered: 95, failed: 5 },
];

const pieData = [
  { name: 'SMS', value: 400, color: '#3b82f6' },
  { name: 'WhatsApp', value: 300, color: '#22c55e' },
  /* { name: 'Voice', value: 200, color: '#a855f7' }, */
];

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

export function Dashboard({ campaigns: propCampaigns }: { campaigns?: any[] }) {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const [contacts, setContacts] = React.useState<any[]>([]);
  const [members, setMembers] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (profile?.orgId) {
      // Listen to contacts count or sample
      const unsubContacts = onSnapshot(collection(db, 'organizations', profile.orgId, 'contacts'), (snap) => {
        setContacts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      // Listen to members
      const unsubMembers = onSnapshot(query(collection(db, 'users'), where('orgId', '==', profile.orgId)), (snap) => {
        setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      return () => {
        unsubContacts();
        unsubMembers();
      };
    }
  }, [profile]);

  const role = profile?.role || 'owner';
  const canManageMembers = role === 'owner' || role === 'admin';
  
  // Use campaigns from props
  const campaigns = propCampaigns || [];

  const smsStats = campaigns
    .filter((c: any) => c.type === 'sms')
    .reduce((acc: any, c: any) => ({
      sent: acc.sent + (c.stats?.sent || 0),
      delivered: acc.delivered + (c.stats?.delivered || 0)
    }), { sent: 0, delivered: 0 });

  const whatsappStats = campaigns
    .filter((c: any) => c.type === 'whatsapp')
    .reduce((acc: any, c: any) => ({
      sent: acc.sent + (c.stats?.sent || 0),
      delivered: acc.delivered + (c.stats?.delivered || 0)
    }), { sent: 0, delivered: 0 });

/*
  const voiceStats = campaigns
    .filter((c: any) => c.type === 'voice')
    .reduce((acc: any, c: any) => ({
      sent: acc.sent + (c.stats?.sent || 0),
      delivered: acc.delivered + (c.stats?.delivered || 0)
    }), { sent: 0, delivered: 0 });
*/
  const voiceStats = { sent: 0, delivered: 0 };

  const dynamicPieData = [
    { name: 'SMS', value: smsStats.sent, color: '#3b82f6' },
    { name: 'WhatsApp', value: whatsappStats.sent, color: '#22c55e' },
    /* { name: 'Voice', value: voiceStats.sent, color: '#a855f7' }, */
  ].filter((d: any) => d.value > 0);

  // If no data, show some placeholders or empty state
  const finalPieData = dynamicPieData.length > 0 ? dynamicPieData : [
    { name: 'No Data', value: 1, color: '#f3f4f6' }
  ];

  // Generate dynamic data for the bar chart (last 7 days)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }).reverse();

  const dynamicActivityData = last7Days.map(day => {
    const dayCampaigns = campaigns.filter((c: any) => {
      const campaignDate = new Date(c.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
      return campaignDate === day;
    });

    return {
      name: day,
      sent: dayCampaigns.reduce((acc: number, c: any) => acc + (c.stats?.sent || 0), 0),
      delivered: dayCampaigns.reduce((acc: number, c: any) => acc + (c.stats?.delivered || 0), 0),
      failed: dayCampaigns.reduce((acc: number, c: any) => acc + (c.stats?.failed || 0), 0),
    };
  });

  // If all values are 0, use placeholder data for visual appeal
  const hasActivity = dynamicActivityData.some(d => d.sent > 0);
  const finalActivityData = hasActivity ? dynamicActivityData : data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of your organization's outreach performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl font-bold text-sm">
            <Clock className="w-4 h-4" />
            <span>Last updated: Just now</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Add Contact', path: '/contacts', icon: Plus, color: 'bg-blue-600' },
          { label: 'Start Campaign', path: '/campaigns', icon: Send, color: 'bg-green-600' },
          { label: 'Check Inbox', path: '/inbox', icon: MessageSquare, color: 'bg-purple-600' },
          { label: 'Invite Member', path: '/members', icon: Users, color: 'bg-gray-900' },
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
          title="Total Contacts" 
          value={contacts.length.toLocaleString()} 
          subValue={`+${contacts.filter((c: any) => Date.now() - c.createdAt < 7 * 24 * 60 * 60 * 1000).length} this week`} 
          icon={Users} 
          color="bg-blue-50 text-blue-600" 
        />
        <StatCard 
          title="SMS Sent" 
          value={smsStats.sent.toLocaleString()} 
          subValue={smsStats.sent > 0 ? `${Math.round((smsStats.delivered / smsStats.sent) * 100)}% delivered` : '0% delivered'} 
          icon={Send} 
          color="bg-green-50 text-green-600" 
        />
        <StatCard 
          title="WhatsApp Sent" 
          value={whatsappStats.sent.toLocaleString()} 
          subValue={whatsappStats.sent > 0 ? `${Math.round((whatsappStats.delivered / whatsappStats.sent) * 100)}% delivered` : '0% delivered'} 
          icon={MessageSquare} 
          color="bg-purple-50 text-purple-600" 
        />
        {/*
        <StatCard 
          title="Calls Made" 
          value={voiceStats.sent.toLocaleString()} 
          subValue={voiceStats.sent > 0 ? `${Math.round((voiceStats.delivered / voiceStats.sent) * 100)}% answered` : '0% answered'} 
          icon={Phone} 
          color="bg-orange-50 text-orange-600" 
        />
        */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-gray-100 dark:border-slate-800/50 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Channel Performance in %</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'SMS Delivery', value: smsStats.sent > 0 ? `${Math.round((smsStats.delivered / smsStats.sent) * 100)}%` : '0%', color: 'bg-blue-500' },
                { label: 'WhatsApp Delivery', value: whatsappStats.sent > 0 ? `${Math.round((whatsappStats.delivered / whatsappStats.sent) * 100)}%` : '0%', color: 'bg-green-500' },
                /* { label: 'Call Answer Rate', value: voiceStats.sent > 0 ? `${Math.round((voiceStats.delivered / voiceStats.sent) * 100)}%` : '0%', color: 'bg-purple-500' }, */
                { label: 'Engagement', value: '0%', color: 'bg-orange-500' },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{item.label}</p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", item.color)} style={{ width: item.value }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Keep the Activity Chart but maybe use real data if possible, for now keeping as is for visual */}
          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-gray-100 dark:border-slate-800/50 shadow-sm transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Outreach Activity</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={finalActivityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: theme === 'dark' ? '#111827' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    labelStyle={{color: theme === 'dark' ? '#9ca3af' : '#4b5563'}}
                    cursor={{fill: 'currentColor', opacity: 0.1}}
                  />
                  <Bar dataKey="sent" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="delivered" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-gray-100 dark:border-slate-800/50 shadow-sm transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Active Members</h3>
            <div className="space-y-4">
              {members.slice(0, 5).map((member: any) => (
                <div key={member.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold uppercase">
                      {(member.name || member.email || 'U').split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{member.name || member.email || 'Anonymous'}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{member.lastActive}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <div className={cn("w-1.5 h-1.5 rounded-full", member.status === 'Active' ? "bg-green-500" : "bg-orange-500")} />
                      <span className="text-[10px] font-bold text-gray-500 uppercase">{member.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {canManageMembers && (
              <Link 
                to="/members"
                className="w-full mt-6 py-2 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm border border-blue-100 dark:border-blue-900/50 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <span>View All Members</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>

          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-gray-100 dark:border-slate-800/50 shadow-sm transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Channel Distribution</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={finalPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {finalPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{backgroundColor: theme === 'dark' ? '#111827' : '#fff', borderRadius: '12px', border: 'none'}}
                    itemStyle={{color: theme === 'dark' ? '#f3f4f6' : '#1f2937'}}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-4">
              {finalPieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}} />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
