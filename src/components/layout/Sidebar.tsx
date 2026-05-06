import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Users, 
  Send, 
  CreditCard, 
  Settings, 
  LogOut,
  Phone,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  ChevronDown,
  X,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { Logo } from './Logo';

const navGroups = [
  {
    title: 'Main',
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
      { name: 'Contacts', path: '/contacts', icon: Users },
      { name: 'Campaigns', path: '/campaigns', icon: Send },
      { name: 'Inbox', path: '/inbox', icon: MessageSquare },
      { name: 'Notifications', path: '/notifications', icon: Bell },
    ]
  },
  {
    title: 'Reports',
    items: [
      { name: 'Reports', path: '/reports', icon: BarChart3 },
      { name: 'Call Logs', path: '/call-logs', icon: Phone },
    ]
  },
  {
    title: 'Organization',
    items: [
      { name: 'Admin Control', path: '/admin', icon: ShieldCheck },
      { name: 'Members', path: '/members', icon: Users },
      { name: 'Billing', path: '/billing', icon: CreditCard },
      { name: 'Settings', path: '/settings', icon: Settings },
    ]
  },
  {
    title: 'System',
    items: [
      { name: 'SuperAdmin', path: '/superadmin', icon: ShieldCheck },
    ]
  }
];

export function Sidebar({ onClose, notifications = [], contactCount = 0 }: { onClose?: () => void, notifications?: any[], contactCount?: number }) {
  const location = useLocation();
  const { user, profile, organization } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const role = profile?.role || 'owner';

  const unreadCount = notifications.filter(n => (n.memberId === 'all' || n.memberId === user?.uid) && !n.read).length;

  const isSuperAdmin = role === 'superadmin';
  const isSubscriptionActive = organization?.subscription?.status === 'active' || isSuperAdmin;
  const TRIAL_LIMIT = 10;
  const isTrial = !isSubscriptionActive && !isSuperAdmin;

  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      // SuperAdmin visibility logic
      if (isSuperAdmin) {
        return item.name === 'SuperAdmin' || item.name === 'Dashboard';
      }
      
      if (item.name === 'SuperAdmin') {
        return false;
      }

      // If subscription is inactive but they are in trial, allow core features
      if (!isSubscriptionActive) {
        const isCoreFeature = ['Dashboard', 'Contacts', 'Campaigns', 'Inbox', 'Notifications', 'Reports'].includes(item.name);
        const isManagementFeature = ['Billing', 'Settings'].includes(item.name);
        
        if (contactCount < TRIAL_LIMIT) {
           return isCoreFeature || isManagementFeature;
        }
        return ['Billing', 'Settings', 'Notifications'].includes(item.name);
      }
      
      if (role === 'viewer' || role === 'editor') {
        return !['Billing', 'Settings', 'Members', 'Admin Control'].includes(item.name);
      }
      return true;
    })
  })).filter(group => group.items.length > 0);

  return (
    <div className="flex flex-col w-64 bg-gray-900 border-r border-gray-800 transition-all duration-300">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center shrink-0 rounded-full overflow-hidden">
            {organization?.logo ? (
              <img src={organization.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Logo size={48} className="w-full h-full text-blue-500" />
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className={cn(
              "font-black tracking-tight leading-[1.1] text-white transition-all duration-300 break-words line-clamp-3",
              (organization?.name?.length || 8) < 12 ? "text-xl" :
              (organization?.name?.length || 8) < 20 ? "text-lg" :
              (organization?.name?.length || 8) < 30 ? "text-base" : "text-sm"
            )}>
              {organization?.name || 'ReachOut'}
            </span>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto custom-scrollbar">
        {filteredGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            <div className="flex items-center justify-between px-4">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                {group.title}
              </p>
              {(group.title === 'Main' || group.title === 'System') && (
                <button
                  onClick={toggleTheme}
                  className="p-1 hover:bg-gray-800 rounded-lg transition-all text-gray-600 hover:text-white"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                const isNotifications = item.name === 'Notifications';
                
                let displayName = item.name;
                if (item.name === 'Contacts') {
                  if (organization?.type === 'religious') displayName = 'Souls Database';
                  else if (organization?.type === 'political') displayName = 'Voter Database';
                } else if (item.name === 'Campaigns') {
                  if (organization?.type === 'religious') displayName = 'Outreach';
                  else if (organization?.type === 'political') displayName = 'Engagements';
                  else if (organization?.type === 'nonprofit') displayName = 'Engagements';
                  else if (organization?.type === 'education') displayName = 'Engagements';
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                      isActive 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                        : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                    )}
                  >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn(
                          "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                          isActive ? "text-white" : "text-gray-500 group-hover:text-blue-400"
                        )} />
                        <span className="font-bold text-sm tracking-wide">{displayName}</span>
                      </div>
                      {isNotifications && unreadCount > 0 && (
                      <span className="flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-800 space-y-4">
        {isTrial && (
          <div className="px-4 py-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trial Usage</p>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{contactCount} / {TRIAL_LIMIT}</p>
            </div>
            <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-1000 ease-out",
                  contactCount >= TRIAL_LIMIT ? "bg-red-500" : "bg-blue-500"
                )}
                style={{ width: `${Math.min((contactCount / TRIAL_LIMIT) * 100, 100)}%` }}
              />
            </div>
            <Link to="/billing" className="block mt-3 text-[10px] font-black text-center text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors">
              Upgrade for Unlimited Access
            </Link>
          </div>
        )}

        <div className="px-4 py-2">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Logged in as</p>
          <p className="text-xs font-bold text-blue-400 truncate">{user?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-gray-800 text-[10px] font-black text-gray-400 rounded uppercase tracking-tighter">
            {role}
          </span>
        </div>

        <button 
          onClick={() => {
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('auth-change'));
          }}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}
