import React from 'react';
import { Flower, Scissors, AlertCircle } from 'lucide-react';

interface WeedData {
  potential_weeds: Array<{
    name: string;
    solution: string;
  }>;
}

interface WeedManagementProps {
  data: WeedData;
}

const WeedManagement: React.FC<WeedManagementProps> = ({ data }) => {
  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-500/20 rounded-lg">
          <Flower className="w-5 h-5 text-yellow-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">Weed Management</h3>
      </div>

      <div className="space-y-4">
        {data.potential_weeds.map((weed, index) => (
          <div key={index} className="bg-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-medium">{weed.name}</span>
              </div>
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                Weed
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Scissors className="w-4 h-4" />
              <span className="text-sm">Solution: {weed.solution}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg">
        <p className="text-yellow-400 text-sm">
          🌱 <strong>Tip:</strong> Regular monitoring and early intervention are key to effective weed management.
        </p>
      </div>
    </div>
  );
};

export default WeedManagement;