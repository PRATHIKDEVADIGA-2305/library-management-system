import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Users, Layers, UserCheck, BookMarked, 
  CheckCircle, DollarSign, Activity, AlertCircle,
  ArrowDownLeft, ArrowUpRight, Plus
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalAuthors: 0,
    totalCategories: 0,
    totalMembers: 0,
    issuedBooks: 0,
    availableBooks: 0,
    totalFines: '0.00'
  });
  const [chartData, setChartData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const COLORS = ['#578c84', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/dashboard/stats');
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setChartData(data.categoryChart);
          setActivities(data.recentLogs);
        } else {
          setError('Failed to fetch dashboard metrics.');
        }
      } catch (err) {
        setError('Could not connect to API server. Ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Books', value: stats.totalBooks, icon: BookOpen, color: 'text-library-600 bg-library-500/10' },
    { label: 'Available Books', value: stats.availableBooks, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-500/10' },
    { label: 'Issued Books', value: stats.issuedBooks, icon: BookMarked, color: 'text-indigo-600 bg-indigo-500/10' },
    { label: 'Total Members', value: stats.totalMembers, icon: UserCheck, color: 'text-blue-600 bg-blue-500/10' },
    { label: 'Total Authors', value: stats.totalAuthors, icon: Users, color: 'text-purple-600 bg-purple-500/10' },
    { label: 'Total Categories', value: stats.totalCategories, icon: Layers, color: 'text-amber-600 bg-amber-500/10' },
    { label: 'Total Fines', value: `$${stats.totalFines}`, icon: DollarSign, color: 'text-rose-600 bg-rose-500/10' }
  ];

  const getActivityConfig = (actText) => {
    const text = actText.toLowerCase();
    if (text.includes('returned') || text.includes('restored') || text.includes('cleared') || text.includes('paid')) {
      return { icon: ArrowDownLeft, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/15' };
    }
    if (text.includes('issued') || text.includes('checkout') || text.includes('borrowed')) {
      return { icon: ArrowUpRight, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20 border border-blue-500/15' };
    }
    if (text.includes('fine') || text.includes('penalty') || text.includes('overdue')) {
      return { icon: DollarSign, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/20 border border-rose-500/15' };
    }
    if (text.includes('added') || text.includes('created') || text.includes('registered')) {
      return { icon: Plus, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 border border-amber-500/15' };
    }
    return { icon: Activity, color: 'text-slate-600 bg-slate-50 dark:bg-slate-900 border border-slate-700/15' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-library-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-library-700 to-library-900 dark:from-library-850 dark:to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight">Library Portal Dashboard</h1>
          <p className="text-library-200 mt-2 text-sm leading-relaxed">
            Welcome back, Administrator. Access real-time metrics, active circulation indicators, and log audits for the Library Management System.
          </p>
        </div>
        <div className="absolute right-6 bottom-0 top-0 w-1/4 opacity-10 pointer-events-none hidden md:block">
          <BookOpen className="w-full h-full object-contain translate-y-8 translate-x-8" />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-amber-850 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-250 border border-amber-500/20 rounded-lg">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Redesigned Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md duration-250">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{card.label}</p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1.5">{card.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${card.color}`}>
                  <Icon className="h-5.5 w-5.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Activity Logs Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Analytics Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Books by Category</h3>
            <p className="text-xs text-slate-500 mt-0.5">Distribution of library books across different categories.</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }} 
                />
                <Bar dataKey="books" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Logs Dashboard Widget */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-library-500" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Activities</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Live feedback logs showing recent library activities and penalty records.</p>
            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">No activities recorded yet.</p>
              ) : (
                activities.map((act, idx) => {
                  const cfg = getActivityConfig(act.activity);
                  const ActIcon = cfg.icon;
                  // Strip trigger demonstration or bracket jargon for display
                  const cleanActivityText = act.activity
                    .replace(/^\[Trigger Demonstration\]\s*/i, '')
                    .replace(/^\[Trigger Effect\]\s*/i, '');

                  return (
                    <div key={idx} className="flex gap-3 text-xs leading-relaxed pb-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                      <div className={`p-1.5 rounded-lg shrink-0 ${cfg.color}`}>
                        <ActIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-650 dark:text-slate-350 break-words font-medium">{cleanActivityText}</p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 block">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
