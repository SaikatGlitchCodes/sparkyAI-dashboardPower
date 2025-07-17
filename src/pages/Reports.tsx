import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, TrendingUp, BarChart3, PieChart, Activity, Droplets } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getUserFarms } from '../lib/supabase';
import { getForecastWeather, getFarmerData } from '../lib/api';
import { Farm } from '../types';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import FarmSelector from '../components/Dashboard/FarmSelector';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<'crop-health' | 'weather' | 'activities' | 'yield' | 'financial'>('crop-health');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    fetchFarms();
  }, [user?.phone]);

  useEffect(() => {
    if (selectedFarm) {
      generateReportData();
    }
  }, [selectedFarm, reportType, dateRange]);

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

  const generateReportData = async () => {
    if (!selectedFarm) return;

    try {
      switch (reportType) {
        case 'crop-health':
          await generateCropHealthReport();
          break;
        case 'weather':
          await generateWeatherReport();
          break;
        case 'activities':
          generateActivitiesReport();
          break;
        case 'yield':
          generateYieldReport();
          break;
        case 'financial':
          generateFinancialReport();
          break;
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const generateCropHealthReport = async () => {
    try {
      const farmerData = await getFarmerData(selectedFarm!.field_id);
      
      // Process health data for charts
      const healthIndices = Object.entries(farmerData.Health).map(([index, values]: [string, any]) => {
        const latestDate = Object.keys(values)[0];
        return {
          index: index.toUpperCase(),
          value: parseFloat(values[latestDate]),
          status: getHealthStatus(parseFloat(values[latestDate]), index),
        };
      });

      // Index breakdown for distribution chart
      const latestDate = Object.keys(farmerData.IndexBreakdown)[0];
      const ndviDistribution = farmerData.IndexBreakdown[latestDate]?.ndvi?.map((value: string, index: number) => ({
        category: `Level ${index + 1}`,
        value: parseInt(value),
        percentage: (parseInt(value) / farmerData.FieldArea * 100).toFixed(1),
      })) || [];

      setReportData({
        type: 'crop-health',
        healthIndices,
        ndviDistribution,
        fieldArea: farmerData.FieldArea,
        cropCode: farmerData.CropCode,
        lastUpdated: latestDate,
        summary: {
          overallHealth: calculateOverallHealth(healthIndices),
          criticalIssues: identifyCriticalIssues(healthIndices),
          recommendations: generateHealthRecommendations(healthIndices),
        }
      });
    } catch (error) {
      console.error('Error generating crop health report:', error);
    }
  };

  const generateWeatherReport = async () => {
    try {
      const weatherData = await getForecastWeather(selectedFarm!.field_id);
      
      const dailyData = weatherData.daily.slice(0, 7).map((day, index) => ({
        day: `Day ${index + 1}`,
        date: new Date(day.dt * 1000).toLocaleDateString(),
        maxTemp: Math.round(day.temp.max - 273.15),
        minTemp: Math.round(day.temp.min - 273.15),
        humidity: day.humidity,
        rainfall: Math.round(day.pop * 100),
        windSpeed: Math.round(day.wind_speed),
        uvIndex: day.uvi,
      }));

      const weatherSummary = {
        avgTemp: Math.round(dailyData.reduce((sum, day) => sum + (day.maxTemp + day.minTemp) / 2, 0) / dailyData.length),
        totalRainfall: dailyData.reduce((sum, day) => sum + day.rainfall, 0),
        avgHumidity: Math.round(dailyData.reduce((sum, day) => sum + day.humidity, 0) / dailyData.length),
        maxUV: Math.max(...dailyData.map(day => day.uvIndex)),
      };

      setReportData({
        type: 'weather',
        dailyData,
        summary: weatherSummary,
        recommendations: generateWeatherRecommendations(weatherSummary),
      });
    } catch (error) {
      console.error('Error generating weather report:', error);
    }
  };

  const generateActivitiesReport = () => {
    const activities = JSON.parse(localStorage.getItem(`activities_${selectedFarm?.id || 'default'}`) || '[]');
    
    const activityTypes = activities.reduce((acc: any, activity: any) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {});

    const statusBreakdown = activities.reduce((acc: any, activity: any) => {
      acc[activity.status] = (acc[activity.status] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.entries(activityTypes).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
    }));

    const statusData = Object.entries(statusBreakdown).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
    }));

    setReportData({
      type: 'activities',
      totalActivities: activities.length,
      chartData,
      statusData,
      completionRate: Math.round((statusBreakdown.completed || 0) / activities.length * 100),
      upcomingActivities: activities.filter((a: any) => a.status === 'pending' && new Date(a.date) > new Date()).length,
    });
  };

  const generateYieldReport = () => {
    // Sample yield data - in real app, this would come from actual measurements
    const yieldData = [
      { month: 'Jan', estimated: 1200, actual: 1150 },
      { month: 'Feb', estimated: 1300, actual: 1280 },
      { month: 'Mar', estimated: 1400, actual: 1420 },
      { month: 'Apr', estimated: 1500, actual: 1480 },
      { month: 'May', estimated: 1600, actual: 1590 },
      { month: 'Jun', estimated: 1700, actual: 0 }, // Future months
    ];

    const totalEstimated = yieldData.reduce((sum, month) => sum + month.estimated, 0);
    const totalActual = yieldData.reduce((sum, month) => sum + month.actual, 0);
    const accuracy = totalActual > 0 ? Math.round((totalActual / totalEstimated) * 100) : 0;

    setReportData({
      type: 'yield',
      yieldData,
      totalEstimated,
      totalActual,
      accuracy,
      projectedHarvest: '1,700 kg/acre',
      harvestDate: 'October 2024',
    });
  };

  const generateFinancialReport = () => {
    // Sample financial data
    const expenses = [
      { category: 'Seeds', amount: 5000, percentage: 20 },
      { category: 'Fertilizers', amount: 8000, percentage: 32 },
      { category: 'Pesticides', amount: 3000, percentage: 12 },
      { category: 'Labor', amount: 6000, percentage: 24 },
      { category: 'Equipment', amount: 3000, percentage: 12 },
    ];

    const revenue = [
      { month: 'Jan', income: 15000, expenses: 8000 },
      { month: 'Feb', income: 18000, expenses: 9000 },
      { month: 'Mar', income: 22000, expenses: 10000 },
      { month: 'Apr', income: 25000, expenses: 11000 },
      { month: 'May', income: 28000, expenses: 12000 },
    ];

    const totalIncome = revenue.reduce((sum, month) => sum + month.income, 0);
    const totalExpenses = revenue.reduce((sum, month) => sum + month.expenses, 0);
    const profit = totalIncome - totalExpenses;
    const profitMargin = Math.round((profit / totalIncome) * 100);

    setReportData({
      type: 'financial',
      expenses,
      revenue,
      totalIncome,
      totalExpenses,
      profit,
      profitMargin,
      roi: Math.round((profit / totalExpenses) * 100),
    });
  };

  const getHealthStatus = (value: number, index: string) => {
    // Simplified health status logic
    if (index === 'ndvi' || index === 'evi') {
      if (value > 50) return 'Good';
      if (value > 30) return 'Fair';
      return 'Poor';
    }
    return 'Normal';
  };

  const calculateOverallHealth = (indices: any[]) => {
    const avgValue = indices.reduce((sum, item) => sum + item.value, 0) / indices.length;
    if (avgValue > 50) return 'Excellent';
    if (avgValue > 30) return 'Good';
    if (avgValue > 20) return 'Fair';
    return 'Poor';
  };

  const identifyCriticalIssues = (indices: any[]) => {
    return indices.filter(item => item.value < 20).map(item => `Low ${item.index}`);
  };

  const generateHealthRecommendations = (indices: any[]) => {
    const recommendations = [];
    const ndvi = indices.find(item => item.index === 'NDVI');
    const ndmi = indices.find(item => item.index === 'NDMI');
    
    if (ndvi && ndvi.value < 30) {
      recommendations.push('Increase fertilization to improve vegetation health');
    }
    if (ndmi && ndmi.value < 20) {
      recommendations.push('Increase irrigation frequency due to low moisture content');
    }
    
    return recommendations;
  };

  const generateWeatherRecommendations = (summary: any) => {
    const recommendations = [];
    
    if (summary.avgTemp > 35) {
      recommendations.push('High temperatures detected - increase irrigation and provide shade');
    }
    if (summary.totalRainfall > 300) {
      recommendations.push('High rainfall expected - ensure proper drainage');
    }
    if (summary.maxUV > 8) {
      recommendations.push('High UV levels - protect workers and monitor crop stress');
    }
    
    return recommendations;
  };

  const downloadReport = () => {
    const reportContent = JSON.stringify(reportData, null, 2);
    const blob = new Blob([reportContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderReportContent = () => {
    if (!reportData) return null;

    switch (reportType) {
      case 'crop-health':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Overall Health</h4>
                <p className="text-2xl font-bold text-green-400">{reportData.summary.overallHealth}</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Field Area</h4>
                <p className="text-2xl font-bold text-blue-400">{(reportData.fieldArea / 10000).toFixed(2)} ha</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Last Updated</h4>
                <p className="text-2xl font-bold text-purple-400">{reportData.lastUpdated}</p>
              </div>
            </div>

            <div className="bg-zinc-800 rounded-lg p-6">
              <h4 className="text-white font-medium mb-4">Health Indices</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.healthIndices}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="index" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Bar dataKey="value" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {reportData.summary.recommendations.length > 0 && (
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                <h4 className="text-green-400 font-medium mb-2">Recommendations</h4>
                <ul className="space-y-1">
                  {reportData.summary.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-green-300 text-sm">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'weather':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Avg Temperature</h4>
                <p className="text-2xl font-bold text-orange-400">{reportData.summary.avgTemp}°C</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Total Rainfall</h4>
                <p className="text-2xl font-bold text-blue-400">{reportData.summary.totalRainfall}%</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Avg Humidity</h4>
                <p className="text-2xl font-bold text-cyan-400">{reportData.summary.avgHumidity}%</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Max UV Index</h4>
                <p className="text-2xl font-bold text-yellow-400">{reportData.summary.maxUV}</p>
              </div>
            </div>

            <div className="bg-zinc-800 rounded-lg p-6">
              <h4 className="text-white font-medium mb-4">7-Day Weather Trend</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Line type="monotone" dataKey="maxTemp" stroke="#f97316" name="Max Temp" />
                  <Line type="monotone" dataKey="minTemp" stroke="#06b6d4" name="Min Temp" />
                  <Line type="monotone" dataKey="humidity" stroke="#8b5cf6" name="Humidity" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'activities':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Total Activities</h4>
                <p className="text-2xl font-bold text-blue-400">{reportData.totalActivities}</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Completion Rate</h4>
                <p className="text-2xl font-bold text-green-400">{reportData.completionRate}%</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Upcoming</h4>
                <p className="text-2xl font-bold text-orange-400">{reportData.upcomingActivities}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-800 rounded-lg p-6">
                <h4 className="text-white font-medium mb-4">Activities by Type</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={reportData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="type" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-zinc-800 rounded-lg p-6">
                <h4 className="text-white font-medium mb-4">Status Breakdown</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                    <RechartsPieChart
                      data={reportData.statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {reportData.statusData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'][index]} />
                      ))}
                    </RechartsPieChart>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case 'yield':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Projected Harvest</h4>
                <p className="text-2xl font-bold text-green-400">{reportData.projectedHarvest}</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Accuracy</h4>
                <p className="text-2xl font-bold text-blue-400">{reportData.accuracy}%</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Harvest Date</h4>
                <p className="text-2xl font-bold text-purple-400">{reportData.harvestDate}</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Total Actual</h4>
                <p className="text-2xl font-bold text-orange-400">{reportData.totalActual} kg</p>
              </div>
            </div>

            <div className="bg-zinc-800 rounded-lg p-6">
              <h4 className="text-white font-medium mb-4">Yield Comparison</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.yieldData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Line type="monotone" dataKey="estimated" stroke="#3b82f6" name="Estimated" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="actual" stroke="#22c55e" name="Actual" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'financial':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Total Income</h4>
                <p className="text-2xl font-bold text-green-400">₹{reportData.totalIncome.toLocaleString()}</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Total Expenses</h4>
                <p className="text-2xl font-bold text-red-400">₹{reportData.totalExpenses.toLocaleString()}</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Profit</h4>
                <p className="text-2xl font-bold text-blue-400">₹{reportData.profit.toLocaleString()}</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">ROI</h4>
                <p className="text-2xl font-bold text-purple-400">{reportData.roi}%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-800 rounded-lg p-6">
                <h4 className="text-white font-medium mb-4">Revenue vs Expenses</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={reportData.revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                    <Bar dataKey="income" fill="#22c55e" name="Income" />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-zinc-800 rounded-lg p-6">
                <h4 className="text-white font-medium mb-4">Expense Breakdown</h4>
                <div className="space-y-3">
                  {reportData.expenses.map((expense: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-zinc-300">{expense.category}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-zinc-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${expense.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-white font-medium">₹{expense.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
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
              <div className="flex items-center gap-4">
                <FarmSelector
                  farms={farms}
                  selectedFarm={selectedFarm}
                  onSelectFarm={setSelectedFarm}
                  onAddFarm={() => {}}
                />
                <button
                  onClick={downloadReport}
                  disabled={!reportData}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {t('download')}
                </button>
              </div>
            </div>

            {/* Report Type Selection */}
            <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Report Type</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { key: 'crop-health', label: t('cropHealth'), icon: Activity },
                  { key: 'weather', label: t('weather'), icon: TrendingUp },
                  { key: 'activities', label: t('activities'), icon: Calendar },
                  { key: 'yield', label: t('yield'), icon: BarChart3 },
                  { key: 'financial', label: t('financial'), icon: PieChart },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setReportType(key as any)}
                    className={`p-4 rounded-lg border transition-colors ${
                      reportType === key
                        ? 'bg-blue-500 border-blue-400 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">{label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Report Content */}
            {selectedFarm && (
              <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {reportType.charAt(0).toUpperCase() + reportType.slice(1).replace('-', ' ')} Report
                    </h3>
                    <p className="text-zinc-400 text-sm">
                      {selectedFarm.farm_name} • {selectedFarm.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-400 text-sm">Generated on</p>
                    <p className="text-white font-medium">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                {renderReportContent()}
              </div>
            )}

            {!selectedFarm && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                <p className="text-zinc-400 mb-2">Select a farm to generate reports</p>
                <p className="text-zinc-500 text-sm">Choose a farm from the dropdown above to view detailed reports</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;