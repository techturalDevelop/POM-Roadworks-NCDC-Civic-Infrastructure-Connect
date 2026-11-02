import React, { useState, useMemo } from 'react';
import { useInfrastructure } from '../../context/InfrastructureContext';
import {
  InfrastructureAsset,
  AssetCategory,
  ConditionRating,
  CustomCategoryConfig
} from '../../types/infrastructure';
import { POM_SUBURBS, IMAGES } from '../../data/seedData';
import {
  Search,
  Filter,
  Plus,
  Layers,
  MapPin,
  Calendar,
  AlertCircle,
  FileCheck,
  Wrench,
  X,
  ExternalLink,
  Shield,
  Activity,
  CheckCircle,
  Camera,
  FolderPlus
} from 'lucide-react';

export const AssetRegisterModule: React.FC = () => {
  const {
    assets,
    customCategories,
    addAsset,
    updateAssetCondition,
    addCustomCategory,
    isStaff,
    currentUser,
    setActiveTab
  } = useInfrastructure();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [suburbFilter, setSuburbFilter] = useState<string>('all');

  // Modals
  const [selectedAsset, setSelectedAsset] = useState<InfrastructureAsset | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryConfigModal, setShowCategoryConfigModal] = useState(false);
  const [showConditionUpdateModal, setShowConditionUpdateModal] = useState(false);

  // New Asset Form State
  const [newAssetForm, setNewAssetForm] = useState({
    name: '',
    category: 'roads_segments' as AssetCategory,
    categoryName: 'Roads & Road Segments',
    suburb: 'Waigani',
    locationDescription: '',
    responsibleAuthority: 'National Capital District Commission (Engineering Directorate)',
    installationYear: 2020,
    condition: 2 as ConditionRating,
    description: '',
    specificationsKey1: 'Length',
    specificationsVal1: '',
    specificationsKey2: 'Design Standard',
    specificationsVal2: '',
    nextInspectionDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
  });

  // New Category Form State
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: '',
    codePrefix: 'NCDC-CUS',
    iconName: 'Shield',
    description: '',
    attributesStr: 'Material, Manufacturer, Capacity, Maintenance Interval',
  });

  // Condition Update State
  const [conditionScoreToUpdate, setConditionScoreToUpdate] = useState<ConditionRating>(2);
  const [conditionNotesToUpdate, setConditionNotesToUpdate] = useState('');

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        searchQuery === '' ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.locationDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.suburb.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' ||
        asset.category === categoryFilter ||
        asset.categoryName === categoryFilter;

      const matchesCondition =
        conditionFilter === 'all' || asset.condition === Number(conditionFilter);

      const matchesSuburb = suburbFilter === 'all' || asset.suburb === suburbFilter;

      return matchesSearch && matchesCategory && matchesCondition && matchesSuburb;
    });
  }, [assets, searchQuery, categoryFilter, conditionFilter, suburbFilter]);

  // Condition Badge Renderer
  const renderConditionBadge = (score: ConditionRating) => {
    switch (score) {
      case 1:
        return (
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 1 - Very Good
          </span>
        );
      case 2:
        return (
          <span className="text-sky-700 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span> 2 - Good
          </span>
        );
      case 3:
        return (
          <span className="text-amber-700 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> 3 - Fair / Moderate
          </span>
        );
      case 4:
        return (
          <span className="text-orange-700 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span> 4 - Poor
          </span>
        );
      case 5:
        return (
          <span className="text-rose-700 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span> 5 - Critical / Failed
          </span>
        );
    }
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetForm.name) return;

    const specs: Record<string, string> = {};
    if (newAssetForm.specificationsKey1 && newAssetForm.specificationsVal1) {
      specs[newAssetForm.specificationsKey1] = newAssetForm.specificationsVal1;
    }
    if (newAssetForm.specificationsKey2 && newAssetForm.specificationsVal2) {
      specs[newAssetForm.specificationsKey2] = newAssetForm.specificationsVal2;
    }

    addAsset({
      name: newAssetForm.name,
      category: newAssetForm.category,
      categoryName: newAssetForm.categoryName,
      suburb: newAssetForm.suburb,
      locationDescription: newAssetForm.locationDescription || `${newAssetForm.suburb} municipal precinct`,
      coordinates: [-9.4438 + (Math.random() - 0.5) * 0.05, 147.1803 + (Math.random() - 0.5) * 0.05],
      responsibleAuthority: newAssetForm.responsibleAuthority,
      installationYear: Number(newAssetForm.installationYear),
      condition: newAssetForm.condition,
      description: newAssetForm.description || 'Standard municipal asset registered in Port Moresby GIS.',
      specifications: specs,
      inspectionHistory: [],
      maintenanceHistory: [],
      nextInspectionDate: newAssetForm.nextInspectionDate,
      linkedProjectIds: [],
      linkedWorkOrderIds: [],
      linkedReportIds: [],
    });

    setShowAddModal(false);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryForm.name) return;

    const cat: CustomCategoryConfig = {
      id: `cat_${Date.now()}`,
      name: newCategoryForm.name,
      codePrefix: newCategoryForm.codePrefix.toUpperCase(),
      iconName: newCategoryForm.iconName,
      description: newCategoryForm.description,
      attributes: newCategoryForm.attributesStr.split(',').map((s) => s.trim()),
    };

    addCustomCategory(cat);
    setShowCategoryConfigModal(false);
  };

  const handleSaveCondition = () => {
    if (!selectedAsset) return;
    updateAssetCondition(selectedAsset.id, conditionScoreToUpdate, conditionNotesToUpdate);
    setSelectedAsset({
      ...selectedAsset,
      condition: conditionScoreToUpdate,
    });
    setShowConditionUpdateModal(false);
    setConditionNotesToUpdate('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>National Capital District Commission</span>
              <span aria-hidden="true">·</span>
              <span>Module 2: Infrastructure Asset Register</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-amber-700">ISO 55001 Asset Standard</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Municipal Civil Asset Register
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Comprehensive municipal ledger of roads, drainage networks, bridges, streetlights, and custom civil structures with verified condition indices, lifecycle maintenance histories, and statutory inspection schedules.
            </p>
          </div>

          {/* Action Buttons for Authorized Staff */}
          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            {isStaff ? (
              <>
                <button
                  onClick={() => setShowCategoryConfigModal(true)}
                  type="button"
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-slate-600" />
                  <span>Configure Categories</span>
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  type="button"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Asset</span>
                </button>
              </>
            ) : (
              <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                Public Read-Only Access
              </div>
            )}
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search asset ID, name, suburb..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            >
              <option value="all">All Asset Categories</option>
              <option value="roads_segments">Roads & Segments</option>
              <option value="drainage_culverts">Drainage & Culverts</option>
              <option value="bridges_structures">Bridges & Structures</option>
              <option value="streetlights_signals">Streetlights & Traffic Signs</option>
              <option value="custom">Configured Custom Categories</option>
            </select>
          </div>

          <div>
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            >
              <option value="all">All Condition Ratings</option>
              <option value="1">1 - Very Good</option>
              <option value="2">2 - Good</option>
              <option value="3">3 - Fair / Moderate</option>
              <option value="4">4 - Poor</option>
              <option value="5">5 - Critical / Failed</option>
            </select>
          </div>

          <div>
            <select
              value={suburbFilter}
              onChange={(e) => setSuburbFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            >
              <option value="all">All Suburbs (NCD-wide)</option>
              {POM_SUBURBS.map((suburb) => (
                <option key={suburb} value={suburb}>
                  {suburb}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Asset Table Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Asset ID & Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Suburb & Location</th>
                <th className="px-4 py-3">Condition Rating</th>
                <th className="px-4 py-3">Responsible Authority</th>
                <th className="px-4 py-3">Next Inspection</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-slate-900">{asset.id}</span>
                    <p className="font-medium text-slate-800 mt-0.5">{asset.name}</p>
                    <span className="text-[11px] text-slate-400">Built {asset.installationYear}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-700">{asset.categoryName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-800">{asset.suburb}</span>
                    <p className="text-[11px] text-slate-500 truncate max-w-xs">{asset.locationDescription}</p>
                  </td>
                  <td className="px-4 py-3">{renderConditionBadge(asset.condition)}</td>
                  <td className="px-4 py-3 text-slate-600 text-[11px] truncate max-w-[180px]">
                    {asset.responsibleAuthority}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">
                    {new Date(asset.nextInspectionDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedAsset(asset)}
                      className="px-3 py-1 bg-slate-100 text-slate-800 hover:bg-amber-500 hover:text-slate-950 font-medium rounded transition-colors whitespace-nowrap"
                    >
                      Inspect File
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAssets.length === 0 && (
          <div className="p-8 text-center">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-900 text-sm">No matching assets found</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the category or condition filters.</p>
          </div>
        )}
      </div>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
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
                    <span className="font-mono font-bold text-slate-800">{selectedAsset.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedAsset.categoryName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedAsset.suburb}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {selectedAsset.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 text-xs text-slate-700">
              {/* Asset Hero & Condition Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="md:col-span-2 space-y-2">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedAsset.description}
                  </p>
                  <div className="text-[11px] text-slate-500 pt-1">
                    <p><strong>Location:</strong> {selectedAsset.locationDescription}</p>
                    <p className="mt-0.5"><strong>Custodian:</strong> {selectedAsset.responsibleAuthority}</p>
                    <p className="mt-0.5 font-mono"><strong>Coordinates:</strong> {selectedAsset.coordinates[0].toFixed(5)}, {selectedAsset.coordinates[1].toFixed(5)}</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium">Condition Rating</span>
                    <div className="mt-1">{renderConditionBadge(selectedAsset.condition)}</div>
                  </div>

                  {isStaff && (
                    <button
                      onClick={() => {
                        setConditionScoreToUpdate(selectedAsset.condition);
                        setShowConditionUpdateModal(true);
                      }}
                      className="mt-3 px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded font-semibold text-[11px] transition-colors"
                    >
                      Update Assessment
                    </button>
                  )}
                </div>
              </div>

              {/* Technical Specifications */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Technical Specifications</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(selectedAsset.specifications).map(([key, value]) => (
                    <div key={key} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-500 font-medium text-[11px]">{key}</span>
                      <span className="font-mono text-slate-800 text-[11px] font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inspection History */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 text-sm">Inspection Log ({selectedAsset.inspectionHistory.length})</h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Next Due: {selectedAsset.nextInspectionDate}
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedAsset.inspectionHistory.map((ins) => (
                    <div key={ins.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono font-bold text-slate-700">{ins.id} · {ins.date}</span>
                        <div className="flex items-center gap-1.5">
                          <span>{renderConditionBadge(ins.conditionScore)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-600 font-medium">{ins.inspectorName}</span>
                        </div>
                      </div>
                      <p className="text-slate-800 font-medium text-xs">{ins.findings}</p>
                      <p className="text-[11px] text-amber-800">
                        <strong>Recommendation:</strong> {ins.recommendedAction}
                      </p>
                    </div>
                  ))}

                  {selectedAsset.inspectionHistory.length === 0 && (
                    <p className="text-slate-400 italic text-center py-3 bg-slate-50 rounded-lg">
                      No historical inspection logs recorded for this asset yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Maintenance History */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">
                  Maintenance History ({selectedAsset.maintenanceHistory.length})
                </h4>
                <div className="space-y-2">
                  {selectedAsset.maintenanceHistory.map((m) => (
                    <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-mono font-bold text-slate-800">{m.workOrderId}</span>
                        <span className="font-mono text-slate-600">{m.completionDate}</span>
                      </div>
                      <p className="text-slate-800 font-medium">{m.summary}</p>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                        <span>Contractor: {m.contractorOrCrew}</span>
                        <span className="font-mono font-bold text-slate-800">
                          PGK {m.costPGK.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}

                  {selectedAsset.maintenanceHistory.length === 0 && (
                    <p className="text-slate-400 italic text-center py-3 bg-slate-50 rounded-lg">
                      No major capital maintenance records logged.
                    </p>
                  )}
                </div>
              </div>

              {/* Linked Projects & Work Orders */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-700" />
                  <span className="font-semibold text-amber-950 text-xs">
                    Linked Projects: {selectedAsset.linkedProjectIds.join(', ') || 'None active'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedAsset(null);
                    setActiveTab('operations');
                  }}
                  className="px-3 py-1 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700 transition-colors"
                >
                  View in Engineering Operations
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedAsset(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Close Asset File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Register New Municipal Asset</h3>
                <p className="text-xs text-slate-500">NCDC Civil Infrastructure Asset Catalog</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Asset Name / Title</label>
                <input
                  type="text"
                  required
                  value={newAssetForm.name}
                  onChange={(e) => setNewAssetForm({ ...newAssetForm, name: e.target.value })}
                  placeholder="e.g. Sir John Guise Drive Concrete Invert Drain"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Asset Category</label>
                  <select
                    value={newAssetForm.category}
                    onChange={(e) => {
                      const cat = e.target.value as AssetCategory;
                      let label = 'Roads & Road Segments';
                      if (cat === 'drainage_culverts') label = 'Drainage & Culverts';
                      if (cat === 'bridges_structures') label = 'Bridges & Structures';
                      if (cat === 'streetlights_signals') label = 'Streetlights & Traffic Signs';
                      if (cat === 'custom') label = 'Custom Civil Category';
                      setNewAssetForm({ ...newAssetForm, category: cat, categoryName: label });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-xs"
                  >
                    <option value="roads_segments">Roads & Road Segments</option>
                    <option value="drainage_culverts">Drainage & Culverts</option>
                    <option value="bridges_structures">Bridges & Structures</option>
                    <option value="streetlights_signals">Streetlights & Traffic Signs</option>
                    <option value="custom">Configured Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Suburb Location</label>
                  <select
                    value={newAssetForm.suburb}
                    onChange={(e) => setNewAssetForm({ ...newAssetForm, suburb: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-xs"
                  >
                    {POM_SUBURBS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Precise Location Description</label>
                <input
                  type="text"
                  value={newAssetForm.locationDescription}
                  onChange={(e) => setNewAssetForm({ ...newAssetForm, locationDescription: e.target.value })}
                  placeholder="e.g. Chainage 1+400 opposite National Library"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Baseline Condition (1-5)</label>
                  <select
                    value={newAssetForm.condition}
                    onChange={(e) =>
                      setNewAssetForm({
                        ...newAssetForm,
                        condition: Number(e.target.value) as ConditionRating,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value={1}>1 - Very Good (New)</option>
                    <option value={2}>2 - Good (Minor wear)</option>
                    <option value={3}>3 - Fair (Serviceable)</option>
                    <option value={4}>4 - Poor (Repair needed)</option>
                    <option value={5}>5 - Critical / Failed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Installation Year</label>
                  <input
                    type="number"
                    value={newAssetForm.installationYear}
                    onChange={(e) =>
                      setNewAssetForm({ ...newAssetForm, installationYear: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Asset Description & Scope</label>
                <textarea
                  rows={2}
                  value={newAssetForm.description}
                  onChange={(e) => setNewAssetForm({ ...newAssetForm, description: e.target.value })}
                  placeholder="Engineering description of structural makeup, materials, and drainage connections."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 border border-slate-200 bg-white rounded-lg text-slate-700 hover:bg-slate-100 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 text-xs shadow-sm"
                >
                  Save Asset Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Configure Custom Categories Modal */}
      {showCategoryConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Custom Infrastructure Categories</h3>
                <p className="text-xs text-slate-500">Configure new municipal asset classes</p>
              </div>
              <button
                onClick={() => setShowCategoryConfigModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-2">Existing Configured Classes</h4>
                <div className="space-y-2">
                  {customCategories.map((c) => (
                    <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{c.name}</span>
                        <span className="font-mono text-slate-500 font-semibold">{c.codePrefix}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">{c.description}</p>
                      <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-slate-500">
                        <span>Tracked Attributes:</span>
                        {c.attributes.map((a) => (
                          <span key={a} className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add form */}
              <form onSubmit={handleCreateCategory} className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-3">
                <h4 className="font-bold text-amber-950 text-xs">Add New Category Definition</h4>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Category Title</label>
                  <input
                    type="text"
                    required
                    value={newCategoryForm.name}
                    onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                    placeholder="e.g. Bus Terminals & Transit Shelters"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">ID Code Prefix</label>
                    <input
                      type="text"
                      required
                      value={newCategoryForm.codePrefix}
                      onChange={(e) => setNewCategoryForm({ ...newCategoryForm, codePrefix: e.target.value })}
                      placeholder="e.g. NCDC-BUS"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">Icon Indicator</label>
                    <input
                      type="text"
                      value={newCategoryForm.iconName}
                      onChange={(e) => setNewCategoryForm({ ...newCategoryForm, iconName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Custom Attributes (comma separated)</label>
                  <input
                    type="text"
                    value={newCategoryForm.attributesStr}
                    onChange={(e) => setNewCategoryForm({ ...newCategoryForm, attributesStr: e.target.value })}
                    placeholder="e.g. Bay Count, Shelter Type, Solar Lighting"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCategoryConfigModal(false)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-xs"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 text-xs"
                  >
                    Add Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Quick Condition Assessment Update Modal */}
      {showConditionUpdateModal && selectedAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Record Condition Assessment for {selectedAsset.id}
            </h3>
            <p className="text-xs text-slate-600">
              Assessor: <strong>{currentUser.name}</strong> ({currentUser.title})
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Updated Condition Rating</label>
                <select
                  value={conditionScoreToUpdate}
                  onChange={(e) => setConditionScoreToUpdate(Number(e.target.value) as ConditionRating)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  <option value={1}>1 - Very Good (Defect-free / As new)</option>
                  <option value={2}>2 - Good (Minor superficial wear)</option>
                  <option value={3}>3 - Fair / Moderate (Maintenance recommended)</option>
                  <option value={4}>4 - Poor (Structural degradation evident)</option>
                  <option value={5}>5 - Critical / Failed (Immediate hazard)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Engineering Assessment Notes</label>
                <textarea
                  rows={3}
                  value={conditionNotesToUpdate}
                  onChange={(e) => setConditionNotesToUpdate(e.target.value)}
                  placeholder="Record observed cracking, spalling, scour, or hydraulic obstruction..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowConditionUpdateModal(false)}
                className="px-3.5 py-2 border border-slate-200 bg-white rounded-lg text-slate-700 hover:bg-slate-100 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCondition}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-bold text-xs"
              >
                Commit Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
