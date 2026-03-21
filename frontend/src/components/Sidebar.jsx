import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Book, Search, History, Users, LogOut, Moon, Sun, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
  const { user, logout, isDark, toggleDarkMode } = useAuth();
  const location = useLocation();

  const adminLinks = [
    { title: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { title: 'Manage Books', path: '/admin/books', icon: Book },
    { title: 'Issued Books', path: '/admin/issued', icon: History },
    { title: 'Manage Users', path: '/admin/users', icon: Users },
    { title: 'Manage Admins', path: '/admin/managers', icon: ShieldCheck },
  ];

  const librarianLinks = [
    { title: 'Manage Books', path: '/admin/books', icon: Book },
    { title: 'Issued Books', path: '/admin/issued', icon: History },
  ];

  const userLinks = [
    { title: 'My Bookshelf', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Search Books', path: '/search', icon: Search },
    { title: 'My History', path: '/history', icon: History },
  ];

  const links = user?.role === 'admin' ? adminLinks : 
                user?.role === 'librarian' ? librarianLinks : 
                userLinks;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col
      bg-white dark:bg-slate-950
      border-r border-slate-200 dark:border-slate-800
      transition-colors duration-300">

      {/* Logo */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/30">
            <Book size={20} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">LibraryPro</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <link.icon size={19} />
              {link.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
            text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800
            hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          {isDark ? <Sun size={19} /> : <Moon size={19} />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
            text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
