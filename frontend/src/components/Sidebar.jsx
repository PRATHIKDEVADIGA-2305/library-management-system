import React from 'react';
import { 
  BookOpen, LayoutDashboard, Users, BookMarked, 
  FileText, ShieldAlert, Layers, UserCheck, Settings, LogOut
} from 'lucide-react';

const Sidebar = ({ activePage, setActivePage, handleLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'authors', label: 'Authors', icon: Users },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'members', label: 'Members', icon: UserCheck },
    { id: 'issues', label: 'Issue & Return', icon: BookMarked },
    { id: 'fines', label: 'Fines', icon: ShieldAlert },
    { id: 'reports', label: 'SQL Reports', icon: FileText },
    { id: 'procedures', label: 'Procedures & Triggers', icon: Settings }
  ];

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0">
      <div className="h-full px-3 py-4 overflow-y-auto bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800">
        <div>
          {/* Logo / Branding */}
          <div className="flex items-center gap-2 px-3 py-4 mb-6 border-b border-slate-800">
            <BookOpen className="h-8 w-8 text-library-400" />
            <div>
              <h1 className="text-lg font-bold tracking-wider text-white">BIBLIOTHECA</h1>
              <span className="text-xs text-library-500 font-medium tracking-widest uppercase">Admin Portal</span>
            </div>
          </div>

          {/* Navigation Links */}
          <ul className="space-y-2 font-medium">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActivePage(item.id)}
                    className={`flex items-center w-full gap-3 p-3 rounded-lg text-sm transition-all duration-150 ${
                      isActive 
                        ? 'bg-library-600 text-white shadow-md' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer / Logout */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 p-3 rounded-lg text-sm text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all duration-150"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
