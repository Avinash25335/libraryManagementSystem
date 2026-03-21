import { useState, useEffect } from 'react';
import api from '../services/api';
import { History, Calendar, User, Book, IndianRupee, CheckCircle } from 'lucide-react';

const FINE_PER_DAY = 5;

const calcFine = (borrow) => {
  if (borrow.status === 'returned') return borrow.fine || 0;
  const now = new Date();
  const due = new Date(borrow.dueDate);
  if (now <= due) return 0;
  return Math.ceil((now - due) / (1000 * 60 * 60 * 24)) * FINE_PER_DAY;
};

const IssuedBooks = () => {
  const [issued, setIssued] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchIssued = async () => {
      try {
        const res = await api.get('/borrow/admin/all');
        setIssued(res.data);
      } catch (err) {
        console.error('Failed to fetch issued books');
      } finally {
        setLoading(false);
      }
    };
    fetchIssued();
  }, []);

  const markFinePaid = async (borrowId) => {
    try {
      await api.post(`/borrow/pay-fine/${borrowId}`);
      setMessage('Fine marked as paid!');
      setTimeout(() => setMessage(''), 3000);
      const res = await api.get('/borrow/admin/all');
      setIssued(res.data);
    } catch (err) {
      setMessage('Failed to update fine');
    }
  };

  const active = issued.filter(i => i.status === 'issued');
  const returned = issued.filter(i => i.status === 'returned');
  const overdue = issued.filter(i => i.status === 'issued' && new Date(i.dueDate) < new Date());
  const totalFines = issued.reduce((sum, i) => sum + calcFine(i), 0);

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Issued Books</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Track all borrowings, dues, and fines</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active', value: active.length, color: 'border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400' },
          { label: 'Overdue', value: overdue.length, color: 'border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400' },
          { label: 'Returned', value: returned.length, color: 'border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400' },
          { label: 'Total Fines', value: `₹${totalFines}`, color: 'border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400' },
        ].map(s => (
          <div key={s.label} className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 ${s.color}`}>
            <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">{s.label}</p>
            <p className="text-2xl font-black">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toast */}
      {message && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm font-bold">
          ✅ {message}
        </div>
      )}

      {/* Books List */}
      <div className="space-y-3">
        {issued.map((item) => {
          const fine = calcFine(item);
          const isOverdue = item.status === 'issued' && new Date(item.dueDate) < new Date();
          const daysOver = isOverdue ? Math.ceil((new Date() - new Date(item.dueDate)) / (1000 * 60 * 60 * 24)) : 0;

          return (
            <div key={item._id} className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 flex flex-col md:flex-row gap-5 items-center ${
              isOverdue ? 'border-red-200 dark:border-red-900/50' : 'border-slate-200 dark:border-slate-800'
            }`}>
              {/* Cover */}
              <div className="w-14 h-20 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-700 shrink-0">
                {item.bookId?.coverImage
                  ? <img src={item.bookId.coverImage} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><Book size={18} className="text-slate-400" /></div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h4 className="font-black text-slate-900 dark:text-white text-base mb-1">{item.bookId?.title}</h4>
                <div className="flex flex-wrap gap-x-5 gap-y-1 justify-center md:justify-start text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                  <span className="flex items-center gap-1"><User size={12} /> {item.userId?.name}</span>
                  <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">{item.userId?.email}</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                  {isOverdue && <span className="text-red-500 font-black">{daysOver} day{daysOver > 1 ? 's' : ''} overdue</span>}
                </div>

                {/* Fine display */}
                {fine > 0 && (
                  <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-black border ${
                    item.finePaid
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                  }`}>
                    <IndianRupee size={11} />
                    Fine: ₹{fine} {item.finePaid ? '(Paid)' : item.status === 'returned' ? '(Unpaid)' : '(Accruing)'}
                  </div>
                )}
              </div>

              {/* Status + Actions */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  item.status === 'returned' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                  isOverdue ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                }`}>
                  {item.status === 'returned' ? 'Returned' : isOverdue ? 'Overdue' : 'Issued'}
                </span>

                {fine > 0 && !item.finePaid && item.status === 'returned' && (
                  <button
                    onClick={() => markFinePaid(item._id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[10px] font-black transition-colors"
                  >
                    <CheckCircle size={11} /> Mark Paid
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IssuedBooks;
