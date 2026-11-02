import React, { useState } from 'react';
import { useInfrastructure } from '../../context/InfrastructureContext';
import { PomMap } from '../map/PomMap';
import {
  ReportCategory,
  ReportStatus,
  CitizenReport
} from '../../types/infrastructure';
import { POM_SUBURBS, IMAGES } from '../../data/seedData';
import {
  AlertTriangle,
  MapPin,
  Camera,
  CheckCircle2,
  Search,
  FileCheck,
  Copy,
  Clock,
  UserCheck,
  Layers,
  Wrench,
  GitMerge,
  ShieldAlert,
  ArrowRight,
  Info,
  X
} from 'lucide-react';

export const CitizenReportingModule: React.FC = () => {
  const {
    reports,
    submitCitizenReport,
    triageReport,
    mergeDuplicateReport,
    isStaff,
    currentUser,
    assets
  } = useInfrastructure();

  // Navigation tab within Module 4: 'report_form' | 'track_report' | 'triage_queue'
  const [activeSubTab, setActiveSubTab] = useState<'report_form' | 'track_report' | 'triage_queue'>(
    isStaff ? 'triage_queue' : 'report_form'
  );

  // Form State
  const [category, setCategory] = useState<ReportCategory>('pothole');
  const [suburb, setSuburb] = useState<string>('Hohola');
  const [roadName, setRoadName] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [reporterName, setReporterName] = useState<string>('');
  const [reporterContact, setReporterContact] = useState<string>('');
  const [attachedPhoto, setAttachedPhoto] = useState<string>(IMAGES.inspection);

  // Map coordinate pin dropper state
  const [pinnedCoords, setPinnedCoords] = useState<[number, number]>([-9.4578, 147.1812]);
  const [isPinDropperOpen, setIsPinDropperOpen] = useState(false);

  // Submission result state
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Tracking Search State
  const [trackingCode, setTrackingCode] = useState<string>('');
  const [trackedReport, setTrackedReport] = useState<CitizenReport | null>(null);

  // Triage state (for staff)
  const [selectedTriageReport, setSelectedTriageReport] = useState<CitizenReport | null>(null);
  const [triageNotes, setTriageNotes] = useState('');
  const [triageStatus, setTriageStatus] = useState<ReportStatus>('triaged');
  const [isDefectVerified, setIsDefectVerified] = useState(true);
  const [duplicatePrimaryId, setDuplicatePrimaryId] = useState('');

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadName || !description) return;

    let catName = 'Pothole & Pavement Defect';
    if (category === 'blocked_drain') catName = 'Blocked Drainage & Flooding';
    if (category === 'damaged_sign') catName = 'Damaged Sign / Guardrail';
    if (category === 'broken_streetlight') catName = 'Broken Streetlight / Traffic Light';
    if (category === 'damaged_guardrail') catName = 'Damaged Safety Guardrail';
    if (category === 'water_pooling') catName = 'Severe Water Ponding';
    if (category === 'illegal_excavation') catName = 'Illegal Road Cutting';

    const newId = submitCitizenReport({
      category,
      categoryName: catName,
      suburb,
      roadName,
      landmark: landmark || `${suburb} road corridor`,
      coordinates: pinnedCoords,
      description,
      photoUrl: attachedPhoto,
      reporterName: reporterName || 'Anonymous Citizen',
      reporterContact: reporterContact || 'Unspecified',
      urgencyCitizen: urgency,
    });

    setSubmittedRef(newId);
  };

  // Duplicate candidate detector: reports in same suburb
  const nearbyDuplicateCandidates = reports.filter(
    (r) => r.suburb.toLowerCase() === suburb.toLowerCase() && r.status !== 'duplicate_merged'
  );

  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = reports.find(
      (r) => r.id.toLowerCase().trim() === trackingCode.toLowerCase().trim()
    );
    setTrackedReport(found || null);
  };

  const handleSaveTriage = () => {
    if (!selectedTriageReport) return;
    triageReport(
      selectedTriageReport.id,
      triageStatus,
      isDefectVerified,
      triageNotes,
      currentUser.name
    );
    setSelectedTriageReport(null);
    setTriageNotes('');
  };

  const handleMergeDuplicate = () => {
    if (!selectedTriageReport || !duplicatePrimaryId) return;
    mergeDuplicateReport(
      selectedTriageReport.id,
      duplicatePrimaryId,
      triageNotes || 'Same defect verified at identical geographic coordinates.'
    );
    setSelectedTriageReport(null);
    setDuplicatePrimaryId('');
  };

  const renderStatusStep = (currentStatus: ReportStatus, step: number) => {
    // 1: received, 2: triaged, 3: inspection_scheduled, 4: work_order_created, 5: resolved
    const mapLevel: Record<ReportStatus, number> = {
      received: 1,
      duplicate_merged: 1,
      triaged: 2,
      inspection_scheduled: 3,
      work_order_created: 4,
      resolved: 5,
      dismissed: 0,
    };
    const level = mapLevel[currentStatus] || 1;
    return level >= step;
  };

  return (
    <div className="space-y-6">
      {/* Title & Navigation Tabs */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>National Capital District Commission</span>
              <span aria-hidden="true">·</span>
              <span>Module 4: Public Infrastructure Reporting</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-amber-700">Citizen Action Portal</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Civic Infrastructure Defect Reporting
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Report potholes, blocked drains, collapsed culverts, broken streetlights, and traffic hazards directly to NCDC engineering teams. Track report progression from initial triage to work order resolution.
            </p>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0 self-start md:self-auto">
            <button
              onClick={() => {
                setActiveSubTab('report_form');
                setSubmittedRef(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeSubTab === 'report_form'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Submit Report
            </button>
            <button
              onClick={() => setActiveSubTab('track_report')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeSubTab === 'track_report'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Track by Reference
            </button>
            {isStaff && (
              <button
                onClick={() => setActiveSubTab('triage_queue')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeSubTab === 'triage_queue'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Staff Triage Queue ({reports.filter((r) => r.status === 'received').length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-View 1: Submit Report Form */}
      {activeSubTab === 'report_form' && (
        <div className="max-w-3xl mx-auto">
          {submittedRef ? (
            /* Confirmation Screen */
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-5">
              <div className="flex items-center justify-center gap-3">
                <img
                  src={IMAGES.logo}
                  alt="NCDC Official Crest"
                  className="w-12 h-12 object-contain rounded-lg p-0.5 bg-white border border-slate-200 shadow-2xs"
                  referrerPolicy="no-referrer"
                />
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Submission Successfully Recorded · NCDC Registry
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  Report Reference: <span className="font-mono text-amber-600">{submittedRef}</span>
                </h2>
                <p className="text-xs text-slate-600 mt-2 max-w-lg mx-auto">
                  Your infrastructure report has been queued for engineering triage at the NCDC City Hall Operations Desk. Keep this reference number to monitor inspection scheduling and repair work orders.
                </p>
              </div>

              {/* Distinction banner */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 text-xs max-w-lg mx-auto text-left">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Statutory Distinction</span>
                </div>
                <p>
                  This submission is currently registered as an <strong>Unverified Citizen Report</strong>. An NCDC civil engineer or field inspector will physically verify site condition before reclassifying it as a certified defect.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(submittedRef);
                    setCopiedNotification(true);
                    setTimeout(() => setCopiedNotification(false), 2000);
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedNotification ? 'Copied to Clipboard!' : 'Copy Reference Code'}</span>
                </button>

                <button
                  onClick={() => {
                    setTrackingCode(submittedRef);
                    setActiveSubTab('track_report');
                    const found = reports.find((r) => r.id === submittedRef);
                    setTrackedReport(found || null);
                  }}
                  className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold transition-colors"
                >
                  Track Status Now
                </button>
              </div>

              <button
                onClick={() => {
                  setSubmittedRef(null);
                  setRoadName('');
                  setDescription('');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 underline block mx-auto pt-2"
              >
                Submit another infrastructure report
              </button>
            </div>
          ) : (
            /* Main Submission Form */
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">Report an Infrastructure Defect</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete the details below. Geotagging coordinates assist road maintenance crews in locating the issue promptly.
                </p>
              </div>

              {/* Issue Category */}
              <div>
                <label className="block font-bold text-slate-900 text-xs mb-2">
                  1. Issue Classification
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'pothole', label: 'Pothole / Tarmac Defect' },
                    { id: 'blocked_drain', label: 'Blocked Drain / Flooding' },
                    { id: 'broken_streetlight', label: 'Dark / Broken Streetlight' },
                    { id: 'damaged_sign', label: 'Damaged Sign / Guardrail' },
                    { id: 'water_pooling', label: 'Water Pooling on Road' },
                    { id: 'illegal_excavation', label: 'Illegal Road Trench' },
                    { id: 'damaged_guardrail', label: 'Bridge / Median Rail' },
                    { id: 'other', label: 'Other Civic Defect' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCategory(item.id as ReportCategory)}
                      className={`p-2.5 text-left rounded-lg border font-semibold transition-all ${
                        category === item.id
                          ? 'bg-amber-500/10 border-amber-500 text-amber-950 ring-1 ring-amber-500'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Picker */}
              <div className="space-y-3">
                <label className="block font-bold text-slate-900 text-xs">
                  2. Incident Location & Map Pin
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Suburb
                    </label>
                    <select
                      value={suburb}
                      onChange={(e) => setSuburb(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      {POM_SUBURBS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Road / Street Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={roadName}
                      onChange={(e) => setRoadName(e.target.value)}
                      placeholder="e.g. Poreporena Freeway or Hubert Murray Hwy"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Prominent Landmark / Section Detail
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Hohola 2 overpass heading toward town, opposite market"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                {/* Interactive Map Pin Dropper */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-600" />
                      <span className="font-semibold text-xs text-slate-800">
                        GPS Coordinates: {pinnedCoords[0].toFixed(5)}, {pinnedCoords[1].toFixed(5)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPinDropperOpen(!isPinDropperOpen)}
                      className="text-xs font-semibold text-amber-700 hover:text-amber-800 underline"
                    >
                      {isPinDropperOpen ? 'Hide Map Selector' : 'Pinpoint on Map'}
                    </button>
                  </div>

                  {isPinDropperOpen && (
                    <div className="pt-2">
                      <p className="text-[11px] text-slate-500 mb-2">
                        Click anywhere on the Port Moresby map to place the defect location pin:
                      </p>
                      <PomMap
                        roadworks={[]}
                        pinDropMode={true}
                        droppedPin={pinnedCoords}
                        onPinDropped={(coords) => setPinnedCoords(coords)}
                        heightClass="h-[280px]"
                      />
                    </div>
                  )}
                </div>

                {/* Duplicate Review Advisor */}
                {nearbyDuplicateCandidates.length > 0 && (
                  <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 text-xs">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Info className="w-4 h-4 text-sky-700" />
                      <span>Nearby Reports in {suburb}</span>
                    </div>
                    <p className="text-[11px] text-sky-900">
                      We found {nearbyDuplicateCandidates.length} existing civic report(s) in {suburb}. Check below if your issue has already been logged to avoid redundant inspections:
                    </p>
                    <div className="mt-2 space-y-1.5">
                      {nearbyDuplicateCandidates.slice(0, 2).map((item) => (
                        <div key={item.id} className="p-2 bg-white rounded border border-sky-100 flex items-center justify-between">
                          <div>
                            <span className="font-mono font-bold text-slate-800">{item.id}</span>
                            <span className="text-slate-600 ml-2">{item.roadName}</span>
                          </div>
                          <span className="capitalize text-[11px] font-semibold text-amber-800">
                            {item.status.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description & Severity */}
              <div className="space-y-3">
                <label className="block font-bold text-slate-900 text-xs">
                  3. Defect Description & Severity
                </label>

                <div>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the severity, approximate dimensions (e.g. 1 meter wide, 15cm deep), whether water is pooling, or if traffic is hazardous."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Citizen Urgency Rating
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="low">Low (Superficial defect)</option>
                      <option value="medium">Medium (Moderate road roughness)</option>
                      <option value="high">High (Severe vehicular risk)</option>
                      <option value="critical">Critical (Immediate danger of accident)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Photo Evidence Attachment
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 truncate">
                        {attachedPhoto ? 'Photo attached (Ready to submit)' : 'No photo chosen'}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          // Toggle between simulated photos
                          setAttachedPhoto(
                            attachedPhoto === IMAGES.inspection ? IMAGES.hero : IMAGES.inspection
                          );
                        }}
                        className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                        title="Change sample photo"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reporter Contact Info (Optional) */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-900 text-xs">
                  4. Reporter Contact (Optional — For SMS Updates)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Your Name (e.g. John Kua)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={reporterContact}
                    onChange={(e) => setReporterContact(e.target.value)}
                    placeholder="Phone Number (e.g. +675 7200 ****)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Data stored securely in NCDC Incident Registry
                </span>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-sm transition-colors"
                >
                  Submit Infrastructure Report
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Sub-View 2: Track Report Progress */}
      {activeSubTab === 'track_report' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">Track Civic Report Progression</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your unique report reference number (e.g. POM-REP-2026-0842) to check engineering inspection findings.
            </p>

            <form onSubmit={handleTrackSearch} className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="e.g. POM-REP-2026-0842"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono uppercase focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Lookup
              </button>
            </form>

            {/* Quick Sample Links */}
            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
              <span>Try sample reports:</span>
              {reports.slice(0, 3).map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setTrackingCode(r.id);
                    setTrackedReport(r);
                  }}
                  className="font-mono text-amber-700 hover:underline"
                >
                  {r.id}
                </button>
              ))}
            </div>
          </div>

          {/* Tracked Report Results Card */}
          {trackedReport && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-bold text-slate-900">{trackedReport.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>{trackedReport.suburb}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {trackedReport.categoryName}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    {trackedReport.roadName} — {trackedReport.landmark}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Submitted</span>
                  <span className="font-mono text-xs text-slate-700">
                    {new Date(trackedReport.submittedAt).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>

              {/* Status Progression Bar */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-3">Lifecycle Progress</h4>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div
                    className={`p-2 rounded-lg border ${
                      renderStatusStep(trackedReport.status, 1)
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span className="block text-[10px] font-mono">STEP 1</span>
                    Received
                  </div>

                  <div
                    className={`p-2 rounded-lg border ${
                      renderStatusStep(trackedReport.status, 2)
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span className="block text-[10px] font-mono">STEP 2</span>
                    Triaged
                  </div>

                  <div
                    className={`p-2 rounded-lg border ${
                      renderStatusStep(trackedReport.status, 3)
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span className="block text-[10px] font-mono">STEP 3</span>
                    Inspection
                  </div>

                  <div
                    className={`p-2 rounded-lg border ${
                      renderStatusStep(trackedReport.status, 4)
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span className="block text-[10px] font-mono">STEP 4</span>
                    Work Order
                  </div>
                </div>
              </div>

              {/* Engineering Verification Badge */}
              <div
                className={`p-4 rounded-xl border text-xs space-y-1 ${
                  trackedReport.isVerifiedEngineeringDefect
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50/70 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {trackedReport.isVerifiedEngineeringDefect ? (
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-600" />
                  )}
                  <span>
                    {trackedReport.isVerifiedEngineeringDefect
                      ? 'VERIFIED ENGINEERING FINDING'
                      : 'UNVERIFIED CITIZEN SUBMISSION'}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {trackedReport.internalTriageNotes ||
                    'Report is logged in initial triage queue. Field inspection pending.'}
                </p>
                {trackedReport.assignedInspector && (
                  <p className="text-[10px] text-slate-600 font-semibold pt-1">
                    Assigned Inspector: {trackedReport.assignedInspector}
                  </p>
                )}
                {trackedReport.linkedWorkOrderId && (
                  <p className="font-mono text-[11px] font-bold text-amber-800 pt-1">
                    Linked Maintenance Work Order: {trackedReport.linkedWorkOrderId}
                  </p>
                )}
              </div>

              {/* Submitted Details */}
              <div className="text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">Citizen Description:</span>
                <p className="bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                  "{trackedReport.description}"
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-View 3: Staff Triage & Assignment Queue */}
      {activeSubTab === 'triage_queue' && isStaff && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Internal Triage & Assignment Queue</h3>
              <p className="text-xs text-slate-500">
                Review unverified citizen submissions, detect duplicates, assign field inspectors, and verify defects.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {reports.length} Total Registered Reports
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Ref & Type</th>
                  <th className="px-4 py-3">Location & Suburb</th>
                  <th className="px-4 py-3">Citizen Urgency</th>
                  <th className="px-4 py-3">Verification State</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Triage Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-slate-900">{r.id}</span>
                      <p className="font-medium text-slate-800">{r.categoryName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900">{r.roadName}</span>
                      <p className="text-[11px] text-slate-500">{r.suburb}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`capitalize font-semibold ${
                          r.urgencyCitizen === 'critical'
                            ? 'text-rose-700'
                            : r.urgencyCitizen === 'high'
                            ? 'text-amber-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {r.urgencyCitizen}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.isVerifiedEngineeringDefect ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified Defect
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Unverified Citizen Report
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 capitalize font-medium text-slate-800">
                      {r.status.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedTriageReport(r);
                          setTriageStatus(r.status);
                          setIsDefectVerified(r.isVerifiedEngineeringDefect);
                          setTriageNotes(r.internalTriageNotes || '');
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-amber-500 hover:text-slate-950 font-bold rounded transition-colors"
                      >
                        Triage / Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff Triage Modal */}
      {selectedTriageReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Triage Report: {selectedTriageReport.id}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedTriageReport.roadName}, {selectedTriageReport.suburb}
                </p>
              </div>
              <button
                onClick={() => setSelectedTriageReport(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Report Context */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800">Citizen Description:</span>
                <p className="text-slate-700 italic">"{selectedTriageReport.description}"</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Reporter: {selectedTriageReport.reporterName}</span>
                  <span className="font-mono">
                    Coords: {selectedTriageReport.coordinates[0].toFixed(5)},{' '}
                    {selectedTriageReport.coordinates[1].toFixed(5)}
                  </span>
                </div>
              </div>

              {/* Engineering Verification Switch */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Engineering Verification</span>
                  <p className="text-[11px] text-slate-600">
                    Distinguish official engineering finding from public submission
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDefectVerified(!isDefectVerified)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                    isDefectVerified
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isDefectVerified ? 'Verified Defect' : 'Unverified Citizen Report'}
                </button>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Workflow Status</label>
                <select
                  value={triageStatus}
                  onChange={(e) => setTriageStatus(e.target.value as ReportStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="received">Received</option>
                  <option value="triaged">Triaged</option>
                  <option value="inspection_scheduled">Inspection Scheduled</option>
                  <option value="work_order_created">Work Order Created</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed / Invalid</option>
                </select>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Internal Triage Notes & Findings
                </label>
                <textarea
                  rows={3}
                  value={triageNotes}
                  onChange={(e) => setTriageNotes(e.target.value)}
                  placeholder="Record defect verification results, hazard rating, or dispatch instructions..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              {/* Duplicate Merger Tool */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Duplicate Report Review</span>
                <p className="text-[11px] text-slate-500">
                  If this defect duplicates an existing incident, merge it under the primary reference:
                </p>
                <div className="flex gap-2">
                  <select
                    value={duplicatePrimaryId}
                    onChange={(e) => setDuplicatePrimaryId(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">Select Primary Report Reference</option>
                    {reports
                      .filter((r) => r.id !== selectedTriageReport.id)
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.id} ({r.roadName} - {r.categoryName})
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    disabled={!duplicatePrimaryId}
                    onClick={handleMergeDuplicate}
                    className="px-3 py-1.5 bg-slate-800 text-white disabled:opacity-50 rounded-lg font-bold text-xs"
                  >
                    Merge Duplicate
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTriageReport(null)}
                  className="px-3.5 py-2 border border-slate-200 bg-white rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTriage}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 shadow-sm"
                >
                  Save Triage Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
