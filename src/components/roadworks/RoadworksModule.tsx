import React, { useState, useMemo } from 'react';
import { useInfrastructure } from '../../context/InfrastructureContext';
import { PomMap } from '../map/PomMap';
import { RoadworkProject, RoadworkStatus, RoadworkImpact } from '../../types/infrastructure';
import { POM_SUBURBS, IMAGES } from '../../data/seedData';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  AlertTriangle,
  Clock,
  ArrowRight,
  Map as MapIcon,
  List,
  CheckCircle2,
  HardHat,
  Phone,
  Compass,
  X,
  FileText,
  AlertCircle
} from 'lucide-react';

export const RoadworksModule: React.FC = () => {
  const { roadworks, setActiveTab, setSelectedEntity } = useInfrastructure();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [impactFilter, setImpactFilter] = useState<string>('all');
  const [suburbFilter, setSuburbFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Selected roadwork for detail modal/drawer
  const [selectedRoadwork, setSelectedRoadwork] = useState<RoadworkProject | null>(null);

  // Filtered dataset
  const filteredRoadworks = useMemo(() => {
    return roadworks.filter((rw) => {
      // Search
      const matchesSearch =
        searchQuery === '' ||
        rw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rw.road.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rw.suburb.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rw.landmark.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rw.id.toLowerCase().includes(searchQuery.toLowerCase());

      // Status
      const matchesStatus = statusFilter === 'all' || rw.status === statusFilter;

      // Impact
      const matchesImpact = impactFilter === 'all' || rw.impact === impactFilter;

      // Suburb
      const matchesSuburb = suburbFilter === 'all' || rw.suburb === suburbFilter;

      return matchesSearch && matchesStatus && matchesImpact && matchesSuburb;
    });
  }, [roadworks, searchQuery, statusFilter, impactFilter, suburbFilter]);

  // Status visual helper
  const getStatusLabel = (status: RoadworkStatus) => {
    switch (status) {
      case 'active':
        return <span className="text-amber-700 font-medium">Active Works</span>;
      case 'planned':
        return <span className="text-sky-700 font-medium">Planned Works</span>;
      case 'completed':
        return <span className="text-emerald-700 font-medium">Completed</span>;
      case 'suspended':
        return <span className="text-purple-700 font-medium">Suspended</span>;
    }
  };

  const getImpactLabel = (impact: RoadworkImpact) => {
    switch (impact) {
      case 'major_closure':
        return <span className="text-rose-700 font-medium">Major Closure</span>;
      case 'detour_required':
        return <span className="text-orange-700 font-medium">Detour Required</span>;
      case 'lane_reduction':
        return <span className="text-amber-700 font-medium">Lane Reduction</span>;
      case 'night_works':
        return <span className="text-indigo-700 font-medium">Night Works</span>;
      case 'minor_delays':
        return <span className="text-slate-600 font-medium">Minor Delays</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title & Context Strip */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>National Capital District Commission</span>
              <span aria-hidden="true">·</span>
              <span>Module 1: Public Roadworks Map</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-amber-700">Port Moresby Grid</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Live Municipal Roadworks & Traffic Advisory
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Real-time directory of planned, active, completed, and suspended capital works across the National Capital District. Consult approved detour routes and speed advisories before traveling.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0 self-start md:self-auto">
            <button
              onClick={() => setViewMode('map')}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Interactive Map</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Project Register ({filteredRoadworks.length})</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Controls Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search road, suburb, project ID..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-colors"
            >
              <option value="all">All Work Statuses</option>
              <option value="active">Active Roadworks</option>
              <option value="planned">Planned Roadworks</option>
              <option value="completed">Completed Works</option>
              <option value="suspended">Suspended Works</option>
            </select>
          </div>

          {/* Suburb Filter */}
          <div>
            <select
              value={suburbFilter}
              onChange={(e) => setSuburbFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-colors"
            >
              <option value="all">All Suburbs (NCD-wide)</option>
              {POM_SUBURBS.map((suburb) => (
                <option key={suburb} value={suburb}>
                  {suburb}
                </option>
              ))}
            </select>
          </div>

          {/* Impact Filter */}
          <div>
            <select
              value={impactFilter}
              onChange={(e) => setImpactFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-colors"
            >
              <option value="all">All Traffic Impacts</option>
              <option value="major_closure">Major Closure</option>
              <option value="detour_required">Detour Required</option>
              <option value="lane_reduction">Lane Reduction</option>
              <option value="night_works">Night Works Only</option>
              <option value="minor_delays">Minor Delays</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Map Column */}
          <div className="lg:col-span-8 space-y-4">
            <PomMap
              roadworks={filteredRoadworks}
              selectedRoadwork={selectedRoadwork}
              onSelectRoadwork={(rw) => setSelectedRoadwork(rw)}
            />
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Showing {filteredRoadworks.length} of {roadworks.length} active civic projects</span>
              <span>Base map: © OpenStreetMap contributors</span>
            </div>
          </div>

          {/* Side Feed Column */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Corridor Bulletins</h2>
              <span className="text-xs text-slate-500">{filteredRoadworks.length} displayed</span>
            </div>

            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {filteredRoadworks.map((rw) => {
                const isSelected = selectedRoadwork?.id === rw.id;
                return (
                  <div
                    key={rw.id}
                    onClick={() => setSelectedRoadwork(rw)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-50/50 border-amber-300 shadow-sm ring-1 ring-amber-300'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                      <span className="font-mono font-semibold text-slate-700">{rw.id}</span>
                      <div className="flex items-center gap-1.5">
                        {getStatusLabel(rw.status)}
                        <span aria-hidden="true">·</span>
                        {getImpactLabel(rw.impact)}
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{rw.road}</h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{rw.title}</p>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3 h-3 text-amber-600" />
                        {rw.suburb}
                      </span>
                      <span className="font-medium text-slate-700">
                        {rw.progressPct}% Complete
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredRoadworks.length === 0 && (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-900 text-sm">No matching roadworks found</p>
                  <p className="text-xs text-slate-500 mt-1">Try adjusting your suburb, status, or search query.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setImpactFilter('all');
                      setSuburbFilter('all');
                    }}
                    className="mt-3 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md text-xs font-medium"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* List / Table Register Mode */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Project Ref & Road</th>
                  <th className="px-4 py-3">Suburb</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Impact</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Target Completion</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRoadworks.map((rw) => (
                  <tr key={rw.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono font-semibold text-slate-900">{rw.id}</div>
                      <div className="font-medium text-slate-800 mt-0.5">{rw.road}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{rw.title}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{rw.suburb}</td>
                    <td className="px-4 py-3">{getStatusLabel(rw.status)}</td>
                    <td className="px-4 py-3">{getImpactLabel(rw.impact)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full"
                            style={{ width: `${rw.progressPct}%` }}
                          />
                        </div>
                        <span className="font-mono tabular-nums text-slate-800 font-medium">
                          {rw.progressPct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {new Date(rw.targetEndDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedRoadwork(rw)}
                        className="px-3 py-1 bg-slate-100 text-slate-800 hover:bg-amber-500 hover:text-slate-950 font-medium rounded transition-colors whitespace-nowrap"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Roadwork Detail Drawer / Modal */}
      {selectedRoadwork && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div className="flex items-start gap-3">
                <img
                  src={IMAGES.logo}
                  alt="NCDC Official Crest"
                  className="w-10 h-10 object-contain rounded-lg p-0.5 bg-white border border-slate-200 shadow-2xs shrink-0 mt-0.5"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <span className="font-mono font-bold text-slate-800">{selectedRoadwork.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedRoadwork.suburb}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{selectedRoadwork.status}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {selectedRoadwork.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedRoadwork(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs text-slate-700">
              {/* Traffic Impact & Detour Advisory Card */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Approved Detour & Traffic Advisory</span>
                </div>
                <p className="font-semibold text-xs mt-1">{selectedRoadwork.impactDescription}</p>
                <div className="mt-2.5 pt-2 border-t border-amber-200 text-xs">
                  <p className="font-bold text-amber-900">Recommended Alternative Route:</p>
                  <p className="mt-0.5">{selectedRoadwork.detourInfo}</p>
                </div>
                <div className="mt-2 text-xs font-semibold text-amber-800 flex items-center gap-2">
                  <span>Speed Limit in Work Zone:</span>
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-mono font-bold">
                    {selectedRoadwork.recommendedSpeedKmh} KM/H
                  </span>
                </div>
              </div>

              {/* Technical Description */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1.5">Engineering Scope</h4>
                <p className="text-slate-600 leading-relaxed text-xs">
                  {selectedRoadwork.description}
                </p>
              </div>

              {/* Project Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Corridor / Location</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedRoadwork.road}</p>
                  <p className="text-[11px] text-slate-500">{selectedRoadwork.landmark}</p>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Executing Agency</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {selectedRoadwork.executingAgency}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Appointed Contractor</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedRoadwork.contractor}</p>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Supervising Engineer</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {selectedRoadwork.supervisingEngineer}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Timeline</span>
                  <p className="font-mono text-slate-800 mt-0.5">
                    {selectedRoadwork.startDate} → {selectedRoadwork.targetEndDate}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Last Inspection Update</span>
                  <p className="font-mono text-slate-800 mt-0.5">
                    {new Date(selectedRoadwork.lastUpdated).toLocaleString('en-GB')}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="text-[11px] text-slate-500">Public Inquiries Hotline</span>
                    <p className="font-bold text-slate-900">{selectedRoadwork.contactPhone}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500">{selectedRoadwork.contactOfficer}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setSelectedRoadwork(null);
                  setActiveTab('report');
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Report Defect on this Road</span>
              </button>

              <button
                onClick={() => setSelectedRoadwork(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
