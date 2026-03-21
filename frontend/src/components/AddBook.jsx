import { useState } from 'react';
import { Button, Input, Card } from '../components/UI';
import { Search, Plus, Save, Book as BookIcon } from 'lucide-react';
import api from '../services/api';

const AddBook = ({ onBookAdded }) => {
  const [manualData, setManualData] = useState({
    title: '', author: '', category: '', isbn: '', description: '', coverImage: '', totalCopies: 1, availableCopies: 1
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [copiesToAdd, setCopiesToAdd] = useState(1);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/books', manualData);
      alert('Book added successfully!');
      setManualData({ title: '', author: '', category: '', isbn: '', description: '', coverImage: '', totalCopies: 1, availableCopies: 1 });
      if (onBookAdded) onBookAdded();
    } catch (err) {
      alert('Failed to add book');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const res = await api.get(`/books/external-search?q=${searchQuery}`);
      setSearchResults(res.data);
    } catch (err) {
      alert('Search failed');
    }
    setIsSearching(false);
  };

  const handleQuickAdd = async () => {
    try {
      const bookToAdd = { ...selectedBook, totalCopies: copiesToAdd, availableCopies: copiesToAdd };
      await api.post('/books', bookToAdd);
      alert('Book added to library!');
      setSelectedBook(null);
      setSearchResults([]);
      setSearchQuery('');
      if (onBookAdded) onBookAdded();
    } catch (err) {
      alert('Failed to add book');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Manual Entry */}
      <Card>
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Plus className="text-blue-500" /> Manual Book Entry
        </h3>
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <Input label="Title" value={manualData.title} onChange={e => setManualData({...manualData, title: e.target.value})} required />
          <Input label="Author" value={manualData.author} onChange={e => setManualData({...manualData, author: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" value={manualData.category} onChange={e => setManualData({...manualData, category: e.target.value})} />
            <Input label="ISBN" value={manualData.isbn} onChange={e => setManualData({...manualData, isbn: e.target.value})} />
          </div>
          <Input label="Cover Image URL" value={manualData.coverImage} onChange={e => setManualData({...manualData, coverImage: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Total Copies" type="number" value={manualData.totalCopies} onChange={e => setManualData({...manualData, totalCopies: parseInt(e.target.value), availableCopies: parseInt(e.target.value)})} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
            <textarea 
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-slate-900 dark:text-white h-24 text-sm resize-none"
              value={manualData.description}
              onChange={e => setManualData({...manualData, description: e.target.value})}
            />
          </div>
          <Button type="submit" className="w-full flex items-center justify-center gap-2">
            <Save size={18} /> Save to Library
          </Button>
        </form>
      </Card>

      {/* API Search Entry */}
      <Card>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Search className="text-emerald-500" /> Search &amp; Add Automatically
        </h3>
        <div className="flex gap-2 mb-6">
          <Input 
            placeholder="Search book title or author..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="flex-1"
          />
          <Button variant="secondary" onClick={handleSearch} disabled={isSearching}>
            {isSearching ? '...' : <Search size={20} />}
          </Button>
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {searchResults.map((book, idx) => (
            <div key={idx} className="flex gap-4 p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <img src={book.coverImage || 'https://via.placeholder.com/150'} alt={book.title} className="w-20 h-28 object-cover rounded shadow" />
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-slate-900 dark:text-white truncate">{book.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">by {book.author}</p>
                <Button size="sm" variant="outline" className="text-xs" onClick={() => setSelectedBook(book)}>
                  Add this book
                </Button>
              </div>
            </div>
          ))}
          {searchResults.length === 0 && !isSearching && (
            <div className="text-center py-10 text-slate-400">
              <BookIcon size={48} className="mx-auto mb-2 opacity-20" />
              <p>No results yet. Try searching for a book.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Add Modal/Form */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">Add Copies to Library</h3>
            <div className="flex gap-4 mb-6">
              <img src={selectedBook.coverImage} alt="" className="w-24 h-32 object-cover rounded shadow-lg" />
              <div>
                <p className="font-black text-slate-900 dark:text-white">{selectedBook.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedBook.author}</p>
                <div className="mt-4">
                  <Input label="Number of Copies" type="number" value={copiesToAdd} onChange={e => setCopiesToAdd(parseInt(e.target.value))} />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleQuickAdd}>Confirm Add</Button>
              <Button variant="outline" className="flex-1" onClick={() => setSelectedBook(null)}>Cancel</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AddBook;
