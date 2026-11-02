// Source: Google Maps Platform Code Assist
import React, { useState, useEffect, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap
} from '@vis.gl/react-google-maps';
import { RoadworkProject, InfrastructureAsset, CitizenReport } from '../../types/infrastructure';
import {
  Layers,
  Car,
  Compass,
  AlertTriangle,
  Info,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  HardHat,
  Eye,
  Maximize2,
  Navigation
} from 'lucide-react';

interface GoogleMapsViewProps {
  roadworks?: RoadworkProject[];
  assets?: InfrastructureAsset[];
  reports?: CitizenReport[];
  selectedRoadwork?: RoadworkProject | null;
  onSelectRoadwork?: (item: RoadworkProject) => void;
  // Pin dropper mode for Citizen Reporting
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

// Polyline component using Google Maps JS SDK via useMap
const CorridorPolyline: React.FC<{
  coordinates: [number, number][];
  status: string;
  title: string;
}> = ({ coordinates, status }) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !coordinates || coordinates.length < 2) return;

    let strokeColor = '#f59e0b'; // Amber for active
    if (status === 'planned') strokeColor = '#0284c7'; // Sky
    if (status === 'completed') strokeColor = '#10b981'; // Emerald
    if (status === 'suspended') strokeColor = '#ef4444'; // Red

    const path = coordinates.map(([lat, lng]) => ({ lat, lng }));

    const polyline = new google.maps.Polyline({
      path,
      strokeColor,
      strokeOpacity: 0.85,
      strokeWeight: 6,
      map,
    });

    polylineRef.current = polyline;

    return () => {
      polyline.setMap(null);
    };
  }, [map, coordinates, status]);

  return null;
};

// Google Live Traffic Layer controller
const TrafficLayerController: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const map = useMap();
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);

  useEffect(() => {
    if (!map) return;

    if (enabled) {
      if (!trafficLayerRef.current) {
        trafficLayerRef.current = new google.maps.TrafficLayer();
      }
      trafficLayerRef.current.setMap(map);
    } else {
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
      }
    }

    return () => {
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
      }
    };
  }, [map, enabled]);

  return null;
};

// Click handler for pin dropping and map center syncing
const MapInteractionHandler: React.FC<{
  pinDropMode: boolean;
  onPinDropped?: (coords: [number, number]) => void;
  centerTarget?: { lat: number; lng: number; zoom: number } | null;
}> = ({ onPinDropped, centerTarget }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng && onPinDropped) {
        onPinDropped([e.latLng.lat(), e.latLng.lng()]);
      }
    });

    return () => {
      google.maps.event.removeListener(clickListener);
    };
  }, [map, onPinDropped]);

  useEffect(() => {
    if (!map || !centerTarget) return;
    map.panTo({ lat: centerTarget.lat, lng: centerTarget.lng });
    map.setZoom(centerTarget.zoom);
  }, [map, centerTarget]);

  return null;
};

export const GoogleMapsView: React.FC<GoogleMapsViewProps> = ({
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
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCeeT_-gWeBX3fEYpslgo0wvv2A3nS1flA';

  // Map state
  const [mapTypeId, setMapTypeId] = useState<string>('hybrid');
  const [showTraffic, setShowTraffic] = useState(false);
  const [showRoadworksLayer, setShowRoadworksLayer] = useState(true);
  const [showAssetsLayer, setShowAssetsLayer] = useState(false);
  const [showReportsLayer, setShowReportsLayer] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('All Port Moresby');
  const [cameraTarget, setCameraTarget] = useState<{ lat: number; lng: number; zoom: number } | null>(null);

  // Active info popup entity
  const [activeInfoWindow, setActiveInfoWindow] = useState<{
    type: 'roadwork' | 'asset' | 'report';
    data: any;
    position: { lat: number; lng: number };
  } | null>(null);

  // Sync when selectedRoadwork changes from outside
  useEffect(() => {
    if (selectedRoadwork?.coordinates) {
      const [lat, lng] = selectedRoadwork.coordinates;
      setCameraTarget({ lat, lng, zoom: 15 });
      setActiveInfoWindow({
        type: 'roadwork',
        data: selectedRoadwork,
        position: { lat, lng }
      });
    }
  }, [selectedRoadwork]);

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = SUBURB_PRESETS[presetName];
    if (preset) {
      setCameraTarget(preset);
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'major_closure':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Major Closure</span>;
      case 'detour_required':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">Detour Required</span>;
      case 'lane_reduction':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Lane Reduction</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">Minor Delays</span>;
    }
  };

  const getConditionLabel = (condition: number) => {
    switch (condition) {
      case 1:
        return <span className="text-emerald-700 font-bold">1 - Very Good</span>;
      case 2:
        return <span className="text-emerald-600 font-bold">2 - Good</span>;
      case 3:
        return <span className="text-amber-700 font-bold">3 - Fair</span>;
      case 4:
        return <span className="text-orange-700 font-bold">4 - Poor</span>;
      case 5:
        return <span className="text-rose-700 font-bold">5 - Critical</span>;
      default:
        return <span className="text-slate-600">Unrated</span>;
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

            {/* Live Traffic Toggle */}
            <button
              onClick={() => setShowTraffic(!showTraffic)}
              type="button"
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                showTraffic
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title="Toggle Live Google Maps Traffic Flow"
            >
              <Car className="w-3 h-3" />
              <span>Live Traffic {showTraffic ? 'ON' : 'OFF'}</span>
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
                onClick={() => setMapTypeId('hybrid')}
                type="button"
                className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                  mapTypeId === 'hybrid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Satellite
              </button>
              <button
                onClick={() => setMapTypeId('roadmap')}
                type="button"
                className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                  mapTypeId === 'roadmap' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Roadmap
              </button>
              <button
                onClick={() => setMapTypeId('terrain')}
                type="button"
                className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                  mapTypeId === 'terrain' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Terrain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pin Dropper Instruction Strip */}
      {pinDropMode && (
        <div className="bg-amber-400 text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center justify-between z-10 shadow-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 animate-bounce" />
            <span>Interactive Pin Dropper Active: Click anywhere on Port Moresby map to set defect coordinates</span>
          </div>
          {droppedPin && (
            <span className="font-mono text-[11px] bg-slate-950 text-white px-2 py-0.5 rounded">
              {droppedPin[0].toFixed(4)}, {droppedPin[1].toFixed(4)}
            </span>
          )}
        </div>
      )}

      {/* Google Maps Canvas Container */}
      <div className="relative flex-1 w-full h-full min-h-[380px]">
        <APIProvider apiKey={apiKey} language="en" region="PG">
          <Map
            defaultCenter={{ lat: initialCenter[0], lng: initialCenter[1] }}
            defaultZoom={initialZoom}
            mapId="DEMO_MAP_ID"
            mapTypeId={mapTypeId}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            gestureHandling="greedy"
            disableDefaultUI={false}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
          >
            {/* Live Traffic Overlay */}
            <TrafficLayerController enabled={showTraffic} />

            {/* Pan & Click Handlers */}
            <MapInteractionHandler
              pinDropMode={pinDropMode}
              onPinDropped={onPinDropped}
              centerTarget={cameraTarget}
            />

            {/* Dropped Pin Marker for Citizen Reporting */}
            {droppedPin && (
              <AdvancedMarker
                position={{ lat: droppedPin[0], lng: droppedPin[1] }}
                title="Target Defect Location"
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-8 h-8 rounded-full bg-rose-500/30 animate-ping" />
                  <Pin
                    background="#ef4444"
                    glyphColor="#ffffff"
                    borderColor="#991b1b"
                    scale={1.2}
                  />
                </div>
              </AdvancedMarker>
            )}

            {/* Roadworks Layer: Corridor Polylines */}
            {showRoadworksLayer &&
              roadworks.map((rw) => {
                if (!rw.corridorCoordinates || rw.corridorCoordinates.length < 2) return null;
                return (
                  <CorridorPolyline
                    key={`corridor-${rw.id}`}
                    coordinates={rw.corridorCoordinates}
                    status={rw.status}
                    title={rw.title}
                  />
                );
              })}

            {/* Roadworks Layer: Project Markers */}
            {showRoadworksLayer &&
              roadworks.map((rw) => {
                if (!rw.coordinates) return null;
                const [lat, lng] = rw.coordinates;

                let bg = '#f59e0b';
                if (rw.status === 'completed') bg = '#10b981';
                if (rw.status === 'planned') bg = '#0284c7';
                if (rw.status === 'suspended') bg = '#ef4444';

                return (
                  <AdvancedMarker
                    key={`rw-marker-${rw.id}`}
                    position={{ lat, lng }}
                    title={rw.title}
                    onClick={() => {
                      if (onSelectRoadwork) onSelectRoadwork(rw);
                      setActiveInfoWindow({
                        type: 'roadwork',
                        data: rw,
                        position: { lat, lng }
                      });
                    }}
                  >
                    <Pin
                      background={bg}
                      glyphColor="#0f172a"
                      borderColor="#ffffff"
                      scale={selectedRoadwork?.id === rw.id ? 1.3 : 1.0}
                    />
                  </AdvancedMarker>
                );
              })}

            {/* Infrastructure Assets Layer */}
            {showAssetsLayer &&
              assets.map((asset) => {
                if (!asset.coordinates) return null;
                const [lat, lng] = asset.coordinates;

                let bg = '#0284c7';
                if (asset.condition === 4) bg = '#f97316';
                if (asset.condition === 5) bg = '#ef4444';
                if (asset.condition === 1 || asset.condition === 2) bg = '#10b981';

                return (
                  <AdvancedMarker
                    key={`asset-marker-${asset.id}`}
                    position={{ lat, lng }}
                    title={asset.name}
                    onClick={() => {
                      setActiveInfoWindow({
                        type: 'asset',
                        data: asset,
                        position: { lat, lng }
                      });
                    }}
                  >
                    <Pin
                      background={bg}
                      glyphColor="#ffffff"
                      borderColor="#0f172a"
                      scale={0.85}
                    />
                  </AdvancedMarker>
                );
              })}

            {/* Citizen Defect Reports Layer */}
            {showReportsLayer &&
              reports.map((report) => {
                if (!report.coordinates) return null;
                const [lat, lng] = report.coordinates;

                let bg = '#ef4444';
                if (report.status === 'resolved') bg = '#10b981';
                if (report.status === 'work_order_created') bg = '#f59e0b';

                return (
                  <AdvancedMarker
                    key={`report-marker-${report.id}`}
                    position={{ lat, lng }}
                    title={report.roadName}
                    onClick={() => {
                      setActiveInfoWindow({
                        type: 'report',
                        data: report,
                        position: { lat, lng }
                      });
                    }}
                  >
                    <Pin
                      background={bg}
                      glyphColor="#ffffff"
                      borderColor="#ffffff"
                      scale={0.8}
                    />
                  </AdvancedMarker>
                );
              })}

            {/* Interactive InfoWindow */}
            {activeInfoWindow && (
              <InfoWindow
                position={activeInfoWindow.position}
                onCloseClick={() => setActiveInfoWindow(null)}
                pixelOffset={[0, -32]}
              >
                <div className="p-2 max-w-xs text-xs font-sans text-slate-800">
                  {activeInfoWindow.type === 'roadwork' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold text-amber-700">
                          {activeInfoWindow.data.id}
                        </span>
                        {getImpactBadge(activeInfoWindow.data.impact)}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {activeInfoWindow.data.title}
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        {activeInfoWindow.data.road}, {activeInfoWindow.data.suburb}
                      </p>
                      <div className="p-2 bg-amber-50 rounded border border-amber-200 text-[11px]">
                        <span className="font-bold text-amber-900 block">Detour Advisory:</span>
                        <p className="text-amber-950 mt-0.5">{activeInfoWindow.data.detourInfo}</p>
                        <p className="font-mono font-bold text-amber-800 mt-1">
                          Advisory Speed: {activeInfoWindow.data.recommendedSpeedKmh} km/h
                        </p>
                      </div>
                      {onSelectRoadwork && (
                        <button
                          onClick={() => onSelectRoadwork(activeInfoWindow.data)}
                          className="w-full py-1 text-center font-bold bg-slate-900 text-white rounded hover:bg-slate-800 text-[11px]"
                        >
                          Open Detailed Project Dossier
                        </button>
                      )}
                    </div>
                  )}

                  {activeInfoWindow.type === 'asset' && (
                    <div className="space-y-1.5">
                      <span className="font-mono text-[10px] font-bold text-sky-700">
                        {activeInfoWindow.data.id} · {activeInfoWindow.data.categoryName}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {activeInfoWindow.data.name}
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        Location: {activeInfoWindow.data.suburb} ({activeInfoWindow.data.locationDescription})
                      </p>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                        <span>ISO Condition:</span>
                        {getConditionLabel(activeInfoWindow.data.condition)}
                      </div>
                    </div>
                  )}

                  {activeInfoWindow.type === 'report' && (
                    <div className="space-y-1.5">
                      <span className="font-mono text-[10px] font-bold text-rose-700">
                        {activeInfoWindow.data.id} · {activeInfoWindow.data.categoryName}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {activeInfoWindow.data.roadName} ({activeInfoWindow.data.suburb})
                      </h4>
                      <p className="text-[11px] text-slate-600 italic">
                        "{activeInfoWindow.data.description}"
                      </p>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                        <span>Status:</span>
                        <span className="capitalize font-bold text-amber-700">
                          {activeInfoWindow.data.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>

      {/* GIS Footnote Strip */}
      <div className="bg-slate-900 text-white px-3 py-1.5 text-[10px] flex items-center justify-between z-10 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Google Maps Platform GIS Engine: Active (Port Moresby NCD Grid)</span>
        </div>
        <span className="text-slate-400 hidden sm:inline">
          Datum: WGS84 · Hybrid Satellite + Live Traffic + Multi-Layer Vectors
        </span>
      </div>
    </div>
  );
};
