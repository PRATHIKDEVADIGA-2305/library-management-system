import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form states
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/categories?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
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
    fetchCategories();
  }, [search]);

  const handleOpenCreate = () => {
    setEditId(null);
    setFormId('');
    setFormName('');
    setError('');
    setShowForm(true);
  };

  const handleOpenEdit = (category) => {
    setEditId(category.category_id);
    setFormId(category.category_id);
    setFormName(category.category_name);
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      category_id: formId,
      category_name: formName
    };

    try {
      let url = 'http://localhost:5000/api/categories';
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
        fetchCategories();
      } else {
        setError(data.error || 'Failed to submit form.');
      }
    } catch (err) {
      setError('Failed to contact server.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This will set category references in books to null.')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchCategories();
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
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Categories</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and organize library classification subjects.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-library-600 hover:bg-library-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all text-sm cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Create Category</span>
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
          placeholder="Search categories..."
          className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 focus:border-transparent transition-all text-sm placeholder-slate-400"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-800 bg-red-50 dark:bg-red-950/20 dark:text-red-250 border border-red-500/20 rounded-lg">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-library-600 mx-auto"></div>
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-12">No categories found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-b border-slate-200/50 dark:border-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4">ID</th>
                  <th scope="col" className="px-6 py-4">Category Name</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {categories.map((category) => (
                  <tr key={category.category_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-700 dark:text-slate-350">{category.category_id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{category.category_name}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(category)}
                        className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded transition-colors"
                        title="Edit category"
                      >
                        <Edit2 className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.category_id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                        title="Delete category"
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
              {editId ? 'Edit Category' : 'Create Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category ID</label>
                <input
                  type="number"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  disabled={!!editId}
                  required
                  placeholder="e.g. 60"
                  className="block w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 focus:border-transparent transition-all placeholder-slate-450 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="Category Name"
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
    </div>
  );
};

export default Categories;
