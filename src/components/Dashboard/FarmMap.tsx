import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Maximize2 } from 'lucide-react';
import { Farm } from '../../types';

interface FarmMapProps {
  farm: Farm | null;
  className?: string;
}

const FarmMap: React.FC<FarmMapProps> = ({ farm, className = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const loader = new Loader({
          apiKey: 'AIzaSyAb37oGF7BebVQlkRe3q2Z0tCIW3QJl8j8',
          version: 'weekly',
          libraries: ['geometry']
        });

        await loader.load();

        if (!mapRef.current) return;

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 40.7128, lng: -74.0060 },
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.SATELLITE,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          gestureHandling: 'cooperative',
        });

        setMap(mapInstance);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load map');
        setIsLoading(false);
      }
    };

    initializeMap();
  }, []);

  useEffect(() => {
    if (!map || !farm?.coordinates || farm.coordinates.length === 0) return;

    // Clear existing polygon
    if (polygon) {
      polygon.setMap(null);
    }

    try {
      // Convert coordinates to Google Maps format
      const path = farm.coordinates.map((coord: number[]) => ({
        lat: coord[1],
        lng: coord[0]
      }));

      if (path.length < 3) return;

      // Create polygon
      const farmPolygon = new google.maps.Polygon({
        paths: path,
        fillColor: '#22c55e',
        fillOpacity: 0.3,
        strokeWeight: 2,
        strokeColor: '#16a34a',
        clickable: false,
        zIndex: 1,
      });

      farmPolygon.setMap(map);
      setPolygon(farmPolygon);

      // Fit map to polygon bounds
      const bounds = new google.maps.LatLngBounds();
      path.forEach(point => bounds.extend(point));
      map.fitBounds(bounds);

      // Add farm marker at center
      const center = bounds.getCenter();
      new google.maps.Marker({
        position: center,
        map: map,
        title: farm.farm_name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#22c55e',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff',
        },
      });

    } catch (err) {
      console.error('Error displaying farm boundary:', err);
    }
  }, [map, farm]);

  if (error) {
    return (
      <div className={`bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700 ${className}`}>
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <p className="text-red-400 mb-2">Map Error</p>
          <p className="text-zinc-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden ${className}`}>
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <MapPin className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {farm ? farm.farm_name : 'Farm Location'}
              </h3>
              {farm && (
                <p className="text-zinc-400 text-sm">{farm.location}</p>
              )}
            </div>
          </div>
          <button className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-64"
        />
        
        {isLoading && (
          <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-zinc-400">Loading map...</p>
            </div>
          </div>
        )}

        {!farm && !isLoading && (
          <div className="absolute inset-0 bg-zinc-800/90 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-zinc-500 mx-auto mb-2" />
              <p className="text-zinc-400">Select a farm to view location</p>
            </div>
          </div>
        )}
      </div>

      {farm && (
        <div className="p-4 bg-zinc-800 text-sm text-zinc-400">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-zinc-500">Crop:</span>
              <span className="text-white ml-2">{farm.crop}</span>
            </div>
            <div>
              <span className="text-zinc-500">Field ID:</span>
              <span className="text-white ml-2">{farm.field_id}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmMap;