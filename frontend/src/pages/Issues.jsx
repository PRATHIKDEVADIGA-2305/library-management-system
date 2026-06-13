import React, { useState, useEffect } from 'react';
import { BookOpen, User, Calendar, Plus, CornerDownLeft, AlertCircle, CheckCircle, X } from 'lucide-react';

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal states
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Issue Form states
  const [formId, setFormId] = useState('');
  const [formBookId, setFormBookId] = useState('');
  const [formMemberId, setFormMemberId] = useState('');
  const [formIssueDate, setFormIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDueDate, setFormDueDate] = useState('');

  // Return Form states
  const [formReturnDate, setFormReturnDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    try {
      const [issueRes, bookRes, memRes] = await Promise.all([
        fetch('http://localhost:5000/api/issues'),
        fetch('http://localhost:5000/api/books'),
        fetch('http://localhost:5000/api/members')
      ]);
      const issueData = await issueRes.json();
      const bookData = await bookRes.json();
      const memData = await memRes.json();

      if (issueData.success) setIssues(issueData.data);
      if (bookData.success) setBooks(bookData.data);
      if (memData.success) setMembers(memData.data);
    } catch (err) {
      setError('Connection to API failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenIssue = () => {
    // Filter to available books only
    const availableBooks = books.filter(b => b.availability === 'Available');
    
    setFormId('');
    setFormBookId(availableBooks[0]?.book_id || '');
    setFormMemberId(members[0]?.member_id || '');
    setFormIssueDate(new Date().toISOString().split('T')[0]);
    
    // Default due date: 14 days from now
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 14);
    setFormDueDate(defaultDue.toISOString().split('T')[0]);

    setError('');
    setSuccessMsg('');
    setShowIssueForm(true);
  };

  const handleOpenReturn = (issue) => {
    setSelectedIssue(issue);
    setFormReturnDate(new Date().toISOString().split('T')[0]);
    setError('');
    setSuccessMsg('');
    setShowReturnForm(true);
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Ensure selected book is available
    const book = books.find(b => b.book_id === Number(formBookId));
    if (!book || book.availability !== 'Available') {
      setError('Cannot issue: Book is currently unavailable.');
      return;
    }

    const payload = {
      issue_id: formId,
      book_id: formBookId,
      member_id: formMemberId,
      issue_date: formIssueDate,
      due_date: formDueDate
    };

    try {
      const res = await fetch('http://localhost:5000/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg('Book issued successfully! Book status set to Unavailable.');
        setShowIssueForm(false);
        loadData();
      } else {
        setError(data.error || 'Failed to issue book.');
      }
    } catch (err) {
      setError('Failed to contact server.');
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch(`http://localhost:5000/api/issues/${selectedIssue.issue_id}/return`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ return_date: formReturnDate })
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg('Book returned successfully! Book availability restored.');
        setShowReturnForm(false);
        loadData();
      } else {
        setError(data.error || 'Failed to return book.');
      }
    } catch (err) {
      setError('Failed to contact server.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Issues & Returns</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Issue library volumes to members and process check-ins.</p>
        </div>
        <button
          onClick={handleOpenIssue}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-library-600 hover:bg-library-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all text-sm cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Issue New Book</span>
        </button>
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

      {/* Issues Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-library-600 mx-auto"></div>
          </div>
        ) : issues.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-12">No active book issues.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-b border-slate-200/50 dark:border-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4">Issue ID</th>
                  <th scope="col" className="px-6 py-4">Book Title</th>
                  <th scope="col" className="px-6 py-4">Member Name</th>
                  <th scope="col" className="px-6 py-4">Issue Date</th>
                  <th scope="col" className="px-6 py-4">Due Date</th>
                  <th scope="col" className="px-6 py-4">Return Date</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {issues.map((issue) => {
                  const isOverdue = !issue.return_date && new Date() > new Date(issue.due_date);
                  return (
                    <tr key={issue.issue_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-slate-700 dark:text-slate-350">{issue.issue_id}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white max-w-[150px] truncate">{issue.book_title}</td>
                      <td className="px-6 py-4 font-medium">{issue.member_name}</td>
                      <td className="px-6 py-4">{new Date(issue.issue_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={isOverdue ? 'text-red-500 font-semibold' : ''}>
                          {new Date(issue.due_date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {issue.return_date ? (
                          <span className="text-emerald-500 font-semibold">
                            {new Date(issue.return_date).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 italic">Not Returned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end">
                        {!issue.return_date ? (
                          <button
                            onClick={() => handleOpenReturn(issue)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-library-100 hover:bg-library-200 dark:bg-library-950/30 dark:hover:bg-library-900 text-library-700 dark:text-library-400 font-semibold rounded-lg transition-colors text-xs border border-library-500/10 cursor-pointer"
                          >
                            <CornerDownLeft className="h-3.5 w-3.5" />
                            <span>Return Book</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Closed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Issue Book Modal */}
      {showIssueForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl">
            <button
              onClick={() => setShowIssueForm(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Issue New Volume</h2>
            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Issue ID</label>
                <input
                  type="number"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  required
                  placeholder="e.g. 5005"
                  className="block w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 transition-all placeholder-slate-450"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Book (Available only)</label>
                <select
                  value={formBookId}
                  onChange={(e) => setFormBookId(e.target.value)}
                  required
                  className="block w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 transition-all"
                >
                  {books.filter(b => b.availability === 'Available').length === 0 ? (
                    <option value="">No books available to issue</option>
                  ) : (
                    books.filter(b => b.availability === 'Available').map(book => (
                      <option key={book.book_id} value={book.book_id}>{book.title} (ID: {book.book_id})</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Member</label>
                <select
                  value={formMemberId}
                  onChange={(e) => setFormMemberId(e.target.value)}
                  required
                  className="block w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 transition-all"
                >
                  {members.map(member => (
                    <option key={member.member_id} value={member.member_id}>{member.name} (ID: {member.member_id})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Issue Date</label>
                  <input
                    type="date"
                    value={formIssueDate}
                    onChange={(e) => setFormIssueDate(e.target.value)}
                    required
                    className="block w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    required
                    className="block w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowIssueForm(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={books.filter(b => b.availability === 'Available').length === 0}
                  className="px-4 py-2 bg-library-600 hover:bg-library-500 text-white rounded-lg shadow transition-colors text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Issue Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Book Modal */}
      {showReturnForm && selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl">
            <button
              onClick={() => setShowReturnForm(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Process Book Return</h2>
            <p className="text-xs text-slate-550 dark:text-slate-400 mb-6">
              Book: <span className="font-semibold text-slate-900 dark:text-white">"{selectedIssue.book_title}"</span>
              <br />
              Member: <span className="font-semibold text-slate-900 dark:text-white">{selectedIssue.member_name}</span>
            </p>

            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Return Date</label>
                <input
                  type="date"
                  value={formReturnDate}
                  onChange={(e) => setFormReturnDate(e.target.value)}
                  required
                  className="block w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 transition-all"
                />
              </div>

              {new Date(formReturnDate) > new Date(selectedIssue.due_date) && (
                <div className="flex items-center gap-2 p-3 text-xs text-amber-800 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-250 border border-amber-500/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
                  <span>Late return detected! A fine will be generated automatically ($1.50/day overdue).</span>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowReturnForm(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-library-600 hover:bg-library-500 text-white rounded-lg shadow transition-colors text-sm cursor-pointer"
                >
                  Confirm Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Issues;
