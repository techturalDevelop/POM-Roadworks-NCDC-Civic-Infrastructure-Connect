import React, { useState, useMemo } from 'react';
import { useInfrastructure } from '../../context/InfrastructureContext';
import {
  OfficialNotice,
  NoticeStatus,
  NoticeCategory
} from '../../types/infrastructure';
import { POM_SUBURBS, IMAGES } from '../../data/seedData';
import {
  Search,
  Filter,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  Plus,
  Eye,
  History,
  FileCheck2,
  Lock,
  ArrowRight,
  X,
  Building2,
  ShieldCheck,
  Download
} from 'lucide-react';

export const NoticesModule: React.FC = () => {
  const {
    notices,
    isStaff,
    currentUser,
    createNotice,
    updateNoticeStatus,
    publishNotice,
    setActiveTab,
  } = useInfrastructure();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [selectedNotice, setSelectedNotice] = useState<OfficialNotice | null>(null);
  const [previewNotice, setPreviewNotice] = useState<OfficialNotice | null>(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [actionNotes, setActionNotes] = useState('');

  // New Draft Form State
  const [draftForm, setDraftForm] = useState({
    title: '',
    category: 'road_closure' as NoticeCategory,
    issuingDepartment: 'Directorate of Engineering & Works',
    affectedLocations: ['Waigani'],
    corridorSummary: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    description: '',
    publicAdvisory: '',
    detourRoute: '',
  });

  // Filtered Notices:
  // CRITICAL RULE: If not staff (Public Citizen View), strictly filter for published notices only!
  const visibleNotices = useMemo(() => {
    return notices.filter((n) => {
      // Security rule: Public never sees drafts, under_review, or unapproved scheduled notices
      if (!isStaff && n.status !== 'published') {
        return false;
      }

      const matchesSearch =
        searchQuery === '' ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.corridorSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.affectedLocations.some((loc) => loc.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === 'all' || n.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || n.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [notices, isStaff, searchQuery, categoryFilter, statusFilter]);

  const renderStatusBadge = (status: NoticeStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Published Official Notice
          </span>
        );
      case 'approved':
        return (
          <span className="text-sky-700 font-bold flex items-center gap-1">
            <FileCheck2 className="w-3.5 h-3.5 text-sky-600" /> Approved (Awaiting Schedule)
          </span>
        );
      case 'scheduled':
        return (
          <span className="text-indigo-700 font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-600" /> Scheduled
          </span>
        );
      case 'under_review':
        return (
          <span className="text-amber-700 font-bold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Under Review
          </span>
        );
      case 'draft':
        return (
          <span className="text-slate-500 font-bold flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Internal Draft
          </span>
        );
      case 'expired':
        return <span className="text-slate-400 font-medium">Expired</span>;
      case 'archived':
        return <span className="text-slate-400 font-medium">Archived</span>;
    }
  };

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftForm.title) return;

    createNotice({
      title: draftForm.title,
      category: draftForm.category,
      issuingDepartment: draftForm.issuingDepartment,
      issuingOfficer: currentUser.name,
      officerDesignation: currentUser.title,
      affectedLocations: draftForm.affectedLocations,
      corridorSummary: draftForm.corridorSummary || 'National Capital District Road Network',
      coordinates: [-9.4438, 147.1803],
      effectiveDate: draftForm.effectiveDate,
      expiryDate: draftForm.expiryDate,
      status: 'draft',
      description: draftForm.description,
      publicAdvisory: draftForm.publicAdvisory,
      detourRoute: draftForm.detourRoute || 'Refer to designated advisory signs.',
      supportingDocuments: [
        {
          title: 'Draft Road Traffic Management Order',
          docRef: `DOC-DRAFT-${Date.now().toString().slice(-4)}`,
          fileType: 'PDF Document',
          size: '1.2 MB',
          uploadDate: new Date().toISOString().split('T')[0],
        },
      ],
    });

    setShowDraftModal(false);
  };

  const handlePromoteStatus = (notice: OfficialNotice, nextStatus: NoticeStatus) => {
    updateNoticeStatus(
      notice.id,
      nextStatus,
      actionNotes || `Promoted status to ${nextStatus.toUpperCase()} by ${currentUser.name}`
    );
    setActionNotes('');
    if (selectedNotice?.id === notice.id) {
      setSelectedNotice({
        ...notice,
        status: nextStatus,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Statutory Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>National Capital District Commission</span>
              <span aria-hidden="true">·</span>
              <span>Module 3: Official Public Notices</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-amber-700">Gazetted Civic Bulletins</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Official Civic & Traffic Notices
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              {isStaff
                ? 'Statutory notice administration interface. Draft, review, approve, schedule, and publish official traffic orders, road closures, and public safety declarations.'
                : 'Official public register of approved road closures, traffic diversions, utility disruptions, and civic advisories authorized by the NCDC Directorate of Engineering & Works.'}
            </p>
          </div>

          {/* Action Button for Staff */}
          {isStaff ? (
            <button
              onClick={() => setShowDraftModal(true)}
              type="button"
              className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 self-start md:self-auto shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Draft New Notice</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 self-start md:self-auto">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">Verified NCDC Public Feed</span>
            </div>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference, title, corridor..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            >
              <option value="all">All Notice Categories</option>
              <option value="road_closure">Road Closure & Diversion</option>
              <option value="utility_disruption">Utility Disruption</option>
              <option value="public_safety">Public Safety Advisory</option>
              <option value="emergency_works">Emergency Works</option>
              <option value="heavy_vehicle_restriction">Heavy Vehicle Restriction</option>
            </select>
          </div>

          {isStaff && (
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              >
                <option value="all">All Workflow States</option>
                <option value="published">Published</option>
                <option value="approved">Approved</option>
                <option value="scheduled">Scheduled</option>
                <option value="under_review">Under Review</option>
                <option value="draft">Internal Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleNotices.map((notice) => (
          <div
            key={notice.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-xs transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-mono font-bold text-slate-800">{notice.id}</span>
                <div>{renderStatusBadge(notice.status)}</div>
              </div>

              <h3 className="font-bold text-slate-900 text-base leading-snug">{notice.title}</h3>
              <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                {notice.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">Affected Corridors:</span>
                  <span className="font-semibold text-slate-800">{notice.affectedLocations.join(', ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">Effective Dates:</span>
                  <span className="font-mono text-slate-800">
                    {notice.effectiveDate} → {notice.expiryDate}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">Issuing Department:</span>
                  <span className="text-slate-800 truncate max-w-[200px]">
                    {notice.issuingDepartment}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">
                {notice.supportingDocuments.length} official document(s)
              </span>

              <div className="flex items-center gap-2">
                {isStaff && notice.status !== 'published' && (
                  <button
                    onClick={() => setPreviewNotice(notice)}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedNotice(notice)}
                  className="px-3 py-1 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-md transition-colors"
                >
                  {isStaff ? 'Manage Notice' : 'Read Full Notice'}
                </button>
              </div>
            </div>
          </div>
        ))}

        {visibleNotices.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-900 text-base">No official notices match your filter</p>
            <p className="text-xs text-slate-500 mt-1">
              {!isStaff && 'Draft notices are withheld from the public feed until authorized.'}
            </p>
          </div>
        )}
      </div>

      {/* Notice Detail & Management Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span className="font-mono font-bold text-slate-800">{selectedNotice.id}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedNotice.issuingDepartment}</span>
                  <span aria-hidden="true">·</span>
                  <div>{renderStatusBadge(selectedNotice.status)}</div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {selectedNotice.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs text-slate-700">
              {/* Official Seal / Authority Banner */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={IMAGES.logo}
                    alt="NCDC Official Crest"
                    className="w-12 h-12 object-contain rounded-lg p-0.5 bg-white border border-slate-200/90 shadow-2xs shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="font-bold text-slate-900 text-xs">
                      National Capital District Commission — Papua New Guinea
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Issued under Section 42 of NCDC Act by {selectedNotice.issuingOfficer} (
                      {selectedNotice.officerDesignation})
                    </p>
                    {selectedNotice.publishedAt && (
                      <p className="font-mono text-[10px] text-emerald-700 mt-0.5">
                        Gazetted: {new Date(selectedNotice.publishedAt).toLocaleString('en-GB')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Full Description & Scope */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1.5">Official Declaration</h4>
                <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-line">
                  {selectedNotice.description}
                </p>
              </div>

              {/* Public Advisory & Detour Route */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Public Travel Advisory & Detour Plan</span>
                </div>
                <p className="text-xs">{selectedNotice.publicAdvisory}</p>
                <div className="pt-2 border-t border-amber-200/80">
                  <span className="font-bold">Approved Alternative Route:</span>
                  <p className="mt-0.5 text-xs">{selectedNotice.detourRoute}</p>
                </div>
              </div>

              {/* Corridor & Dates */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Effective Period</span>
                  <p className="font-mono text-slate-900 font-bold mt-0.5">
                    {selectedNotice.effectiveDate} to {selectedNotice.expiryDate}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Affected Locations</span>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {selectedNotice.affectedLocations.join(', ')}
                  </p>
                </div>
              </div>

              {/* Supporting Documents */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Supporting Documents & Gazette Plans</h4>
                <div className="space-y-2">
                  {selectedNotice.supportingDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-slate-600 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">{doc.title}</p>
                          <span className="text-[11px] text-slate-500">
                            {doc.docRef} · {doc.fileType} ({doc.size})
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => alert(`Simulating statutory document download: ${doc.title}`)}
                        className="px-2.5 py-1 text-slate-700 hover:text-slate-950 hover:bg-slate-200 rounded font-semibold text-xs flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                  {selectedNotice.supportingDocuments.length === 0 && (
                    <p className="text-slate-400 italic text-center py-2">No attached documents.</p>
                  )}
                </div>
              </div>

              {/* Change History Audit Trail (Internal for Staff) */}
              {isStaff && (
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-slate-500" />
                    <span>Change History & Statutory Sign-off Trail</span>
                  </h4>
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {selectedNotice.changeHistory.map((hist, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded border border-slate-100 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-bold text-slate-700">{hist.action}</span>
                          <span className="font-mono">
                            {new Date(hist.timestamp).toLocaleString('en-GB')}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1">{hist.notes}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Officer: {hist.user} ({hist.role})
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Staff Workflow Actions Bar */}
              {isStaff && (
                <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-amber-950 text-xs">
                      Statutory Review & Publication Pipeline
                    </h5>
                    <span className="text-[11px] text-amber-900">
                      Signed in as: <strong>{currentUser.name}</strong>
                    </span>
                  </div>

                  <input
                    type="text"
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Enter engineering review / approval remarks for the audit trail..."
                    className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs"
                  />

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {selectedNotice.status === 'draft' && (
                      <button
                        onClick={() => handlePromoteStatus(selectedNotice, 'under_review')}
                        className="px-3 py-1.5 bg-amber-600 text-white rounded font-semibold text-xs hover:bg-amber-700"
                      >
                        Submit for Engineering Review
                      </button>
                    )}

                    {selectedNotice.status === 'under_review' && (
                      <button
                        onClick={() => handlePromoteStatus(selectedNotice, 'approved')}
                        className="px-3 py-1.5 bg-sky-700 text-white rounded font-semibold text-xs hover:bg-sky-800"
                      >
                        Grant Directorate Approval
                      </button>
                    )}

                    {(selectedNotice.status === 'approved' || selectedNotice.status === 'scheduled') && (
                      <button
                        onClick={() => {
                          publishNotice(selectedNotice.id);
                          setSelectedNotice({ ...selectedNotice, status: 'published' });
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 text-white rounded font-bold text-xs hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Publish Official Notice to Public Portal</span>
                      </button>
                    )}

                    {selectedNotice.status === 'published' && (
                      <button
                        onClick={() => handlePromoteStatus(selectedNotice, 'archived')}
                        className="px-3 py-1.5 bg-slate-700 text-white rounded font-semibold text-xs hover:bg-slate-800"
                      >
                        Archive Completed Notice
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg"
              >
                Close Notice View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notice Preview Before Publication Modal */}
      {previewNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-amber-400">
            <div className="p-3 bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-between">
              <span>PRE-PUBLICATION PREVIEW (HOW CITIZENS WILL SEE THIS NOTICE)</span>
              <button
                onClick={() => setPreviewNotice(null)}
                className="text-slate-950 font-bold hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center pb-4 border-b border-slate-200">
                <img
                  src={IMAGES.logo}
                  alt="NCDC Official Crest"
                  className="w-16 h-16 object-contain rounded-lg p-0.5 bg-white border border-slate-200 shadow-2xs mx-auto mb-2"
                  referrerPolicy="no-referrer"
                />
                <h3 className="font-bold text-slate-900 text-base">NATIONAL CAPITAL DISTRICT COMMISSION</h3>
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  OFFICIAL CIVIC INFRASTRUCTURE GAZETTE
                </p>
              </div>

              <div>
                <span className="font-mono text-xs font-bold text-slate-500">{previewNotice.id}</span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{previewNotice.title}</h2>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl text-xs space-y-2 text-slate-700">
                <p><strong>Issuing Officer:</strong> {previewNotice.issuingOfficer} ({previewNotice.officerDesignation})</p>
                <p><strong>Corridor:</strong> {previewNotice.corridorSummary}</p>
                <p><strong>Effective:</strong> {previewNotice.effectiveDate} to {previewNotice.expiryDate}</p>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {previewNotice.description}
              </p>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950">
                <strong>Public Advisory:</strong> {previewNotice.publicAdvisory}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => setPreviewNotice(null)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Exit Preview
                </button>
                <button
                  onClick={() => {
                    publishNotice(previewNotice.id);
                    setPreviewNotice(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                >
                  Confirm & Publish Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Draft New Notice Modal */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Draft Official Public Notice</h3>
                <p className="text-xs text-slate-500">Statutory Notice Workflow Formulation</p>
              </div>
              <button
                onClick={() => setShowDraftModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDraft} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Notice Headline</label>
                <input
                  type="text"
                  required
                  value={draftForm.title}
                  onChange={(e) => setDraftForm({ ...draftForm, title: e.target.value })}
                  placeholder="e.g. OFFICIAL NOTICE: Poreporena Freeway Lane Restriction"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Notice Category</label>
                  <select
                    value={draftForm.category}
                    onChange={(e) =>
                      setDraftForm({ ...draftForm, category: e.target.value as NoticeCategory })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="road_closure">Road Closure & Diversion</option>
                    <option value="utility_disruption">Utility Disruption</option>
                    <option value="public_safety">Public Safety Advisory</option>
                    <option value="emergency_works">Emergency Works</option>
                    <option value="heavy_vehicle_restriction">Heavy Vehicle Restriction</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Issuing Department</label>
                  <select
                    value={draftForm.issuingDepartment}
                    onChange={(e) =>
                      setDraftForm({ ...draftForm, issuingDepartment: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Directorate of Engineering & Works">
                      Directorate of Engineering & Works
                    </option>
                    <option value="Traffic Management & Enforcement Division">
                      Traffic Management & Enforcement
                    </option>
                    <option value="Waste Management & Drainage Engineering">
                      Waste Management & Drainage
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Effective Start Date</label>
                  <input
                    type="date"
                    required
                    value={draftForm.effectiveDate}
                    onChange={(e) => setDraftForm({ ...draftForm, effectiveDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={draftForm.expiryDate}
                    onChange={(e) => setDraftForm({ ...draftForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Corridor Summary</label>
                <input
                  type="text"
                  value={draftForm.corridorSummary}
                  onChange={(e) => setDraftForm({ ...draftForm, corridorSummary: e.target.value })}
                  placeholder="e.g. Hubert Murray Highway between Jack Pidik Park and Erima"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Notice Description</label>
                <textarea
                  rows={3}
                  required
                  value={draftForm.description}
                  onChange={(e) => setDraftForm({ ...draftForm, description: e.target.value })}
                  placeholder="Official declaration text outlining statutory reason for roadwork or disruption..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Public Advisory & Detour Route</label>
                <textarea
                  rows={2}
                  value={draftForm.publicAdvisory}
                  onChange={(e) => setDraftForm({ ...draftForm, publicAdvisory: e.target.value })}
                  placeholder="Specific instructions for motorists, speed limits, and alternative roads."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDraftModal(false)}
                  className="px-3.5 py-2 border border-slate-200 bg-white rounded-lg text-slate-700 hover:bg-slate-100 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 text-xs shadow-sm"
                >
                  Save Internal Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
