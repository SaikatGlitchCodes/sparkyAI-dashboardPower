import React, { useState } from 'react';
import { Bell, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const Header: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-white">{t('dashboard')}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="w-2 h-2 bg-white rounded-full"></span>
            </span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-zinc-800 rounded-lg shadow-lg border border-zinc-700 z-50">
              <div className="p-4 border-b border-zinc-700">
                <h3 className="font-medium text-white">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="p-3 border-b border-zinc-700 hover:bg-zinc-700 cursor-pointer">
                  <p className="text-sm text-white">Rain forecasted: Delay irrigation</p>
                  <p className="text-xs text-zinc-400 mt-1">2 hours ago</p>
                </div>
                <div className="p-3 border-b border-zinc-700 hover:bg-zinc-700 cursor-pointer">
                  <p className="text-sm text-white">Use Zinc sulfate next week</p>
                  <p className="text-xs text-zinc-400 mt-1">5 hours ago</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 text-zinc-400">
          <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">{user?.phone || 'User'}</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
};

export default Header;