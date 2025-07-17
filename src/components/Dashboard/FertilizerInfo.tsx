import React from 'react';
import { Beaker, Calendar, Target } from 'lucide-react';

interface FertilizerData {
  N: number;
  P: number;
  K: number;
  S: number;
  Zn: number;
  frequency: string;
  sources: string[];
}

interface FertilizerInfoProps {
  data: FertilizerData;
}

const FertilizerInfo: React.FC<FertilizerInfoProps> = ({ data }) => {
  const nutrients = [
    { name: 'Nitrogen (N)', value: data.N, unit: 'kg/acre', color: 'bg-blue-500' },
    { name: 'Phosphorus (P)', value: data.P, unit: 'kg/acre', color: 'bg-purple-500' },
    { name: 'Potassium (K)', value: data.K, unit: 'kg/acre', color: 'bg-orange-500' },
    { name: 'Sulfur (S)', value: data.S, unit: 'kg/acre', color: 'bg-yellow-500' },
    { name: 'Zinc (Zn)', value: data.Zn, unit: 'kg/acre', color: 'bg-green-500' },
  ];

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Beaker className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">Fertilizer Management</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {nutrients.map((nutrient) => (
          <div key={nutrient.name} className="bg-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${nutrient.color}`}></div>
              <span className="text-zinc-300 text-sm">{nutrient.name}</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {nutrient.value}
              <span className="text-sm text-zinc-400 ml-1">{nutrient.unit}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-green-400" />
            <span className="text-zinc-300 font-medium">Application Frequency</span>
          </div>
          <p className="text-white text-lg">{data.frequency}</p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-zinc-300 font-medium">Sources</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.sources.map((source, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-zinc-700 text-zinc-300 text-sm rounded-full"
              >
                {source}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FertilizerInfo;