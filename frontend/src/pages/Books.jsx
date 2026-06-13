import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedAut, setSelectedAut] = useState('');

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form states
  const [formId, setFormId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCatId, setFormCatId] = useState('');
  const [formAutId, setFormAutId] = useState('');
  const [formAvailability, setFormAvailability] = useState('Available');

  const fetchFiltersData = async () => {
    try {
      const [autRes, catRes] = await Promise.all([
        fetch('http://localhost:5000/api/authors'),
        fetch('http://localhost:5000/api/categories')
      ]);
      const autData = await autRes.json();
      const catData = await catRes.json();
      if (autData.success) setAuthors(autData.data);
      if (catData.success) setCategories(catData.data);
    } catch (err) {
      console.error('Failed to load filter dropdown lists:', err);
    }
  };

  const fetchBooks = async () => {
    try {
      let url = `http://localhost:5000/api/books?search=${encodeURIComponent(search)}`;
      if (selectedCat) url += `&categoryId=${selectedCat}`;
      if (selectedAut) url += `&authorId=${selectedAut}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setBooks(data.data);
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
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [search, selectedCat, selectedAut]);

  const handleOpenCreate = () => {
    setEditId(null);
    setFormId('');
    setFormTitle('');
    setFormPrice('');
    setFormCatId(categories[0]?.category_id || '');
    setFormAutId(authors[0]?.author_id || '');
    setFormAvailability('Available');
    setError('');
    setShowForm(true);
  };

  const handleOpenEdit = (book) => {
    setEditId(book.book_id);
    setFormId(book.book_id);
    setFormTitle(book.title);
    setFormPrice(book.price || '');
    setFormCatId(book.category_id || '');
    setFormAutId(book.author_id || '');
    setFormAvailability(book.availability || 'Available');
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      book_id: formId,
      title: formTitle,
      price: formPrice,
      category_id: formCatId || null,
      author_id: formAutId || null,
      availability: formAvailability
    };

    try {
      let url = 'http://localhost:5000/api/books';
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
        fetchBooks();
      } else {
        setError(data.error || 'Failed to submit book.');
      }
    } catch (err) {
      setError('Failed to contact server.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/books/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchBooks();
      } else {
        alert(data.error || 'Delete failed.');
      }
    } catch (err) {
      alert('Failed to contact server.');
    }
  };

  const getAuthorName = (id) => {
    const aut = authors.find(a => a.author_id === id);
    return aut ? aut.name : 'Unknown';
  };

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.category_id === id);
    return cat ? cat.category_name : 'Uncategorized';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Books</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Catalog, track price index, and manage book volumes.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-library-600 hover:bg-library-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all text-sm cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Book</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books by title..."
            className="block w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 text-sm placeholder-slate-450"
          />
        </div>

        <div>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 text-sm"
          >
            <option value="">Filter by Category (All)</option>
            {categories.map(cat => (
              <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedAut}
            onChange={(e) => setSelectedAut(e.target.value)}
            className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 text-sm"
          >
            <option value="">Filter by Author (All)</option>
            {authors.map(aut => (
              <option key={aut.author_id} value={aut.author_id}>{aut.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-800 bg-red-50 dark:bg-red-950/20 dark:text-red-250 border border-red-500/20 rounded-lg">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Books Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-library-600 mx-auto"></div>
          </div>
        ) : books.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-12">No books found matching search.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-b border-slate-200/50 dark:border-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4">ID</th>
                  <th scope="col" className="px-6 py-4">Title</th>
                  <th scope="col" className="px-6 py-4">Author</th>
                  <th scope="col" className="px-6 py-4">Category</th>
                  <th scope="col" className="px-6 py-4">Price</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {books.map((book) => (
                  <tr key={book.book_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-700 dark:text-slate-350">{book.book_id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white max-w-[200px] truncate">{book.title}</td>
                    <td className="px-6 py-4">{getAuthorName(book.author_id)}</td>
                    <td className="px-6 py-4">{getCategoryName(book.category_id)}</td>
                    <td className="px-6 py-4 font-mono text-slate-900 dark:text-white">${Number(book.price).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        book.availability === 'Available' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-450 border border-rose-500/20'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${book.availability === 'Available' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{book.availability}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(book)}
                        className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded transition-colors"
                        title="Edit book"
                      >
                        <Edit2 className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(book.book_id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                        title="Delete book"
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
              {editId ? 'Edit Book' : 'Add New Book'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Book ID</label>
                <input
                  type="number"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  disabled={!!editId}
                  required
                  placeholder="e.g. 111"
                  className="block w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 focus:border-transparent transition-all placeholder-slate-450 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  placeholder="Book Title"
                  className="block w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 focus:border-transparent transition-all placeholder-slate-450"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  required
                  placeholder="e.g. 19.99"
                  className="block w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 focus:border-transparent transition-all placeholder-slate-450"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={formCatId}
                  onChange={(e) => setFormCatId(e.target.value)}
                  required
                  className="block w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 transition-all"
                >
                  {categories.map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Author</label>
                <select
                  value={formAutId}
                  onChange={(e) => setFormAutId(e.target.value)}
                  required
                  className="block w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 transition-all"
                >
                  {authors.map(aut => (
                    <option key={aut.author_id} value={aut.author_id}>{aut.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Availability Status</label>
                <select
                  value={formAvailability}
                  onChange={(e) => setFormAvailability(e.target.value)}
                  required
                  className="block w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 transition-all"
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
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
    </div>
  );
};

export default Books;
