import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserFarms } from '../lib/supabase';
import { getForecastWeather, WeatherData, getFarmerData, FarmerData } from '../lib/api';
import { Farm, FarmData } from '../types';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import FarmSelector from '../components/Dashboard/FarmSelector';
import FertilizerInfo from '../components/Dashboard/FertilizerInfo';
import IrrigationCalendar from '../components/Dashboard/IrrigationCalendar';
import YieldEstimation from '../components/Dashboard/YieldEstimation';
import PestDiseaseOverview from '../components/Dashboard/PestDiseaseOverview';
import WeedManagement from '../components/Dashboard/WeedManagement';
import AIChat from '../components/Dashboard/AIChat';
import FarmMap from '../components/Dashboard/FarmMap';
import WeatherForecast from '../components/Dashboard/WeatherForecast';
import CropHealthMonitor from '../components/Dashboard/CropHealthMonitor';
import AdvancedFieldAnalytics from '../components/Dashboard/AdvancedFieldAnalytics';
import AIInsightsPanel from '../components/Dashboard/AIInsightsPanel';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [farmerData, setFarmerData] = useState<FarmerData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [farmerDataLoading, setFarmerDataLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sample farm data
  const sampleFarmData: FarmData = {
    UID: 'user-123',
    fieldID: '1752169888334',
    Crop: 'Apple',
    Fertilizer: {
      N: 120,
      P: 60,
      K: 80,
      S: 25,
      Zn: 5,
      frequency: 'Every 21 days',
      sources: ['Urea', 'Gypsum', 'Potash', 'Zinc Sulfate'],
    },
    GrowthAndYieldEstimation: {
      expected_yield_per_acre: 1200,
      harvesting_period: 'October 2024',
    },
    Irrigation: [
      {
        date: '2024-01-15',
        quantity_mm: 25,
        time: '06:00 AM',
        precipitation_probability: 20,
      },
      {
        date: '2024-01-16',
        quantity_mm: 30,
        time: '06:00 AM',
        precipitation_probability: 85,
      },
      {
        date: '2024-01-17',
        quantity_mm: 25,
        time: '06:00 AM',
        precipitation_probability: 45,
      },
      {
        date: '2024-01-18',
        quantity_mm: 20,
        time: '06:00 AM',
        precipitation_probability: 10,
      },
    ],
    PestAndDisease: {
      diseases: [
        { name: 'Early Leaf Spot', treatment: 'Chlorothalonil' },
        { name: 'Collar Rot', treatment: 'Carbendazim' },
      ],
      pests: [
        { name: 'Aphids', treatment: 'Neem Oil' },
        { name: 'Thrips', treatment: 'Spinosad' },
      ],
    },
    Weed: {
      potential_weeds: [
        { name: 'Amaranthus', solution: 'Manual weeding' },
        { name: 'Cynodon dactylon', solution: 'Mulching' },
      ],
    },
  };

  useEffect(() => {
    fetchFarms();
  }, [user?.phone]);

  useEffect(() => {
    if (selectedFarm?.field_id) {
      fetchWeatherData(selectedFarm.field_id);
      fetchFarmerData(selectedFarm.field_id);
    }
  }, [selectedFarm]);

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

  const fetchWeatherData = async (fieldId: string) => {
    setWeatherLoading(true);
    try {
      const weather = await getForecastWeather(fieldId);
      setWeatherData(weather);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWeatherData(null);
    } finally {
      setWeatherLoading(false);
    }
  };

  const fetchFarmerData = async (fieldId: string) => {
    setFarmerDataLoading(true);
    try {
      const data = await getFarmerData(fieldId);
      setFarmerData(data);
    } catch (error) {
      console.error('Error fetching farmer data:', error);
      setFarmerData(null);
    } finally {
      setFarmerDataLoading(false);
    }
  };

  const handleAddFarm = () => {
    // Navigate to farm creation
    window.location.href = '/farm-setup';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
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
              <h1 className="text-3xl font-bold text-white">Farm Dashboard</h1>
              <FarmSelector
                farms={farms}
                selectedFarm={selectedFarm}
                onSelectFarm={setSelectedFarm}
                onAddFarm={handleAddFarm}
              />
            </div>

            {selectedFarm ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <FarmMap farm={selectedFarm} />
                </div>
                
                <div className="lg:col-span-2">
                  {weatherLoading ? (
                    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-zinc-400">Loading weather data...</p>
                      </div>
                    </div>
                  ) : weatherData ? (
                    <WeatherForecast data={weatherData} />
                  ) : (
                    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-zinc-400">Weather data unavailable</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="lg:col-span-2">
                  {farmerDataLoading ? (
                    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-zinc-400">Loading crop health data...</p>
                      </div>
                    </div>
                  ) : farmerData ? (
                    <CropHealthMonitor data={farmerData} />
                  ) : (
                    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-zinc-400">Crop health data unavailable</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="lg:col-span-2">
                  <FertilizerInfo data={sampleFarmData.Fertilizer} />
                </div>
                
                <IrrigationCalendar 
                  data={sampleFarmData.Irrigation} 
                  weatherData={weatherData}
                />
                
                <YieldEstimation 
                  crop={sampleFarmData.Crop}
                  data={sampleFarmData.GrowthAndYieldEstimation}
                />
                
                <div className="lg:col-span-2">
                  <PestDiseaseOverview data={sampleFarmData.PestAndDisease} />
                </div>
                
                <div className="lg:col-span-2">
                  <WeedManagement data={sampleFarmData.Weed} />
                </div>
                
                <div className="lg:col-span-2">
                  {farmerData && (
                    <AdvancedFieldAnalytics data={farmerData} />
                  )}
                </div>
                
                <div className="lg:col-span-2">
                  <AIInsightsPanel 
                    farmData={selectedFarm}
                    weatherData={weatherData}
                    cropHealthData={farmerData}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-zinc-400 mb-4">
                  No farms found. Create your first farm to get started.
                </div>
                <button
                  onClick={handleAddFarm}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Create Farm
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
      <AIChat 
        farmContext={{
          fieldId: selectedFarm?.field_id,
          crop: selectedFarm?.crop,
          location: selectedFarm?.location,
          fieldArea: farmerData?.FieldArea,
          ndvi: farmerData?.Health?.ndvi ? Object.values(farmerData.Health.ndvi)[0] as string : undefined,
          evi: farmerData?.Health?.evi ? Object.values(farmerData.Health.evi)[0] as string : undefined,
          lai: farmerData?.Health?.lai ? Object.values(farmerData.Health.lai)[0] as string : undefined,
        }}
      />
    </div>
  );
};

export default Dashboard;