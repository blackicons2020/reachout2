import React from 'react';
import { 
  CheckCircle2, 
  MessageSquare, 
  Phone, 
  TrendingUp, 
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

const StatCard = ({ title, value, subValue, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">{title}</p>
    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
    <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-2">{subValue}</p>
  </div>
);

export default function Reports({ campaigns: propCampaigns }: { campaigns?: any[] }) {
  const campaigns = propCampaigns || JSON.parse(localStorage.getItem('reachout_campaigns') || '[]');

  const smsCampaigns = campaigns.filter((c: any) => c.type === 'sms');
  const whatsappCampaigns = campaigns.filter((c: any) => c.type === 'whatsapp');
  const voiceCampaigns = campaigns.filter((c: any) => c.type === 'voice');

  const smsStats = smsCampaigns.reduce((acc: any, c: any) => ({
    sent: acc.sent + (c.stats?.sent || 0),
    delivered: acc.delivered + (c.stats?.delivered || 0),
    failed: acc.failed + (c.stats?.failed || 0)
  }), { sent: 0, delivered: 0, failed: 0 });

  const whatsappStats = whatsappCampaigns.reduce((acc: any, c: any) => ({
    sent: acc.sent + (c.stats?.sent || 0),
    delivered: acc.delivered + (c.stats?.delivered || 0),
    failed: acc.failed + (c.stats?.failed || 0)
  }), { sent: 0, delivered: 0, failed: 0 });

  const voiceStats = voiceCampaigns.reduce((acc: any, c: any) => ({
    sent: acc.sent + (c.stats?.sent || 0),
    delivered: acc.delivered + (c.stats?.delivered || 0),
    failed: acc.failed + (c.stats?.failed || 0)
  }), { sent: 0, delivered: 0, failed: 0 });

  const totalReached = smsStats.sent + whatsappStats.sent + voiceStats.sent;
  const totalDelivered = smsStats.delivered + whatsappStats.delivered + voiceStats.delivered;
  const successRate = totalReached > 0 ? Math.round((totalDelivered / totalReached) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Detailed performance analysis across all channels.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none">
          <Download className="w-4 h-4" />
          <span>Export All Reports</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Reached" 
          value={totalReached.toLocaleString()} 
          subValue={`${successRate}% success rate`} 
          icon={TrendingUp} 
          color="bg-blue-50 text-blue-600" 
        />
        <StatCard 
          title="SMS Delivered" 
          value={smsStats.delivered.toLocaleString()} 
          subValue={smsStats.sent > 0 ? `${Math.round((smsStats.delivered / smsStats.sent) * 100)}% delivery` : '0% delivery'} 
          icon={MessageSquare} 
          color="bg-green-50 text-green-600" 
        />
        <StatCard 
          title="WhatsApp Delivered" 
          value={whatsappStats.delivered.toLocaleString()} 
          subValue={whatsappStats.sent > 0 ? `${Math.round((whatsappStats.delivered / whatsappStats.sent) * 100)}% read rate` : '0% read rate'} 
          icon={MessageSquare} 
          color="bg-purple-50 text-purple-600" 
        />
        {/*
        <StatCard 
          title="Calls Answered" 
          value={voiceStats.delivered.toLocaleString()} 
          subValue={voiceStats.sent > 0 ? `${Math.round((voiceStats.delivered / voiceStats.sent) * 100)}% answer rate` : '0% answer rate'} 
          icon={Phone} 
          color="bg-orange-50 text-orange-600" 
        />
        */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8">SMS Report</h3>
          <div className="grid grid-cols-2 gap-8">
            {[
              { label: 'Delivered', value: smsStats.sent > 0 ? `${Math.round((smsStats.delivered / smsStats.sent) * 100)}%` : '0%', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
              { label: 'Failed', value: smsStats.sent > 0 ? `${Math.round((smsStats.failed / smsStats.sent) * 100)}%` : '0%', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
              { label: 'Sent', value: smsStats.sent.toLocaleString(), color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Opted Out', value: '0%', color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-900/20' },
            ].map((item) => (
              <div key={item.label} className={cn("p-6 rounded-2xl border border-gray-100 dark:border-gray-800", item.bg)}>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{item.label}</p>
                <p className={cn("text-4xl font-black", item.color)}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8">WhatsApp Report</h3>
          <div className="grid grid-cols-2 gap-8">
            {[
              { label: 'Sent', value: whatsappStats.sent.toLocaleString(), color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Delivered', value: whatsappStats.sent > 0 ? `${Math.round((whatsappStats.delivered / whatsappStats.sent) * 100)}%` : '0%', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
              { label: 'Read', value: '0%', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
              { label: 'Replied', value: '0%', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
            ].map((item) => (
              <div key={item.label} className={cn("p-6 rounded-2xl border border-gray-100 dark:border-gray-800", item.bg)}>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{item.label}</p>
                <p className={cn("text-4xl font-black", item.color)}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {voiceCampaigns.length > 0 && (
        <div className="bg-white dark:bg-[#0b0e14] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Voice Call Report</h3>
            <button className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 font-bold text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campaign</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Sent</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Delivered</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Failed</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {voiceCampaigns.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{c.name}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 uppercase text-xs font-bold">{c.type}</td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">{c.stats.sent}</td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-green-600">{c.stats.delivered}</td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-red-600">{c.stats.failed}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
