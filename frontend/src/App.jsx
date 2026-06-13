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
import Reports from './pages/Reports';
import ProceduresTriggers from './pages/ProceduresTriggers';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [activePage, setActivePage] = useState('dashboard');
  const [dbType, setDbType] = useState('mock');

  useEffect(() => {
    const checkDbType = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/db-type');
        const data = await res.json();
        setDbType(data.dbType || 'mock');
      } catch (err) {
        console.warn('Could not query database driver mode from server, defaulting to mock fallback.');
        setDbType('mock');
      }
    };
    if (token) {
      checkDbType();
    }
  }, [token]);

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
      case 'reports':
        return <Reports />;
      case 'procedures':
        return <ProceduresTriggers />;
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
        <Navbar dbType={dbType} />

        {/* Dynamic page contents wrapper */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
