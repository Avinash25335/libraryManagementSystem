import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20',
    secondary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20',
    outline: 'border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20',
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ label, type = 'text', value, onChange, placeholder, required = false, className = '' }) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">{label}</label>}
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium"
    />
  </div>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-slate-900 dark:text-white transition-all duration-300 ${className}`}>
    {children}
  </div>
);

export { Button, Input, Card };
