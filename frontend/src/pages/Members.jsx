import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, X, AlertCircle } from 'lucide-react';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [borrowingHistory, setBorrowingHistory] = useState([]);

  // Form states
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');

  const fetchMembers = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/members?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setMembers(data.data);
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
    fetchMembers();
  }, [search]);

  const handleOpenCreate = () => {
    setEditId(null);
    setFormId('');
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setError('');
    setShowForm(true);
  };

  const handleOpenEdit = (member) => {
    setEditId(member.member_id);
    setFormId(member.member_id);
    setFormName(member.name);
    setFormPhone(member.phone || '');
    setFormEmail(member.email || '');
    setError('');
    setShowForm(true);
  };

  const handleOpenDetail = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/members/${id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedMember(data.member);
        setBorrowingHistory(data.history);
        setShowDetail(true);
      } else {
        alert(data.message || 'Error fetching details.');
      }
    } catch (err) {
      alert('Error connecting to API.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      member_id: formId,
      name: formName,
      phone: formPhone,
      email: formEmail
    };

    try {
      let url = 'http://localhost:5000/api/members';
      let method = 'POST';

      if (editId) {
        url += `/${editId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setShowForm(false);
        fetchMembers();
      } else {
        setError(data.error || 'Failed to submit form.');
      }
    } catch (err) {
      setError('Failed to contact server.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member? All borrowing logs for this member will be removed.')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/members/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchMembers();
      } else {
        alert(data.error || 'Delete failed.');
      }
    } catch (err) {
      alert('Failed to contact server.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Members</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Register new users and review individual borrowing accounts.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-library-600 hover:bg-library-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all text-sm cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members by name or email..."
          className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 focus:border-transparent transition-all text-sm placeholder-slate-400"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-800 bg-red-50 dark:bg-red-950/20 dark:text-red-250 border border-red-500/20 rounded-lg">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Members Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-library-600 mx-auto"></div>
          </div>
        ) : members.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-12">No members registered.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-b border-slate-200/50 dark:border-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4">Member ID</th>
                  <th scope="col" className="px-6 py-4">Name</th>
                  <th scope="col" className="px-6 py-4">Phone</th>
                  <th scope="col" className="px-6 py-4">Email</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {members.map((member) => (
                  <tr key={member.member_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-700 dark:text-slate-350">{member.member_id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{member.name}</td>
                    <td className="px-6 py-4">{member.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{member.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenDetail(member.member_id)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded transition-colors"
                        title="View Borrowing History"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(member)}
                        className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded transition-colors"
                        title="Edit member details"
                      >
                        <Edit2 className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.member_id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              {editId ? 'Edit Member Details' : 'Register Member'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Member ID</label>
                <input
                  type="number"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  disabled={!!editId}
                  required
                  placeholder="e.g. 1006"
                  className="block w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 focus:border-transparent transition-all placeholder-slate-450 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="Member Full Name"
                  className="block w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 focus:border-transparent transition-all placeholder-slate-450"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="Phone number"
                  className="block w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 focus:border-transparent transition-all placeholder-slate-450"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="block w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 focus:border-transparent transition-all placeholder-slate-450"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-library-600 hover:bg-library-500 text-white rounded-lg shadow transition-colors text-sm cursor-pointer"
                >
                  {editId ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetail && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl">
            <button
              onClick={() => setShowDetail(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{selectedMember.name}</h2>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-4">
              <p>Email: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedMember.email || 'N/A'}</span></p>
              <p>Phone: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedMember.phone || 'N/A'}</span></p>
            </div>
            
            <div className="mt-6">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Borrowing History ({borrowingHistory.length})</h3>
              {borrowingHistory.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic">No borrowing records registered.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-100 dark:border-slate-800 rounded-lg p-2 bg-slate-50/50 dark:bg-slate-950/20">
                  {borrowingHistory.map(hist => (
                    <div key={hist.issue_id} className="text-xs p-3 bg-white dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-850 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{hist.book_title}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">Issue ID: {hist.issue_id}</p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Issued: {new Date(hist.issue_date).toLocaleDateString()} | Due: {new Date(hist.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {hist.return_date ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Returned: {new Date(hist.return_date).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            Out / Overdue
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={() => setShowDetail(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 rounded-lg transition-colors text-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
