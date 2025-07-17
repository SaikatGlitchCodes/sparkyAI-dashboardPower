import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  MapPin, 
  Bell, 
  FileText, 
  MessageCircle, 
  Settings,
  LogOut,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const Sidebar: React.FC = () => {
  const { signOut } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, label: t('dashboard'), path: '/dashboard' },
    { icon: Calendar, label: t('scheduler'), path: '/scheduler' },
    { icon: FileText, label: t('reports'), path: '/reports' },
    { icon: Settings, label: t('settings'), path: '/settings' },
  ];

  return (
    <div className="w-64 h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col">
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <h1 className="text-xl font-bold text-white">Sparky AI</h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-green-500 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 w-full text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{t('logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;