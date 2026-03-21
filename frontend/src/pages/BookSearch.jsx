import { useState, useEffect } from 'react';
import api from '../services/api';
import { Button, Input, Card } from '../components/UI';
import { Search, Book as BookIcon, CheckCircle2 } from 'lucide-react';

const BookSearch = () => {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/books');
      setBooks(res.data);
    } catch (err) {
      console.error('Failed to fetch books');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleBorrow = async (bookId) => {
    try {
      await api.post('/borrow', { bookId, days: 14 });
      alert('Book borrowed successfully!');
      fetchBooks(); // Refresh availability
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to borrow book');
    }
  };

  const categories = ['All', ...new Set(books.map(b => b.category).filter(Boolean))];

  const filteredBooks = books.filter(book => {
    const matchesQuery = 
      book.title.toLowerCase().includes(query.toLowerCase()) || 
      book.author.toLowerCase().includes(query.toLowerCase()) ||
      book.category.toLowerCase().includes(query.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Explore Library</h2>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by title, author, or category..." 
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white dark:placeholder:text-slate-500 text-sm"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <Card key={book._id} className="group hover:-translate-y-2 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5">
            <div className="relative mb-5 aspect-[3/4] overflow-hidden rounded-2xl shadow-inner">
              <img 
                src={book.coverImage || 'https://via.placeholder.com/300x400?text=No+Cover'} 
                alt={book.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 shadow-sm">
                {book.category}
              </div>
            </div>
            
            <h3 className="font-extrabold text-lg mb-1 line-clamp-1 text-slate-900 dark:text-white">{book.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-5">by {book.author}</p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50">
              <div className="text-xs uppercase tracking-tighter font-bold">
                <span className={`${book.availableCopies > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                  {book.availableCopies} in stock
                </span>
              </div>
              <Button 
                variant={book.availableCopies > 0 ? 'primary' : 'outline'} 
                className="px-6 py-1.5 text-xs rounded-full"
                disabled={book.availableCopies === 0}
                onClick={() => handleBorrow(book._id)}
              >
                {book.availableCopies > 0 ? 'Borrow' : 'Waitlist'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredBooks.length === 0 && !loading && (
        <div className="text-center py-24 bg-white/50 dark:bg-slate-900/20 backdrop-blur rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800/50">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookIcon size={32} className="text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No books found</h3>
          <p className="text-slate-400 dark:text-slate-500 max-w-xs mx-auto text-sm">We couldn't find any books matching your search. Try different keywords.</p>
        </div>
      )}
    </div>
  );
};

export default BookSearch;
