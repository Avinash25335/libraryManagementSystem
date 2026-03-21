import { useState, useEffect } from 'react';
import api from '../services/api';
import AddBook from '../components/AddBook';
import { Card } from '../components/UI';
import { Users, Book, History, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalBooks: 0, totalUsers: 0, issuedBooks: 0, overdue: 0 });
  const [showAddBook, setShowAddBook] = useState(false);

  const fetchStats = async () => {
    try {
      const booksRes = await api.get('/books');
      const issuedRes = await api.get('/borrow/admin/all');
      const usersRes = await api.get('/auth/users');
      setStats({
        totalBooks: booksRes.data.length,
        totalUsers: usersRes.data.length,
        issuedBooks: issuedRes.data.filter(b => b.status === 'issued').length,
        overdue: issuedRes.data.filter(b => new Date(b.dueDate) < new Date() && b.status === 'issued').length
      });
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className={`border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{title}</p>
          <h3 className="text-3xl font-black mt-1 text-slate-800 dark:text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg bg-slate-100 dark:bg-slate-800`}>
          <Icon size={24} className="text-slate-600 dark:text-emerald-400" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-slate-700 dark:text-slate-300">Overview of library operations</p>
        </div>
        <button 
          onClick={() => setShowAddBook(!showAddBook)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
        >
          {showAddBook ? 'View Stats' : '+ Add New Book'}
        </button>
      </div>

      {!showAddBook ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Books" value={stats.totalBooks} icon={Book} color="border-blue-500" />
            <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="border-emerald-500" />
            <StatCard title="Issued Books" value={stats.issuedBooks} icon={History} color="border-amber-500" />
            <StatCard title="Overdue" value={stats.overdue} icon={AlertCircle} color="border-red-500" />
          </div>

          <Card className="min-h-[400px]">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">Recent Activity</h3>
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 py-20">
              <History size={48} className="mb-3 opacity-30" />
              <p className="font-medium text-sm">Activity logs will appear here...</p>
            </div>
          </Card>
        </>
      ) : (
        <AddBook onBookAdded={() => { 
          setShowAddBook(false); 
          fetchStats(); // Correctly refreshing stats
        }} />
      )}
    </div>
  );
};

export default AdminDashboard;
