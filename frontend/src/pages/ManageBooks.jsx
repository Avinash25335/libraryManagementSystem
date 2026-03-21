import { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Plus, Trash2, Edit3, BookOpen, X, Check } from 'lucide-react';

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingBook, setEditingBook] = useState(null);
  const [editData, setEditData] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchBooks = async () => {
    try {
      const res = await api.get('/books');
      setBooks(res.data);
    } catch (err) {
      showMessage('Failed to load books', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const startEdit = (book) => {
    setEditingBook(book._id);
    setEditData({
      title: book.title,
      author: book.author,
      category: book.category,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
    });
  };

  const cancelEdit = () => { setEditingBook(null); setEditData({}); };

  const saveEdit = async (bookId) => {
    try {
      await api.put(`/books/${bookId}`, editData);
      showMessage('Book updated successfully!');
      fetchBooks();
      cancelEdit();
    } catch (err) {
      showMessage('Failed to update book', 'error');
    }
  };

  const deleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    setDeletingId(bookId);
    try {
      await api.delete(`/books/${bookId}`);
      showMessage('Book deleted successfully!');
      fetchBooks();
    } catch (err) {
      showMessage('Failed to delete book', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = books.filter(b =>
    b.title?.toLowerCase().includes(query.toLowerCase()) ||
    b.author?.toLowerCase().includes(query.toLowerCase()) ||
    b.category?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Manage Books</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">View, edit and delete books in the library</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search books..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
          />
        </div>
      </div>

      {/* Toast */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium border ${
          message.type === 'error'
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
            : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
        }`}>
          <Check size={16} />
          {message.text}
        </div>
      )}

      {/* Table */}
      <div className="glass overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-20 gap-4">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-4 px-6 text-left font-bold text-slate-700 dark:text-slate-200">Book</th>
                  <th className="py-4 px-6 text-left font-bold text-slate-700 dark:text-slate-200 hidden md:table-cell">Category</th>
                  <th className="py-4 px-6 text-center font-bold text-slate-700 dark:text-slate-200">Total</th>
                  <th className="py-4 px-6 text-center font-bold text-slate-700 dark:text-slate-200">Available</th>
                  <th className="py-4 px-6 text-center font-bold text-slate-700 dark:text-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(book => (
                  <tr key={book._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    {editingBook === book._id ? (
                      <>
                        <td className="py-3 px-6" colSpan={4}>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                              { key: 'title', label: 'Title', type: 'text' },
                              { key: 'author', label: 'Author', type: 'text' },
                              { key: 'category', label: 'Category', type: 'text' },
                              { key: 'totalCopies', label: 'Total Copies', type: 'number' },
                            ].map(({ key, label, type }) => (
                              <div key={key}>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">{label}</label>
                                <input
                                  type={type}
                                  value={editData[key]}
                                  onChange={e => setEditData({ ...editData, [key]: e.target.value })}
                                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => saveEdit(book._id)} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                              <Check size={16} />
                            </button>
                            <button onClick={cancelEdit} className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-lg transition-colors">
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                              {book.coverImage
                                ? <img src={book.coverImage} alt="" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center"><BookOpen size={18} className="text-slate-400" /></div>
                              }
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{book.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">by {book.author}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 hidden md:table-cell">
                          <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold">{book.category}</span>
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-slate-700 dark:text-slate-200">{book.totalCopies}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`font-bold ${book.availableCopies > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                            {book.availableCopies}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => startEdit(book)} className="p-2 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg transition-colors">
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => deleteBook(book._id)}
                              disabled={deletingId === book._id}
                              className="p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && !loading && (
              <div className="text-center py-16">
                <BookOpen size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No books match your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBooks;
