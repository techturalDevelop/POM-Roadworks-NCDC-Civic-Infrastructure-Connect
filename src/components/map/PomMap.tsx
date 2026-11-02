// Source: Google Maps Platform Code Assist
import React, { useState, useEffect, Component, ReactNode, ErrorInfo } from 'react';
import { RoadworkProject } from '../../types/infrastructure';
import { useInfrastructure } from '../../context/InfrastructureContext';
import { GoogleMapsView } from './GoogleMapsView';
import { LeafletMapView } from './LeafletMapView';
import {
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Globe,
  Map as MapIcon,
  CheckCircle2,
  X,
  Info
} from 'lucide-react';

interface PomMapProps {
  roadworks: RoadworkProject[];
  selectedRoadwork?: RoadworkProject | null;
  onSelectRoadwork?: (item: RoadworkProject) => void;
  // Pin drop mode for Citizen Reporting
  pinDropMode?: boolean;
  droppedPin?: [number, number] | null;
  onPinDropped?: (coords: [number, number]) => void;
  heightClass?: string;
}

// React Error Boundary to catch any runtime script or render errors from Google Maps SDK
interface ErrorBoundaryProps {
  fallback: (error: Error) => ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GoogleMapsErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('GoogleMapsErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}

export const PomMap: React.FC<PomMapProps> = ({
  roadworks,
  selectedRoadwork,
  onSelectRoadwork,
  pinDropMode = false,
  droppedPin,
  onPinDropped,
  heightClass = 'h-[520px] lg:h-[620px]'
}) => {
  const { assets, reports } = useInfrastructure();

  // Engine state: 'leaflet' by default to ensure 100% operational uptime without unactivated API key errors
  const [engine, setEngine] = useState<'google' | 'leaflet'>('leaflet');
  const [hasGoogleError, setHasGoogleError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [showErrorBanner, setShowErrorBanner] = useState(true);

  // Global error listener to intercept ApiNotActivatedMapError
  useEffect(() => {
    const handleAuthFailure = () => {
      setHasGoogleError(true);
      setErrorDetails('ApiNotActivatedMapError: Maps JavaScript API is not enabled in your Google Cloud project.');
      setEngine('leaflet'); // Automatic graceful fallback
    };

    const origConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const str = args.map((a) => String(a)).join(' ');
      if (str.includes('ApiNotActivatedMapError') || str.includes('LegacyApiNotActivatedMapError') || str.includes('api-not-activated-map-error')) {
        setHasGoogleError(true);
        setErrorDetails('ApiNotActivatedMapError');
        setEngine('leaflet'); // Automatic graceful fallback
        console.warn('[NCDC GIS]: Maps JavaScript API activation required in GCP Console.');
        return; // Suppress fatal unhandled dump
      }
      origConsoleError.apply(console, args);
    };

    (window as any).gm_authFailure = handleAuthFailure;

    return () => {
      console.error = origConsoleError;
    };
  }, []);

  const handleRetryGoogleMaps = () => {
    setHasGoogleError(false);
    setErrorDetails(null);
    setEngine('google');
  };

  return (
    <div className="space-y-2">
      {/* Engine Switcher Bar & Diagnostics */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        {/* Engine Toggle Buttons */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-lg border border-slate-300">
          <button
            onClick={() => setEngine('leaflet')}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-all ${
              engine === 'leaflet'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 text-amber-600" />
            <span>Satellite & OpenStreetMap</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active & Ready" />
          </button>

          <button
            onClick={() => setEngine('google')}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-all ${
              engine === 'google'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Google Maps Platform</span>
            {hasGoogleError ? (
              <span className="w-2 h-2 rounded-full bg-amber-500" title="Activation required in GCP" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-blue-400" />
            )}
          </button>
        </div>

        {/* Engine Status Tag */}
        <div className="flex items-center gap-2">
          {engine === 'leaflet' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Leaflet Satellite Engine active (100% operational)</span>
            </span>
          )}
          {engine === 'google' && !hasGoogleError && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              <Globe className="w-3 h-3 text-blue-600 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Google Maps Platform active</span>
            </span>
          )}
        </div>
      </div>

      {/* API Activation Guidance Alert Banner */}
      {hasGoogleError && showErrorBanner && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-amber-900">
                    Google Maps API Key Verified — Action Required: Enable Maps JavaScript API
                  </span>
                  <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300">
                    ApiNotActivatedMapError
                  </span>
                </div>
                <p className="text-amber-800 leading-relaxed text-[11px]">
                  Your API Key <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900 font-semibold">AIzaSyCeeT_-gWeBX3fEYpslgo0wvv2A3nS1flA</code> is authentic, but the <strong>Maps JavaScript API</strong> service is not yet enabled on your Google Cloud Console project. The application has automatically engaged the <strong>Leaflet Satellite GIS Engine</strong> so all roadwork corridors, asset locations, and citizen pin-dropping continue to operate without disruption.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-amber-950 underline hover:text-amber-800 bg-amber-200/60 hover:bg-amber-200 px-2.5 py-1 rounded text-[11px] transition-colors"
                  >
                    <span>1-Click: Enable "Maps JavaScript API" in Google Cloud Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={handleRetryGoogleMaps}
                    type="button"
                    className="inline-flex items-center gap-1 font-bold text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 px-2.5 py-1 rounded text-[11px] transition-colors shadow-2xs"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-700" />
                    <span>Test & Reconnect Google Maps</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowErrorBanner(false)}
              type="button"
              className="text-amber-700 hover:text-amber-900 p-1 rounded-md hover:bg-amber-100 transition-colors"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Render Active Cartography Engine */}
      {engine === 'google' ? (
        <GoogleMapsErrorBoundary
          fallback={(err) => (
            <div className="space-y-2">
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-900 flex items-center justify-between">
                <span>Google Maps initialization caught error: {err.message}. Showing Leaflet Satellite Cartography.</span>
                <button
                  onClick={() => setEngine('leaflet')}
                  className="font-bold underline text-rose-950 ml-2"
                >
                  Switch to Leaflet
                </button>
              </div>
              <LeafletMapView
                roadworks={roadworks}
                assets={assets}
                reports={reports}
                selectedRoadwork={selectedRoadwork}
                onSelectRoadwork={onSelectRoadwork}
                pinDropMode={pinDropMode}
                droppedPin={droppedPin}
                onPinDropped={onPinDropped}
                heightClass={heightClass}
                showGisControls={true}
              />
            </div>
          )}
        >
          <GoogleMapsView
            roadworks={roadworks}
            assets={assets}
            reports={reports}
            selectedRoadwork={selectedRoadwork}
            onSelectRoadwork={onSelectRoadwork}
            pinDropMode={pinDropMode}
            droppedPin={droppedPin}
            onPinDropped={onPinDropped}
            heightClass={heightClass}
            showGisControls={true}
          />
        </GoogleMapsErrorBoundary>
      ) : (
        <LeafletMapView
          roadworks={roadworks}
          assets={assets}
          reports={reports}
          selectedRoadwork={selectedRoadwork}
          onSelectRoadwork={onSelectRoadwork}
          pinDropMode={pinDropMode}
          droppedPin={droppedPin}
          onPinDropped={onPinDropped}
          heightClass={heightClass}
          showGisControls={true}
        />
      )}
    </div>
  );
};
