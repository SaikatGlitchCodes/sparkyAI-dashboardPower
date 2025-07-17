import React from 'react';
import { TrendingUp, Calendar, Target } from 'lucide-react';

interface YieldData {
  expected_yield_per_acre: number;
  harvesting_period: string;
}

interface YieldEstimationProps {
  crop: string;
  data: YieldData;
}

const YieldEstimation: React.FC<YieldEstimationProps> = ({ crop, data }) => {
  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <TrendingUp className="w-5 h-5 text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">Growth & Yield Estimation</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-green-400" />
            <span className="text-zinc-300 font-medium">Crop</span>
          </div>
          <p className="text-2xl font-bold text-white">{crop}</p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-zinc-300 font-medium">Expected Yield</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {data.expected_yield_per_acre.toLocaleString()}
            <span className="text-sm text-zinc-400 ml-1">kg/acre</span>
          </p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4 md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="text-zinc-300 font-medium">Expected Harvest</span>
          </div>
          <p className="text-xl font-bold text-white">{data.harvesting_period}</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-green-900/20 border border-green-800 rounded-lg">
        <p className="text-green-400 text-sm">
          💡 <strong>AI Insight:</strong> Based on current conditions and historical data, 
          your {crop.toLowerCase()} crop is on track for optimal harvest timing.
        </p>
      </div>
    </div>
  );
};

export default YieldEstimation;