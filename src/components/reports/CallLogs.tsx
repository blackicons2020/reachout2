import React from 'react';
import { 
  Phone, 
  Download,
  Search,
  Filter,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const StatCard = ({ title, value, percentage, color }: any) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
    <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">{title}</p>
    <div className="flex items-end justify-between">
      <h3 className="text-3xl font-black text-gray-900 dark:text-white">{value}</h3>
      {percentage && (
        <span className={cn("px-2 py-1 rounded-lg text-xs font-bold", color)}>
          {percentage}
        </span>
      )}
    </div>
  </div>
);

export default function CallLogs({ campaigns: propCampaigns }: { campaigns?: any[] }) {
  const campaigns = propCampaigns || JSON.parse(localStorage.getItem('reachout_campaigns') || '[]');
  const voiceCampaigns = campaigns.filter((c: any) => c.type === 'voice');

  const voiceStats = voiceCampaigns.reduce((acc: any, c: any) => ({
    sent: acc.sent + (c.stats?.sent || 0),
    delivered: acc.delivered + (c.stats?.delivered || 0),
    failed: acc.failed + (c.stats?.failed || 0)
  }), { sent: 0, delivered: 0, failed: 0 });

  const answeredRate = voiceStats.sent > 0 ? Math.round((voiceStats.delivered / voiceStats.sent) * 100) : 0;
  const missedRate = voiceStats.sent > 0 ? Math.round((voiceStats.failed / voiceStats.sent) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Call Logs</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Detailed history of all AI Voice calls.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Calls" 
          value={voiceStats.sent.toLocaleString()} 
        />
        <StatCard 
          title="Answered" 
          value={voiceStats.delivered.toLocaleString()} 
          percentage={`${answeredRate}%`} 
          color="bg-green-50 text-green-600" 
        />
        <StatCard 
          title="Missed / No Answer" 
          value={voiceStats.failed.toLocaleString()} 
          percentage={`${missedRate}%`} 
          color="bg-red-50 text-red-600" 
        />
        <StatCard 
          title="Not Available" 
          value="0" 
          percentage="0%" 
          color="bg-orange-50 text-orange-600" 
        />
      </div>

      <div className="bg-white dark:bg-[#0b0e14] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-[#0b0e14]">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search call logs..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-800 dark:bg-gray-950 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors">
              <Filter className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Sent</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Answered</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Failed</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {voiceCampaigns.length > 0 ? voiceCampaigns.map((log, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group">
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{log.name}</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">{log.stats.sent}</td>
                  <td className="px-6 py-4 text-center text-green-600 font-bold">{log.stats.delivered}</td>
                  <td className="px-6 py-4 text-center text-red-600 font-bold">{log.stats.failed}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold",
                      log.status === 'completed' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                    )}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 font-bold text-sm hover:underline">View Details</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 italic">
                    No voice call logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
