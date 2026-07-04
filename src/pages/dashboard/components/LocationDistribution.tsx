import React, { useState, useEffect, useMemo } from 'react';

interface LocationDistributionProps {
  stats: {
    totalModels?: number;
    locationBreakdown?: {
      country: string;
      city?: string;
      count: number;
      latitude?: string;
      longitude?: string;
    }[];
  };
}

// World map coordinate helper for Leaflet (lat/lng coordinates) Fallback
const getLatLng = (countryName: string): [number, number] | null => {
  const name = countryName.toLowerCase();
  if (name.includes('india')) return [20.5937, 78.9629];
  if (name.includes('united states') || name.includes('usa') || name.includes('us')) return [37.0902, -95.7129];
  if (name.includes('united kingdom') || name.includes('uk') || name.includes('england')) return [55.3781, -3.4360];
  if (name.includes('france')) return [46.2276, 2.2137];
  if (name.includes('germany')) return [51.1657, 10.4515];
  if (name.includes('australia')) return [-25.2744, 133.7751];
  if (name.includes('brazil')) return [-14.2350, -51.9253];
  if (name.includes('canada')) return [56.1304, -106.3468];
  if (name.includes('china')) return [35.8617, 104.1954];
  if (name.includes('russia')) return [61.5240, 105.3188];
  if (name.includes('japan')) return [36.2048, 138.2529];
  if (name.includes('south africa')) return [-30.5595, 22.9375];
  if (name.includes('nigeria')) return [9.0820, 8.6753];
  if (name.includes('italy')) return [41.8719, 12.5674];
  if (name.includes('spain')) return [40.4637, -3.7492];
  if (name.includes('mexico')) return [23.6345, -102.5528];
  if (name.includes('indonesia')) return [-0.7893, 113.9213];
  return null;
};

export const LocationDistribution: React.FC<LocationDistributionProps> = ({ stats }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const totalModels = stats?.totalModels || 0;
  const locationBreakdown = useMemo(() => stats?.locationBreakdown || [], [stats]);

  // Dynamically load Leaflet assets
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    if (!(window as any).L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = () => setMapLoaded(true);
      document.body.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapLoaded || !(window as any).L || !stats) return;

    const container = document.getElementById('leaflet-map-container');
    if (!container) return;

    // Check if map is already initialized
    if ((container as any)._leaflet_id) {
      return;
    }

    const L = (window as any).L;
    const map = L.map('leaflet-map-container', {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([20, 0], 2);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap © CartoDB'
    }).addTo(map);

    const pinkDotStyle = {
      radius: 6,
      fillColor: '#ec4899',
      color: '#ffffff',
      weight: 1.5,
      opacity: 1,
      fillOpacity: 0.9,
    };

    locationBreakdown.forEach((item: any) => {
      const lat = parseFloat(item.latitude);
      const lng = parseFloat(item.longitude);
      let coords: [number, number] | null = null;

      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        coords = [lat, lng];
      } else {
        coords = getLatLng(item.city || item.country);
      }

      if (coords) {
        const marker = L.circleMarker(coords, pinkDotStyle).addTo(map);
        const cityName = item.city
          ? item.city.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
          : '';
        const countryName = item.country;
        const popupLabel = cityName ? `${cityName}, ${countryName}` : countryName;

        marker.bindPopup(`
          <div style="font-family: Inter, sans-serif; font-size: 11px; font-weight: bold; text-align: center; color: #0f172a; padding: 2px;">
            <div style="text-transform: capitalize; font-size: 12px; margin-bottom: 2px; font-weight: 800;">${popupLabel}</div>
            <div style="color: #ec4899; font-weight: 700;">${item.count} ${item.count === 1 ? 'model' : 'models'}</div>
          </div>
        `);
      }
    });

    return () => {
      map.remove();
    };
  }, [mapLoaded, stats, locationBreakdown]);

  return (
    <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm transition-colors duration-200 flex flex-col gap-4">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">Locations Distribution</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Proportion of talent pool categorized by registration countries</p>
      </div>

      <div
        id="leaflet-map-container"
        className="w-full aspect-video rounded-xl border border-slate-200 dark:border-navy-border shadow-inner z-10 overflow-hidden relative bg-slate-100 dark:bg-navy-950"
      />

      <div className="flex flex-col gap-3.5 mt-2">
        {locationBreakdown.length > 0 ? (
          locationBreakdown.map(item => {
            const percent = totalModels > 0 ? Math.round((item.count / totalModels) * 100) : 0;
            const cityName = item.city
              ? item.city.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
              : '';
            const locationLabel = cityName ? `${cityName}, ${item.country}` : item.country;
            return (
              <div key={`${item.city}-${item.country}`} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800 dark:text-slate-200 font-bold capitalize">{locationLabel}</span>
                  <span className="text-slate-505 dark:text-slate-300">
                    {item.count} {item.count === 1 ? 'model' : 'models'} ({percent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-navy-950 rounded-full overflow-hidden border border-slate-200/50 dark:border-navy-border/40">
                  <div
                    style={{ width: `${percent}%` }}
                    className="h-full bg-gradient-to-r from-pink-500 to-pink-400 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">No registered locations found.</div>
        )}
      </div>
    </div>
  );
};

export default LocationDistribution;
