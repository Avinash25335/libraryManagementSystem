import { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, Button } from '../components/UI';
import { BookOpen, Calendar, Clock, RotateCcw, AlertTriangle, IndianRupee } from 'lucide-react';

const FINE_PER_DAY = 5;

const calcLiveFine = (borrow) => {
  if (borrow.status === 'returned') return borrow.fine || 0;
  const now = new Date();
  const due = new Date(borrow.dueDate);
  if (now <= due) return 0;
  return Math.ceil((now - due) / (1000 * 60 * 60 * 24)) * FINE_PER_DAY;
};

const daysOverdue = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  if (now <= due) return 0;
  return Math.ceil((now - due) / (1000 * 60 * 60 * 24));
};

const UserDashboard = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ active: 0, returned: 0, overdue: 0, totalFine: 0 });

  const fetchHistory = async () => {
    try {
      const res = await api.get('/borrow/history');
      setHistory(res.data);
      const active = res.data.filter(b => b.status === 'issued').length;
      const returned = res.data.filter(b => b.status === 'returned').length;
      const overdue = res.data.filter(b => b.status === 'issued' && new Date(b.dueDate) < new Date()).length;
      const totalFine = res.data.reduce((sum, b) => sum + calcLiveFine(b), 0);
      setStats({ active, returned, overdue, totalFine });
    } catch (err) {
      console.error('Failed to fetch history');
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleReturn = async (id) => {
    try {
      const res = await api.post(`/borrow/return/${id}`);
      const fine = res.data.fine;
      if (fine > 0) {
        alert(`📚 Book returned!\n\n⚠️ Fine incurred: ₹${fine}\nPlease pay the fine at the library counter.`);
      } else {
        alert('✅ Book returned successfully! No fine.');
      }
      fetchHistory();
    } catch (err) {
      alert('Failed to return book');
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, sub }) => (
    <div className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 ${color}`}>
      <Icon size={26} className="mb-3 opacity-80" />
      <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">{label}</p>
      <p className="text-3xl font-black">{value}</p>
      {sub && <p className="text-xs mt-1 opacity-60 font-medium">{sub}</p>}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">My Bookshelf</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage your borrowed books and activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Active" value={stats.active} color="border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400" />
        <StatCard icon={RotateCcw} label="Returned" value={stats.returned} color="border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400" />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdue} color="border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400" />
        <StatCard icon={IndianRupee} label="Pending Fine" value={`₹${stats.totalFine}`} color="border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400" sub="₹5 per day overdue" />
      </div>

      {/* History */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white border-b-2 border-slate-200 dark:border-slate-800 pb-3">Recent Activity</h2>

        {history.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <BookOpen size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="font-bold text-slate-600 dark:text-slate-400">No books borrowed yet.</p>
            <a href="/search" className="text-blue-600 dark:text-blue-400 font-bold text-sm mt-2 inline-block hover:underline">Explore the Library →</a>
          </div>
        )}

        {history.map((borrow) => {
          const liveFine = calcLiveFine(borrow);
          const overdueDays = borrow.status === 'issued' ? daysOverdue(borrow.dueDate) : 0;
          const isOverdue = overdueDays > 0;

          return (
            <div key={borrow._id} className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 flex flex-col md:flex-row gap-5 items-center transition-all ${
              isOverdue ? 'border-red-200 dark:border-red-900/50' : 'border-slate-200 dark:border-slate-800'
            }`}>
              {/* Cover */}
              <div className="w-20 h-28 rounded-xl overflow-hidden shadow-md border border-slate-100 dark:border-slate-700 shrink-0">
                {borrow.bookId?.coverImage
                  ? <img src={borrow.bookId.coverImage} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><BookOpen size={24} className="text-slate-400" /></div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1">{borrow.bookId?.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-3">by {borrow.bookId?.author}</p>

                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-xs font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Calendar size={13} className="text-blue-500" />
                    Borrowed: {new Date(borrow.borrowDate).toLocaleDateString()}
                  </span>
                  <span className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                    <Clock size={13} className={isOverdue ? 'text-red-500' : 'text-amber-500'} />
                    Due: {new Date(borrow.dueDate).toLocaleDateString()}
                    {isOverdue && ` (${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue)`}
                  </span>
                </div>

                {/* Fine Badge */}
                {liveFine > 0 && (
                  <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-black border transition-all ${
                    borrow.finePaid
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                  }`}>
                    <IndianRupee size={12} />
                    {borrow.finePaid 
                      ? `Fine Paid: ₹${liveFine}` 
                      : borrow.status === 'returned' 
                        ? `Unpaid Fine: ₹${liveFine}`
                        : `Accrued Fine: ₹${liveFine} (₹5/day)`}
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="shrink-0">
                {borrow.status === 'issued' ? (
                  <button
                    onClick={() => handleReturn(borrow._id)}
                    className={`px-6 py-2.5 rounded-full text-xs font-black text-white transition-colors ${
                      isOverdue
                        ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20'
                    }`}
                  >
                    Return Book
                  </button>
                ) : (
                  <div className="px-5 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-black flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                    <RotateCcw size={13} /> Returned
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserDashboard;
