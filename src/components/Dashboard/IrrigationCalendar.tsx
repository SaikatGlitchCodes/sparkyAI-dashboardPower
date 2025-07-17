import React from 'react';
import { Droplets, Calendar, Cloud } from 'lucide-react';
import { WeatherData } from '../../lib/api';

interface IrrigationSchedule {
  date: string;
  quantity_mm: number;
  time: string;
  precipitation_probability: number;
}

interface IrrigationCalendarProps {
  data: IrrigationSchedule[];
  weatherData?: WeatherData | null;
}

const IrrigationCalendar: React.FC<IrrigationCalendarProps> = ({ data, weatherData }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getWeatherIcon = (probability: number) => {
    if (probability >= 80) return '🌧️';
    if (probability >= 60) return '⛅';
    if (probability >= 40) return '🌤️';
    return '☀️';
  };

  // Merge irrigation data with weather data if available
  const enhancedData = data.map((schedule, index) => {
    if (weatherData && weatherData.daily[index]) {
      const weatherDay = weatherData.daily[index];
      return {
        ...schedule,
        precipitation_probability: Math.round(weatherDay.pop * 100),
        weather_description: weatherDay.weather[0].description,
        temperature: Math.round(weatherDay.temp.day - 273.15), // Convert K to C
      };
    }
    return schedule;
  });

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Droplets className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">Irrigation Schedule</h3>
      </div>

      <div className="space-y-3">
        {enhancedData.slice(0, 4).map((schedule, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border transition-all ${
              schedule.precipitation_probability >= 80
                ? 'bg-red-900/20 border-red-800'
                : 'bg-zinc-800 border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-2xl">{getWeatherIcon(schedule.precipitation_probability)}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <span className="text-white font-medium">{formatDate(schedule.date)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <span>Time: {schedule.time}</span>
                    <span>Amount: {schedule.quantity_mm}mm</span>
                    {schedule.temperature && (
                      <span>Temp: {schedule.temperature}°C</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  <Cloud className="w-4 h-4 text-blue-400" />
                  <span className="text-white font-medium">{schedule.precipitation_probability}%</span>
                </div>
                <span className="text-xs text-zinc-400">Rain chance</span>
              </div>
            </div>
            {schedule.precipitation_probability >= 80 && (
              <div className="mt-3 p-2 bg-red-900/30 rounded border border-red-800">
                <p className="text-red-400 text-sm">
                  ⚠️ High rain probability ({schedule.precipitation_probability}%) - Consider delaying irrigation
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IrrigationCalendar;