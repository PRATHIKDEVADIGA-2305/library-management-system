import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, X, AlertCircle } from 'lucide-react';

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [authorBooks, setAuthorBooks] = useState([]);

  // Form states
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formCountry, setFormCountry] = useState('');

  const fetchAuthors = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/authors?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setAuthors(data.data);
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
    fetchAuthors();
  }, [search]);

  const handleOpenCreate = () => {
    setEditId(null);
    setFormId('');
    setFormName('');
    setFormCountry('');
    setError('');
    setShowForm(true);
  };

  const handleOpenEdit = (author) => {
    setEditId(author.author_id);
    setFormId(author.author_id);
    setFormName(author.name);
    setFormCountry(author.country || '');
    setError('');
    setShowForm(true);
  };

  const handleOpenDetail = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/authors/${id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedAuthor(data.author);
        setAuthorBooks(data.books);
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
      author_id: formId,
      name: formName,
      country: formCountry
    };

    try {
      let url = 'http://localhost:5000/api/authors';
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
        fetchAuthors();
      } else {
        setError(data.error || 'Failed to submit form.');
      }
    } catch (err) {
      setError('Failed to contact server.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this author? This will set author references in books to null.')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/authors/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAuthors();
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
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Authors</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and track library book authors.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-library-600 hover:bg-library-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all text-sm cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Author</span>
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
          placeholder="Search authors by name or country..."
          className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 focus:border-transparent transition-all text-sm placeholder-slate-400"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-800 bg-red-50 dark:bg-red-950/20 dark:text-red-250 border border-red-500/20 rounded-lg">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Authors Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-library-600 mx-auto"></div>
          </div>
        ) : authors.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-12">No authors found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-b border-slate-200/50 dark:border-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4">ID</th>
                  <th scope="col" className="px-6 py-4">Name</th>
                  <th scope="col" className="px-6 py-4">Country</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {authors.map((author) => (
                  <tr key={author.author_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-700 dark:text-slate-350">{author.author_id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{author.name}</td>
                    <td className="px-6 py-4">{author.country || 'N/A'}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenDetail(author.author_id)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded transition-colors"
                        title="View details"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(author)}
                        className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded transition-colors"
                        title="Edit author"
                      >
                        <Edit2 className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(author.author_id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                        title="Delete author"
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
              {editId ? 'Edit Author' : 'Add New Author'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Author ID</label>
                <input
                  type="number"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  disabled={!!editId}
                  required
                  placeholder="e.g. 7"
                  className="block w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 focus:border-transparent transition-all placeholder-slate-450 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="Author Full Name"
                  className="block w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 focus:border-transparent transition-all placeholder-slate-450"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Country</label>
                <input
                  type="text"
                  value={formCountry}
                  onChange={(e) => setFormCountry(e.target.value)}
                  placeholder="Country of Origin"
                  className="block w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 focus:border-transparent transition-all placeholder-slate-450"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors text-sm cursor-pointer"
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
      {showDetail && selectedAuthor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl">
            <button
              onClick={() => setShowDetail(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{selectedAuthor.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Country of Origin: <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedAuthor.country || 'N/A'}</span></p>
            
            <div className="mt-6">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Books Written ({authorBooks.length})</h3>
              {authorBooks.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic">No books logged for this author.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-105 dark:border-slate-800 rounded-lg p-2 bg-slate-50 dark:bg-slate-950/20">
                  {authorBooks.map(book => (
                    <div key={book.book_id} className="flex justify-between items-center text-xs p-2.5 bg-white dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-850">
                      <div>
                        <p className="font-semibold text-slate-850 dark:text-slate-200">{book.title}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">ID: {book.book_id}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        book.availability === 'Available' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {book.availability}
                      </span>
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

export default Authors;
