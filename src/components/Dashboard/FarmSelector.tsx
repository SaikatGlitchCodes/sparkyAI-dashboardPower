import React, { useState } from 'react';
import { ChevronDown, Plus, MapPin } from 'lucide-react';
import { Farm } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface FarmSelectorProps {
  farms: Farm[];
  selectedFarm: Farm | null;
  onSelectFarm: (farm: Farm) => void;
  onAddFarm: () => void;
}

const FarmSelector: React.FC<FarmSelectorProps> = ({
  farms,
  selectedFarm,
  onSelectFarm,
  onAddFarm,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white hover:bg-zinc-700 transition-colors"
      >
        <MapPin className="w-4 h-4" />
        <span className="font-medium">
          {selectedFarm ? selectedFarm.farm_name : t('dashboard.selectFarm')}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50">
          <div className="p-2">
            {farms.map((farm) => (
              <button
                key={farm.id}
                onClick={() => {
                  onSelectFarm(farm);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">{farm.farm_name}</p>
                  <p className="text-zinc-400 text-sm">{farm.location}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-zinc-700 p-2">
            <button
              onClick={() => {
                onAddFarm();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-zinc-700 rounded-lg transition-colors text-green-500"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">{t('dashboard.addFarm')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmSelector;