import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { RoadworkProject, InfrastructureAsset, CitizenReport } from '../../types/infrastructure';
import {
  Layers,
  Compass,
  AlertTriangle,
  HardHat,
  ShieldCheck,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface LeafletMapViewProps {
  roadworks?: RoadworkProject[];
  assets?: InfrastructureAsset[];
  reports?: CitizenReport[];
  selectedRoadwork?: RoadworkProject | null;
  onSelectRoadwork?: (item: RoadworkProject) => void;
  pinDropMode?: boolean;
  droppedPin?: [number, number] | null;
  onPinDropped?: (coords: [number, number]) => void;
  heightClass?: string;
  showGisControls?: boolean;
  initialCenter?: [number, number];
  initialZoom?: number;
}

const SUBURB_PRESETS: Record<string, { lat: number; lng: number; zoom: number }> = {
  'All Port Moresby': { lat: -9.4500, lng: 147.1850, zoom: 12 },
  'Waigani Civic': { lat: -9.4312, lng: 147.1908, zoom: 14 },
  'Boroko Commercial': { lat: -9.4670, lng: 147.1990, zoom: 14 },
  'Gordons Industrial': { lat: -9.4530, lng: 147.2035, zoom: 14 },
  'Hohola': { lat: -9.4578, lng: 147.1812, zoom: 14 },
  'Gerehu North': { lat: -9.3985, lng: 147.1520, zoom: 14 },
  'Town / Ela Beach': { lat: -9.4750, lng: 147.1480, zoom: 14 },
  '6 Mile / Airport': { lat: -9.4450, lng: 147.2180, zoom: 14 },
};

export const LeafletMapView: React.FC<LeafletMapViewProps> = ({
  roadworks = [],
  assets = [],
  reports = [],
  selectedRoadwork,
  onSelectRoadwork,
  pinDropMode = false,
  droppedPin,
  onPinDropped,
  heightClass = 'h-[520px] lg:h-[620px]',
  showGisControls = true,
  initialCenter = [-9.4500, 147.1850],
  initialZoom = 12
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const droppedPinMarkerRef = useRef<L.Marker | null>(null);

  const [basemap, setBasemap] = useState<'satellite' | 'streets'>('satellite');
  const [showRoadworksLayer, setShowRoadworksLayer] = useState(true);
  const [showAssetsLayer, setShowAssetsLayer] = useState(false);
  const [showReportsLayer, setShowReportsLayer] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('All Port Moresby');

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial Satellite Tile Layer
    const tileLayer = L.tileLayer(
      'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        attribution: '© Google Earth / Maxar · OpenStreetMap',
      }
    ).addTo(map);

    tileLayerRef.current = tileLayer;

    const layersGroup = L.layerGroup().addTo(map);
    layersGroupRef.current = layersGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Basemap Switch
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (basemap === 'satellite') {
      tileLayerRef.current = L.tileLayer(
        'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        {
          subdomains: ['0', '1', '2', '3'],
          maxZoom: 20,
          attribution: 'Imagery © Google Earth / Maxar · NCDC GIS Grid',
        }
      ).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors',
        }
      ).addTo(map);
    }
  }, [basemap]);

  // Handle Pin Dropper & Map Click
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (onPinDropped) {
        onPinDropped([e.latlng.lat, e.latlng.lng]);
      }
    };

    map.on('click', handleClick);

    if (pinDropMode) {
      map.getContainer().style.cursor = 'crosshair';
    } else {
      map.getContainer().style.cursor = '';
    }

    return () => {
      map.off('click', handleClick);
    };
  }, [pinDropMode, onPinDropped]);

  // Update Dropped Pin Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (droppedPinMarkerRef.current) {
      map.removeLayer(droppedPinMarkerRef.current);
      droppedPinMarkerRef.current = null;
    }

    if (droppedPin) {
      const pinIcon = L.divIcon({
        className: 'custom-dropped-pin',
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background: rgba(239, 68, 68, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 24px; height: 24px; border-radius: 9999px; background: #ef4444; border: 3px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="3"></circle></svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(droppedPin, { icon: pinIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; padding: 4px;">
          <strong style="color: #b91c1c; display: block; margin-bottom: 4px;">Defect Pin Selected</strong>
          <span style="font-family: monospace; font-size: 11px; background: #fef2f2; padding: 2px 6px; border-radius: 4px; border: 1px solid #fecaca; display: inline-block;">
            ${droppedPin[0].toFixed(5)}, ${droppedPin[1].toFixed(5)}
          </span>
        </div>
      `);
      droppedPinMarkerRef.current = marker;
    }
  }, [droppedPin]);

  // Render Features Layers (Roadworks, Corridors, Assets, Reports)
  useEffect(() => {
    const layersGroup = layersGroupRef.current;
    if (!layersGroup) return;

    layersGroup.clearLayers();

    // 1. Roadworks Layer
    if (showRoadworksLayer) {
      roadworks.forEach((rw) => {
        // Render Corridor Polyline if available
        if (rw.corridorCoordinates && rw.corridorCoordinates.length >= 2) {
          let polyColor = '#f59e0b'; // Amber for active
          if (rw.status === 'completed') polyColor = '#10b981';
          if (rw.status === 'planned') polyColor = '#0284c7';
          if (rw.status === 'suspended') polyColor = '#ef4444';

          const polyline = L.polyline(rw.corridorCoordinates, {
            color: polyColor,
            weight: 6,
            opacity: 0.85,
          });

          polyline.bindTooltip(
            `<strong>${rw.title}</strong><br/>Corridor: ${rw.road} (${rw.impact.replace('_', ' ')})`,
            { sticky: true }
          );

          polyline.addTo(layersGroup);
        }

        // Render Roadwork Center Marker
        if (rw.coordinates) {
          let bgHex = '#f59e0b';
          let borderHex = '#b45309';
          if (rw.status === 'completed') {
            bgHex = '#10b981';
            borderHex = '#047857';
          } else if (rw.status === 'planned') {
            bgHex = '#0284c7';
            borderHex = '#0369a1';
          } else if (rw.status === 'suspended') {
            bgHex = '#ef4444';
            borderHex = '#b91c1c';
          }

          const isSelected = selectedRoadwork?.id === rw.id;
          const markerSize = isSelected ? 34 : 26;

          const icon = L.divIcon({
            className: 'custom-rw-icon',
            html: `
              <div style="
                width: ${markerSize}px;
                height: ${markerSize}px;
                border-radius: 9999px;
                background: ${bgHex};
                border: 2px solid ${isSelected ? '#ffffff' : borderHex};
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #0f172a;
                font-weight: bold;
                font-size: 11px;
                cursor: pointer;
                transition: transform 0.2s ease;
              ">
                🚧
              </div>
            `,
            iconSize: [markerSize, markerSize],
            iconAnchor: [markerSize / 2, markerSize / 2],
          });

          const marker = L.marker(rw.coordinates, { icon });

          const popupContent = document.createElement('div');
          popupContent.className = 'p-1 text-slate-800 text-xs font-sans max-w-xs';
          popupContent.innerHTML = `
            <div style="margin-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-family: monospace; font-size: 10px; font-weight: bold; color: #b45309;">${rw.id}</span>
                <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: #fef3c7; color: #92400e;">
                  ${rw.impact.replace('_', ' ')}
                </span>
              </div>
              <h4 style="font-weight: bold; font-size: 13px; margin: 0 0 2px 0; color: #0f172a;">${rw.title}</h4>
              <p style="font-size: 11px; color: #475569; margin: 0;">${rw.road}, ${rw.suburb}</p>
            </div>
            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 8px; font-size: 11px; margin-bottom: 8px;">
              <strong style="color: #78350f; display: block;">Detour & Traffic Notice:</strong>
              <span style="color: #92400e; display: block; margin-top: 2px;">${rw.detourInfo}</span>
              <span style="font-family: monospace; font-weight: bold; color: #b45309; display: block; margin-top: 4px;">
                Advisory Speed: ${rw.recommendedSpeedKmh} km/h
              </span>
            </div>
            <button id="rw-btn-${rw.id}" style="width: 100%; padding: 6px; font-size: 11px; font-weight: bold; background: #0f172a; color: white; border: none; border-radius: 6px; cursor: pointer;">
              Open Project Dossier
            </button>
          `;

          const button = popupContent.querySelector(`#rw-btn-${rw.id}`);
          if (button) {
            button.addEventListener('click', () => {
              if (onSelectRoadwork) onSelectRoadwork(rw);
            });
          }

          marker.bindPopup(popupContent);
          marker.addTo(layersGroup);
        }
      });
    }

    // 2. Assets Layer
    if (showAssetsLayer) {
      assets.forEach((asset) => {
        if (!asset.coordinates) return;

        let bgHex = '#0284c7';
        if (asset.condition === 4) bgHex = '#f97316';
        if (asset.condition === 5) bgHex = '#ef4444';
        if (asset.condition <= 2) bgHex = '#10b981';

        const icon = L.divIcon({
          className: 'custom-asset-icon',
          html: `
            <div style="
              width: 22px;
              height: 22px;
              border-radius: 6px;
              background: ${bgHex};
              border: 2px solid #ffffff;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 10px;
            ">
              🏛️
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const marker = L.marker(asset.coordinates, { icon });
        marker.bindPopup(`
          <div style="font-size: 12px; font-family: inherit; max-width: 240px; padding: 2px;">
            <div style="font-family: monospace; font-size: 10px; font-weight: bold; color: #0369a1;">${asset.id} · ${asset.categoryName}</div>
            <strong style="font-size: 13px; color: #0f172a; display: block; margin: 2px 0;">${asset.name}</strong>
            <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">${asset.suburb} (${asset.locationDescription})</p>
            <div style="font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 4px; display: flex; justify-content: space-between;">
              <span>Condition:</span>
              <strong style="color: ${asset.condition >= 4 ? '#b91c1c' : '#047857'};">Grade ${asset.condition} / 5</strong>
            </div>
          </div>
        `);
        marker.addTo(layersGroup);
      });
    }

    // 3. Reports Layer
    if (showReportsLayer) {
      reports.forEach((rep) => {
        if (!rep.coordinates) return;

        let bgHex = '#ef4444';
        if (rep.status === 'resolved') bgHex = '#10b981';
        if (rep.status === 'work_order_created') bgHex = '#f59e0b';

        const icon = L.divIcon({
          className: 'custom-rep-icon',
          html: `
            <div style="
              width: 20px;
              height: 20px;
              border-radius: 9999px;
              background: ${bgHex};
              border: 2px solid #ffffff;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 9px;
            ">
              ⚠️
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.marker(rep.coordinates, { icon });
        marker.bindPopup(`
          <div style="font-size: 12px; font-family: inherit; max-width: 240px; padding: 2px;">
            <div style="font-family: monospace; font-size: 10px; font-weight: bold; color: #b91c1c;">${rep.id} · ${rep.categoryName}</div>
            <strong style="font-size: 13px; color: #0f172a; display: block; margin: 2px 0;">${rep.roadName}</strong>
            <p style="font-size: 11px; color: #64748b; font-style: italic; margin: 0 0 6px 0;">"${rep.description}"</p>
            <div style="font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 4px; display: flex; justify-content: space-between;">
              <span>Status:</span>
              <strong style="text-transform: capitalize; color: #b45309;">${rep.status.replace('_', ' ')}</strong>
            </div>
          </div>
        `);
        marker.addTo(layersGroup);
      });
    }
  }, [showRoadworksLayer, showAssetsLayer, showReportsLayer, roadworks, assets, reports, selectedRoadwork, onSelectRoadwork]);

  // Center on Selected Roadwork
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedRoadwork?.coordinates) return;
    map.flyTo(selectedRoadwork.coordinates, 15, { duration: 1.2 });
  }, [selectedRoadwork]);

  // Handle Preset Change
  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = SUBURB_PRESETS[presetName];
    if (preset && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([preset.lat, preset.lng], preset.zoom, { duration: 1.2 });
    }
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex flex-col ${heightClass}`}>
      {/* Top GIS Control Bar */}
      {showGisControls && (
        <div className="bg-white/95 backdrop-blur-md px-3 py-2 border-b border-slate-200 z-10 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Left: GIS Layer Toggles */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 mr-1 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>GIS Overlays:</span>
            </span>

            {/* Roadworks Layer */}
            <button
              onClick={() => setShowRoadworksLayer(!showRoadworksLayer)}
              type="button"
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                showRoadworksLayer
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <HardHat className="w-3 h-3" />
              <span>Roadworks ({roadworks.length})</span>
            </button>

            {/* Assets Layer */}
            <button
              onClick={() => setShowAssetsLayer(!showAssetsLayer)}
              type="button"
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                showAssetsLayer
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Assets ({assets.length})</span>
            </button>

            {/* Reports Layer */}
            <button
              onClick={() => setShowReportsLayer(!showReportsLayer)}
              type="button"
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                showReportsLayer
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Defects ({reports.length})</span>
            </button>
          </div>

          {/* Right: Suburb Jump & Basemap Style */}
          <div className="flex items-center gap-2">
            {/* Suburb Presets */}
            <div className="flex items-center gap-1 text-[11px]">
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="bg-slate-100 text-slate-800 text-[11px] font-medium py-1 px-2 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {Object.keys(SUBURB_PRESETS).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Basemap Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200">
              <button
                onClick={() => setBasemap('satellite')}
                type="button"
                className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                  basemap === 'satellite' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Satellite
              </button>
              <button
                onClick={() => setBasemap('streets')}
                type="button"
                className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                  basemap === 'streets' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Street Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pin Dropper Active Notification Strip */}
      {pinDropMode && (
        <div className="bg-amber-400 text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center justify-between z-10 shadow-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 animate-bounce" />
            <span>Click anywhere on the map to set defect coordinates</span>
          </div>
          {droppedPin && (
            <span className="font-mono text-[11px] bg-slate-950 text-white px-2 py-0.5 rounded">
              {droppedPin[0].toFixed(4)}, {droppedPin[1].toFixed(4)}
            </span>
          )}
        </div>
      )}

      {/* Leaflet Map DOM Element */}
      <div
        ref={mapContainerRef}
        className="w-full flex-1 z-0 min-h-[380px]"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Cartography Footnote Strip */}
      <div className="bg-slate-900 text-white px-3 py-1.5 text-[10px] flex items-center justify-between z-10 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Cartography Engine: Satellite Hybrid & OpenStreetMap Grid</span>
        </div>
        <span className="text-slate-400 hidden sm:inline">
          Datum: WGS84 · EPSG:3857 · NCDC City Cadastre Standard
        </span>
      </div>
    </div>
  );
};
