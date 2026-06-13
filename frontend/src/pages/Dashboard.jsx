import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Users, Layers, UserCheck, BookMarked, 
  CheckCircle, DollarSign, Activity, AlertCircle
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
    { label: 'Total Books', value: stats.totalBooks, icon: BookOpen, color: 'from-cyan-500 to-blue-600', text: 'text-cyan-500' },
    { label: 'Total Authors', value: stats.totalAuthors, icon: Users, color: 'from-purple-500 to-indigo-600', text: 'text-purple-500' },
    { label: 'Total Categories', value: stats.totalCategories, icon: Layers, color: 'from-amber-500 to-orange-600', text: 'text-amber-500' },
    { label: 'Total Members', value: stats.totalMembers, icon: UserCheck, color: 'from-emerald-500 to-teal-600', text: 'text-emerald-500' },
    { label: 'Issued Books', value: stats.issuedBooks, icon: BookMarked, color: 'from-rose-500 to-pink-600', text: 'text-rose-500' },
    { label: 'Available Books', value: stats.availableBooks, icon: CheckCircle, color: 'from-teal-500 to-emerald-600', text: 'text-teal-500' },
    { label: 'Total Fines Collected', value: `$${stats.totalFines}`, icon: DollarSign, color: 'from-yellow-500 to-amber-600', text: 'text-yellow-500' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-library-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Portal Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time metrics, system performance, and active events.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-amber-800 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-250 border border-amber-500/20 rounded-lg">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Widgets Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md duration-250">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{card.label}</p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1.5">{card.value}</h3>
                </div>
                <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-850 ${card.text}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`} />
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
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-library-500" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Trigger Actions Log</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Live feedback demonstrating SQL trigger availability state changes and automatic fine calculations.</p>
            <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">No activities recorded yet.</p>
              ) : (
                activities.map((act, idx) => (
                  <div key={idx} className="flex gap-3 text-xs leading-relaxed pb-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                    <div className="h-2 w-2 shrink-0 rounded-full bg-library-500 mt-1.5" />
                    <div>
                      <p className="text-slate-650 dark:text-slate-350">{act.activity}</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 block">
                        {new Date(act.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
