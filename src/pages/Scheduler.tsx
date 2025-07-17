import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getUserFarms } from '../lib/supabase';
import { Farm } from '../types';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import FarmSelector from '../components/Dashboard/FarmSelector';
import ActivityScheduler from '../components/Scheduler/ActivityScheduler';

const Scheduler: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFarms();
  }, [user?.phone]);

  const fetchFarms = async () => {
    if (!user?.phone) return;

    try {
      const { data, error } = await getUserFarms(user.phone);
      if (error) throw error;
      
      setFarms(data || []);
      if (data && data.length > 0) {
        setSelectedFarm(data[0]);
      }
    } catch (error) {
      console.error('Error fetching farms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFarm = () => {
    window.location.href = '/farm-setup';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
              <FarmSelector
                farms={farms}
                selectedFarm={selectedFarm}
                onSelectFarm={setSelectedFarm}
                onAddFarm={handleAddFarm}
              />
            </div>

            {selectedFarm ? (
              <ActivityScheduler farmId={selectedFarm.id} />
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                <p className="text-zinc-400 mb-2">{t('dashboard.noFarms')}</p>
                <button
                  onClick={handleAddFarm}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {t('dashboard.createFarm')}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Scheduler;