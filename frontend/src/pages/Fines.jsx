import React, { useState, useEffect } from 'react';
import { DollarSign, ShieldAlert, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';

const Fines = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Filter tab: 'all', 'paid', 'unpaid'
  const [activeTab, setActiveTab] = useState('all');

  const fetchFines = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/fines');
      const data = await res.json();
      if (data.success) {
        setFines(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Connection to API failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const handlePayFine = async (id) => {
    if (!window.confirm('Mark this fine as Paid?')) return;
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`http://localhost:5000/api/fines/${id}/pay`, {
        method: 'PUT'
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Fine ID ${id} successfully marked as Paid!`);
        fetchFines();
      } else {
        setError(data.error || 'Failed to update fine.');
      }
    } catch (err) {
      setError('Failed to contact server.');
    }
  };

  const filteredFines = fines.filter(fine => {
    if (activeTab === 'paid') return fine.paid_status === 'Paid';
    if (activeTab === 'unpaid') return fine.paid_status === 'Unpaid';
    return true;
  });

  const totalAmount = fines.reduce((sum, f) => sum + Number(f.amount), 0);
  const unpaidAmount = fines.filter(f => f.paid_status === 'Unpaid').reduce((sum, f) => sum + Number(f.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Fine Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track late fees and mark penalty accounts paid.</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">Total Fines Issued</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">${totalAmount.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">Outstanding Balance</p>
            <h3 className="text-2xl font-bold mt-1 text-rose-500">${unpaidAmount.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-lg">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-4 text-sm text-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-250 border border-emerald-500/20 rounded-lg">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-800 bg-red-50 dark:bg-red-950/20 dark:text-red-250 border border-red-500/20 rounded-lg">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {['all', 'unpaid', 'paid'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 transition-colors cursor-pointer ${
              activeTab === tab
                ? 'border-library-600 text-library-600 dark:text-library-405 font-bold'
                : 'border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tab} Fines
          </button>
        ))}
      </div>

      {/* Fines Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-library-600 mx-auto"></div>
          </div>
        ) : filteredFines.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-12">No fines on record for this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-b border-slate-200/50 dark:border-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4">Fine ID</th>
                  <th scope="col" className="px-6 py-4">Member Name</th>
                  <th scope="col" className="px-6 py-4">Amount</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredFines.map((fine) => (
                  <tr key={fine.fine_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-700 dark:text-slate-350">{fine.fine_id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{fine.member_name}</td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-800 dark:text-white">${Number(fine.amount).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        fine.paid_status === 'Paid'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-450 border border-rose-500/20'
                      }`}>
                        {fine.paid_status === 'Paid' ? (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        ) : (
                          <ShieldAlert className="h-3.5 w-3.5" />
                        )}
                        <span>{fine.paid_status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end">
                      {fine.paid_status === 'Unpaid' ? (
                        <button
                          onClick={() => handlePayFine(fine.fine_id)}
                          className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg text-xs shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
                        >
                          Mark Paid
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Cleared</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Fines;
