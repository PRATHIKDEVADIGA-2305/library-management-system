import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Authors from './pages/Authors';
import Categories from './pages/Categories';
import Members from './pages/Members';
import Issues from './pages/Issues';
import Fines from './pages/Fines';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [activePage, setActivePage] = useState('dashboard');

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
  };

  if (!token) {
    return <Login setToken={setToken} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'books':
        return <Books />;
      case 'authors':
        return <Authors />;
      case 'categories':
        return <Categories />;
      case 'members':
        return <Members />;
      case 'issues':
        return <Issues />;
      case 'fines':
        return <Fines />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Navigation Sidebar */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout} />

      {/* Main Panel Content Area */}
      <div className="sm:ml-64 min-h-screen flex flex-col">
        {/* Top Navbar */}
        <Navbar />

        {/* Dynamic page contents wrapper */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
