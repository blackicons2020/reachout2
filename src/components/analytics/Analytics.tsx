import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  Users, 
  MessageSquare, 
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-lg",
        change >= 0 ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
      )}>
        {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        {Math.abs(change)}%
      </div>
    </div>
    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
  </div>
);

export function Analytics() {
  const { profile } = useAuth();
  const [totalReach, setTotalReach] = useState(0);
  const [deliveryStats, setDeliveryStats] = useState({ delivered: 0, failed: 0, pending: 0 });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!profile?.orgId) return;

      try {
        const res = await api.get('/campaigns');
        const campaigns = res.data;
        
        let reach = 0;
        let delivered = 0;
        let failed = 0;
        let pending = 0;
        const months: Record<string, any> = {};

        campaigns.forEach((c: any) => {
          reach += c.stats?.total || 0;
          delivered += c.stats?.delivered || 0;
          failed += c.stats?.failed || 0;
          if (c.status === 'scheduled') pending += c.stats?.total || 0;

          const date = new Date(c.createdAt);
          const month = date.toLocaleString('default', { month: 'short' });
          if (!months[month]) months[month] = { name: month, sms: 0, whatsapp: 0, voice: 0 };
          months[month][c.type] = (months[month][c.type] || 0) + (c.stats?.sent || 0);
        });

        setTotalReach(reach);
        setDeliveryStats({ delivered, failed, pending });
        
        const sortedMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          .filter(m => months[m])
          .map(m => months[m]);
        setMonthlyData(sortedMonths.length > 0 ? sortedMonths : [{ name: 'No Data', sms: 0, whatsapp: 0, voice: 0 }]);
      } catch (err) {
        console.error('Analytics fetch error:', err);
      }
    };
    fetchAnalytics();
  }, [profile]);

  const pieData = [
    { name: 'Delivered', value: deliveryStats.delivered, color: '#22c55e' },
    { name: 'Failed', value: deliveryStats.failed, color: '#ef4444' },
    { name: 'Pending', value: deliveryStats.pending, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Detailed performance metrics for your outreach campaigns.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Potential Reach" value={totalReach.toLocaleString()} change={0} icon={Users} color="bg-blue-50 text-blue-600" />
        <StatCard title="Messages Delivered" value={deliveryStats.delivered.toLocaleString()} change={0} icon={MessageSquare} color="bg-green-50 text-green-600" />
        <StatCard title="Failed Delivery" value={deliveryStats.failed.toLocaleString()} change={0} icon={AlertCircle} color="bg-red-50 text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-8">Campaign Volume Over Time</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorSms" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none'}}
                />
                <Area type="monotone" dataKey="sms" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSms)" strokeWidth={3} />
                <Area type="monotone" dataKey="whatsapp" stroke="#22c55e" fillOpacity={0} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-8">Delivery Success Ratio</h3>
          <div className="h-[350px] w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-400">
                <p>No campaign data available</p>
              </div>
            )}
          </div>
          <div className="flex justify-center gap-8 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}} />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
