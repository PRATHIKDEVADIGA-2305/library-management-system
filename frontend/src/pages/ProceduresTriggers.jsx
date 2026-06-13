import React, { useState, useEffect } from 'react';
import { Settings, Play, Database, RefreshCw, ShieldAlert, CheckCircle, AlertCircle, Cpu } from 'lucide-react';

const ProceduresTriggers = () => {
  const [issues, setIssues] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // SP IssueBook Form states
  const [spIssueId, setSpIssueId] = useState('');
  const [spBookId, setSpBookId] = useState('');
  const [spMemberId, setSpMemberId] = useState('');
  const [spIssueDate, setSpIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [spDueDate, setSpDueDate] = useState('');

  // SP CalculateFine Form states
  const [spCalcIssueId, setSpCalcIssueId] = useState('');
  const [calculatedFine, setCalculatedFine] = useState(null);

  const loadDropdowns = async () => {
    try {
      const [bookRes, memRes, issueRes] = await Promise.all([
        fetch('http://localhost:5000/api/books'),
        fetch('http://localhost:5000/api/members'),
        fetch('http://localhost:5000/api/issues')
      ]);
      const bookData = await bookRes.json();
      const memData = await memRes.json();
      const issueData = await issueRes.json();

      if (bookData.success) {
        setBooks(bookData.data);
        const avail = bookData.data.filter(b => b.availability === 'Available');
        if (avail.length > 0) setSpBookId(avail[0].book_id);
      }
      if (memData.success) {
        setMembers(memData.data);
        if (memData.data.length > 0) setSpMemberId(memData.data[0].member_id);
      }
      if (issueData.success) {
        setIssues(issueData.data);
        if (issueData.data.length > 0) setSpCalcIssueId(issueData.data[0].issue_id);
      }
    } catch (err) {
      console.error('Failed to load dropdown datasets:', err);
    }
  };

  const fetchTriggerLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('http://localhost:5000/api/activity-logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadDropdowns();
    fetchTriggerLogs();

    // Default due date: 14 days from now
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 14);
    setSpDueDate(defaultDue.toISOString().split('T')[0]);
  }, []);

  const handleCallIssueBook = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      issue_id: spIssueId,
      book_id: spBookId,
      member_id: spMemberId,
      issue_date: spIssueDate,
      due_date: spDueDate
    };

    try {
      const res = await fetch('http://localhost:5000/api/procedures/issue-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(data.message || 'Procedure CALL IssueBook() executed successfully.');
        setSpIssueId('');
        loadDropdowns();
        fetchTriggerLogs();
      } else {
        setError(data.error || 'Procedure call returned an error.');
      }
    } catch (err) {
      setError('Connection to API failed.');
    }
  };

  const handleCallCalculateFine = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCalculatedFine(null);

    try {
      const res = await fetch('http://localhost:5000/api/procedures/calculate-fine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue_id: spCalcIssueId })
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(data.message);
        setCalculatedFine(data.fineAmount);
        fetchTriggerLogs();
      } else {
        setError(data.error || 'Procedure calculation failed.');
      }
    } catch (err) {
      setError('Connection to API failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Procedures & Triggers</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Demonstrate backend event automation and execute stored routines inside the database schema.
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-4 text-sm text-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-250 border border-emerald-500/20 rounded-lg">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-800 bg-red-50 dark:bg-red-950/20 dark:text-red-250 border border-red-500/20 rounded-lg">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SP Executor Cards */}
        <div className="space-y-6">
          
          {/* Procedure 1: IssueBook() */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-library-500" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">SP: IssueBook()</h3>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Calls the stored procedure <code className="font-mono text-library-600 dark:text-library-405 font-bold">CALL IssueBook(id, book_id, member_id, issue_date, due_date)</code>.
              This executes transactional validation checks (ensuring availability) before inserting the record.
            </p>

            <form onSubmit={handleCallIssueBook} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Issue ID</label>
                <input
                  type="number"
                  value={spIssueId}
                  onChange={(e) => setSpIssueId(e.target.value)}
                  required
                  placeholder="e.g. 8001"
                  className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Select Book</label>
                  <select
                    value={spBookId}
                    onChange={(e) => setSpBookId(e.target.value)}
                    required
                    className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 text-sm"
                  >
                    {books.filter(b => b.availability === 'Available').map(book => (
                      <option key={book.book_id} value={book.book_id}>{book.title} (ID: {book.book_id})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Select Member</label>
                  <select
                    value={spMemberId}
                    onChange={(e) => setSpMemberId(e.target.value)}
                    required
                    className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 text-sm"
                  >
                    {members.map(m => (
                      <option key={m.member_id} value={m.member_id}>{m.name} (ID: {m.member_id})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Issue Date</label>
                  <input
                    type="date"
                    value={spIssueDate}
                    onChange={(e) => setSpIssueDate(e.target.value)}
                    required
                    className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={spDueDate}
                    onChange={(e) => setSpDueDate(e.target.value)}
                    required
                    className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={books.filter(b => b.availability === 'Available').length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-library-600 hover:bg-library-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all text-sm cursor-pointer disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                <span>CALL IssueBook()</span>
              </button>
            </form>
          </div>

          {/* Procedure 2: CalculateFine() */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-library-500" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">SP: CalculateFine()</h3>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Calls the stored procedure <code className="font-mono text-library-600 dark:text-library-405 font-bold">CALL CalculateFine(issue_id, @fine)</code>.
              Calculates late return fees dynamically using DATEDIFF against due date.
            </p>

            <form onSubmit={handleCallCalculateFine} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Select Borrowing Issue Record</label>
                <select
                  value={spCalcIssueId}
                  onChange={(e) => setSpCalcIssueId(e.target.value)}
                  required
                  className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 text-sm"
                >
                  {issues.map(iss => (
                    <option key={iss.issue_id} value={iss.issue_id}>
                      Issue ID: {iss.issue_id} - {iss.member_name} ({iss.book_title})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={issues.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-library-600 hover:bg-library-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all text-sm cursor-pointer disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                <span>CALL CalculateFine()</span>
              </button>
            </form>

            {calculatedFine !== null && (
              <div className="mt-4 p-4 rounded-lg bg-library-50 dark:bg-library-950/20 border border-library-500/20 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">Procedure Output Fine:</span>
                <span className="text-xl font-bold font-mono text-library-600 dark:text-library-400">${calculatedFine}</span>
              </div>
            )}
          </div>

        </div>

        {/* Triggers Explanation & Feed */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-library-500 animate-spin" style={{ animationDuration: '3s' }} />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Active Database Triggers</h3>
            </div>
            
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950/25 border border-slate-100 dark:border-slate-850 rounded-lg">
                <h4 className="font-bold text-slate-800 dark:text-white">1. Trigger: after_issue_insert</h4>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Fires <code className="font-mono">AFTER INSERT ON ISSUE</code>. Updates the matching book's availability in <code className="font-mono">BOOK</code> table to <code className="font-semibold text-red-500">'Unavailable'</code> automatically.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/25 border border-slate-100 dark:border-slate-850 rounded-lg">
                <h4 className="font-bold text-slate-800 dark:text-white">2. Trigger: after_issue_update</h4>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Fires <code className="font-mono">AFTER UPDATE ON ISSUE</code>. When a return date is updated (check-in), sets matching book's availability back to <code className="font-semibold text-emerald-500">'Available'</code>.
                  If the check-in date exceeds the due date, it computes late days and inserts a penalty entry directly into the <code className="font-mono">FINE</code> table.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Trigger Actions Logs</h4>
                <button
                  onClick={fetchTriggerLogs}
                  className="p-1.5 text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
                  disabled={loadingLogs}
                  title="Reload Logs"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingLogs ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                {logs.length === 0 ? (
                  <p className="text-center text-slate-500 text-xs italic py-8">No trigger actions captured yet.</p>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/50 rounded-lg text-xs flex gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-library-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{log.activity}</p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 block">
                          {new Date(log.timestamp).toLocaleTimeString()}
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
    </div>
  );
};

export default ProceduresTriggers;
