import React, { useState, useEffect } from 'react';
import { FileText, Download, Play, AlertCircle, FileSpreadsheet, FileMinus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

const Reports = () => {
  const [reportType, setReportType] = useState('all_books');
  const [authors, setAuthors] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [queryExecuted, setQueryExecuted] = useState('');
  const [reportData, setReportData] = useState([]);

  const reportOptions = [
    { id: 'all_books', label: '1. All Books (Simple Select)' },
    { id: 'books_by_author', label: '2. Books by Specific Author (Parametric)' },
    { id: 'inner_join', label: '3. Inner Join (Books + Categories + Authors)' },
    { id: 'three_table_join', label: '4. Three Table Join (Issues + Members + Books)' },
    { id: 'group_by', label: '5. Group By (Books count per category)' },
    { id: 'having', label: '6. Having (Categories with more than 2 books)' },
    { id: 'subquery', label: '7. Subquery (Books with price > average price)' },
    { id: 'correlated_subquery', label: '8. Correlated Subquery (Books priced > average in their category)' },
    { id: 'left_join', label: '9. Left Join (Members and their issues, including empty)' },
    { id: 'not_exists', label: '10. Not Exists (Books never issued)' }
  ];

  useEffect(() => {
    // Load authors for selection
    const loadAuthors = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/authors');
        const data = await res.json();
        if (data.success) {
          setAuthors(data.data);
          if (data.data.length > 0) setSelectedAuthor(data.data[0].author_id);
        }
      } catch (err) {
        console.error('Error loading authors for report dropdown:', err);
      }
    };
    loadAuthors();
  }, []);

  const runReport = async () => {
    setLoading(true);
    setError('');
    setReportData([]);
    setQueryExecuted('');

    try {
      let url = `http://localhost:5000/api/reports/${reportType}`;
      if (reportType === 'books_by_author') {
        if (!selectedAuthor) {
          setError('Please select an author first.');
          setLoading(false);
          return;
        }
        url += `?authorId=${selectedAuthor}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setReportData(data.data);
        setQueryExecuted(data.queryExecuted);
      } else {
        setError(data.error || 'Failed to fetch report.');
      }
    } catch (err) {
      setError('Connection to API failed.');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (reportData.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report_Data');
    XLSX.writeFile(workbook, `Library_Report_${reportType}.xlsx`);
  };

  const exportToPDF = () => {
    if (reportData.length === 0) return;
    const doc = new jsPDF();
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Bibliotheca Library Management System', 14, 18);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Report Type: ${reportType.replace(/_/g, ' ').toUpperCase()}`, 14, 25);
    doc.text(`Executed SQL: ${queryExecuted}`, 14, 32, { maxWidth: 180 });
    doc.text(`Generated Date: ${new Date().toLocaleString()}`, 14, 42);

    let y = 52;
    doc.setFont('Helvetica', 'bold');
    const headers = Object.keys(reportData[0]);
    doc.text(headers.join(' | '), 14, y);
    doc.line(14, y + 2, 196, y + 2);
    y += 8;

    doc.setFont('Helvetica', 'normal');
    reportData.forEach((row) => {
      const vals = Object.values(row).map(v => (v === null ? 'NULL' : String(v)));
      doc.text(vals.join(' | '), 14, y, { maxWidth: 180 });
      y += 8;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`Library_Report_${reportType}.pdf`);
  };

  // Dynamically render the table column headers based on keys in return array
  const tableHeaders = reportData.length > 0 ? Object.keys(reportData[0]) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Relational SQL Reports</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Execute, analyze, and export complex queries directly mapping the database engine.</p>
      </div>

      {/* Select Report Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-xl shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-450 uppercase tracking-widest mb-2">Select Query Operation</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 text-sm"
            >
              {reportOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>

          {reportType === 'books_by_author' && (
            <div>
              <label className="block text-xs font-semibold text-slate-450 uppercase tracking-widest mb-2">Choose Author</label>
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 text-sm"
              >
                {authors.map((aut) => (
                  <option key={aut.author_id} value={aut.author_id}>{aut.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={runReport}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-library-600 hover:bg-library-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all text-sm cursor-pointer disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            <span>{loading ? 'Running SQL...' : 'Run Query'}</span>
          </button>

          {reportData.length > 0 && (
            <>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2.5 border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-semibold rounded-lg transition-all text-sm cursor-pointer"
              >
                <FileSpreadsheet className="h-4.5 w-4.5" />
                <span>Export Excel</span>
              </button>

              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2.5 border border-rose-500 text-rose-600 dark:text-rose-450 hover:bg-rose-500/10 font-semibold rounded-lg transition-all text-sm cursor-pointer"
              >
                <FileMinus className="h-4.5 w-4.5" />
                <span>Export PDF</span>
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-800 bg-red-50 dark:bg-red-950/20 dark:text-red-250 border border-red-500/20 rounded-lg">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* SQL Script Display */}
      {queryExecuted && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-inner space-y-2">
          <span className="text-[10px] text-library-500 font-bold uppercase tracking-widest font-mono">Executed Raw Query Statement</span>
          <pre className="text-xs text-white font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed py-1">
            {queryExecuted}
          </pre>
        </div>
      )}

      {/* Results Table */}
      {reportData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-850 dark:text-white">Query Results</h3>
            <span className="text-xs text-slate-400 font-mono">{reportData.length} records returned</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-b border-slate-200/50 dark:border-slate-800/50">
                <tr>
                  {tableHeaders.map((head, idx) => (
                    <th key={idx} scope="col" className="px-6 py-4 capitalize">
                      {head.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reportData.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                    {tableHeaders.map((col, colIdx) => (
                      <td key={colIdx} className="px-6 py-4 text-slate-800 dark:text-slate-300">
                        {row[col] === null ? (
                          <span className="text-slate-400 dark:text-slate-650 italic">NULL</span>
                        ) : typeof row[col] === 'number' && col.includes('price') ? (
                          `$${Number(row[col]).toFixed(2)}`
                        ) : (
                          String(row[col])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
