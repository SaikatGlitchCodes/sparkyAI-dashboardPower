import React from 'react';
import { Bug, AlertTriangle, Shield } from 'lucide-react';

interface PestDiseaseData {
  diseases: Array<{
    name: string;
    treatment: string;
  }>;
  pests: Array<{
    name: string;
    treatment: string;
  }>;
}

interface PestDiseaseOverviewProps {
  data: PestDiseaseData;
}

const PestDiseaseOverview: React.FC<PestDiseaseOverviewProps> = ({ data }) => {
  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-500/20 rounded-lg">
          <Shield className="w-5 h-5 text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">Pest & Disease Management</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <h4 className="text-lg font-medium text-white">Diseases</h4>
          </div>
          <div className="space-y-3">
            {data.diseases.map((disease, index) => (
              <div key={index} className="bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{disease.name}</span>
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                    Disease
                  </span>
                </div>
                <p className="text-zinc-400 text-sm">{disease.treatment}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bug className="w-4 h-4 text-red-400" />
            <h4 className="text-lg font-medium text-white">Pests</h4>
          </div>
          <div className="space-y-3">
            {data.pests.map((pest, index) => (
              <div key={index} className="bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{pest.name}</span>
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                    Pest
                  </span>
                </div>
                <p className="text-zinc-400 text-sm">{pest.treatment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PestDiseaseOverview;