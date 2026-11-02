import React, { useState, useMemo } from 'react';
import { useInfrastructure } from '../../context/InfrastructureContext';
import { IMAGES, POM_SUBURBS } from '../../data/seedData';
import {
  BarChart3,
  Globe2,
  Wrench,
  Building2,
  Megaphone,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ShieldCheck,
  FileText,
  DollarSign,
  Download,
  Printer,
  ChevronRight,
  HardHat,
  Filter,
  Activity,
  AlertCircle,
  HelpCircle,
  Eye,
  CheckCircle,
  Compass,
  ArrowUpRight
} from 'lucide-react';

type DashboardRoleTab = 'public_info' | 'engineering_ops' | 'management' | 'communications';

export const DashboardsModule: React.FC = () => {
  const {
    roadworks,
    assets,
    notices,
    reports,
    workOrders,
    inspections,
    setActiveTab,
    isStaff
  } = useInfrastructure();

  // Active role dashboard
  const [activeDashboard, setActiveDashboard] = useState<DashboardRoleTab>(
    isStaff ? 'engineering_ops' : 'public_info'
  );

  // Filters
  const [selectedSuburb, setSelectedSuburb] = useState<string>('all');
  const [reportingPeriod, setReportingPeriod] = useState<string>('current_quarter');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Filtered dataset subsets based on selected suburb
  const filteredRoadworks = useMemo(() => {
    return selectedSuburb === 'all'
      ? roadworks
      : roadworks.filter((r) => r.suburb.toLowerCase() === selectedSuburb.toLowerCase());
  }, [roadworks, selectedSuburb]);

  const filteredAssets = useMemo(() => {
    return selectedSuburb === 'all'
      ? assets
      : assets.filter((a) => a.suburb.toLowerCase() === selectedSuburb.toLowerCase());
  }, [assets, selectedSuburb]);

  const filteredReports = useMemo(() => {
    return selectedSuburb === 'all'
      ? reports
      : reports.filter((r) => r.suburb.toLowerCase() === selectedSuburb.toLowerCase());
  }, [reports, selectedSuburb]);

  const filteredWorkOrders = useMemo(() => {
    return selectedSuburb === 'all'
      ? workOrders
      : workOrders.filter((w) => w.suburb.toLowerCase() === selectedSuburb.toLowerCase());
  }, [workOrders, selectedSuburb]);

  const filteredInspections = useMemo(() => {
    return selectedSuburb === 'all'
      ? inspections
      : inspections.filter((i) => i.suburb.toLowerCase() === selectedSuburb.toLowerCase());
  }, [inspections, selectedSuburb]);

  // Current simulation reference date (October 26, 2026)
  const TODAY = '2026-10-26';

  // Overdue inspections: scheduled before today and not completed
  const overdueInspections = useMemo(() => {
    return filteredInspections.filter(
      (ins) => ins.status !== 'completed' && ins.scheduledDate < TODAY
    );
  }, [filteredInspections]);

  // Upcoming inspections: scheduled on or after today
  const upcomingInspections = useMemo(() => {
    return filteredInspections.filter(
      (ins) => ins.status !== 'completed' && ins.scheduledDate >= TODAY
    );
  }, [filteredInspections]);

  // Active vs Upcoming roadworks
  const activeRoadworks = useMemo(() => {
    return filteredRoadworks.filter((r) => r.status === 'active');
  }, [filteredRoadworks]);

  const upcomingRoadworks = useMemo(() => {
    return filteredRoadworks.filter((r) => r.status === 'planned');
  }, [filteredRoadworks]);

  const completedRoadworks = useMemo(() => {
    return filteredRoadworks.filter((r) => r.status === 'completed');
  }, [filteredRoadworks]);

  // Delayed projects: suspended or behind milestone
  const delayedProjects = useMemo(() => {
    return filteredRoadworks.filter((r) => r.status === 'suspended' || (r.status === 'active' && r.progressPct < 40 && r.targetEndDate < '2026-11-15'));
  }, [filteredRoadworks]);

  // Outstanding maintenance tasks
  const outstandingWorkOrders = useMemo(() => {
    return filteredWorkOrders.filter(
      (w) => w.status === 'created' || w.status === 'scheduled' || w.status === 'in_progress' || w.status === 'quality_audit'
    );
  }, [filteredWorkOrders]);

  // Notices awaiting approval: draft or under_review
  const noticesAwaitingApproval = useMemo(() => {
    return notices.filter((n) => n.status === 'draft' || n.status === 'under_review');
  }, [notices]);

  // Asset Condition Distribution (ISO 55001)
  const conditionDistribution = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    filteredAssets.forEach((a) => {
      if (counts[a.condition] !== undefined) {
        counts[a.condition]++;
      }
    });
    const total = filteredAssets.length || 1;
    return {
      counts,
      percentages: {
        1: Math.round((counts[1] / total) * 100),
        2: Math.round((counts[2] / total) * 100),
        3: Math.round((counts[3] / total) * 100),
        4: Math.round((counts[4] / total) * 100),
        5: Math.round((counts[5] / total) * 100),
      },
      total: filteredAssets.length
    };
  }, [filteredAssets]);

  // Public reports distribution by status
  const reportsByStatus = useMemo(() => {
    const counts: Record<string, number> = {
      received: 0,
      triaged: 0,
      inspection_scheduled: 0,
      work_order_created: 0,
      resolved: 0,
      duplicate_merged: 0
    };
    filteredReports.forEach((r) => {
      if (counts[r.status] !== undefined) {
        counts[r.status]++;
      } else {
        counts[r.status] = 1;
      }
    });
    return counts;
  }, [filteredReports]);

  // Financial summary: total maintenance budget PGK
  const totalMaintenanceBudget = useMemo(() => {
    return filteredWorkOrders.reduce((sum, w) => sum + (w.estimatedBudgetPGK || 0), 0);
  }, [filteredWorkOrders]);

  const totalMaintenanceActualCost = useMemo(() => {
    return filteredWorkOrders.reduce((sum, w) => sum + (w.actualCostPGK || 0), 0);
  }, [filteredWorkOrders]);

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ['Metric', 'Category', 'Value', 'Status', 'Demonstration Flag'];
    const rows = [
      ['Active Roadworks', 'Public Info', activeRoadworks.length, 'In Progress', 'Simulated'],
      ['Planned Roadworks', 'Public Info', upcomingRoadworks.length, 'Scheduled', 'Simulated'],
      ['Outstanding Work Orders', 'Engineering', outstandingWorkOrders.length, 'Pending Completion', 'Simulated'],
      ['Overdue Inspections', 'Engineering', overdueInspections.length, 'Immediate Attention', 'Simulated'],
      ['Notices Awaiting Approval', 'Communications', noticesAwaitingApproval.length, 'Under Review', 'Simulated'],
      ['Delayed Projects', 'Management', delayedProjects.length, 'Behind Schedule', 'Simulated'],
      ['Assets Condition 1 (Very Good)', 'Asset Register', conditionDistribution.counts[1], 'Optimal', 'Simulated'],
      ['Assets Condition 2 (Good)', 'Asset Register', conditionDistribution.counts[2], 'Minor Wear', 'Simulated'],
      ['Assets Condition 3 (Fair)', 'Asset Register', conditionDistribution.counts[3], 'Routine Attention', 'Simulated'],
      ['Assets Condition 4 (Poor)', 'Asset Register', conditionDistribution.counts[4], 'Action Required', 'Simulated'],
      ['Assets Condition 5 (Critical)', 'Asset Register', conditionDistribution.counts[5], 'Emergency Intervention', 'Simulated'],
      ['Citizen Defect Reports Received', 'Public Reporting', reportsByStatus.received || 0, 'New Submissions', 'Simulated'],
      ['Citizen Defect Reports Resolved', 'Public Reporting', reportsByStatus.resolved || 0, 'Completed Repairs', 'Simulated'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NCDC_Module6_KPI_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('CSV dataset downloaded successfully.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Module Title & Statutory Header Strip */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <img
              src={IMAGES.logo}
              alt="NCDC Official Crest"
              className="w-12 h-12 object-contain rounded-lg p-0.5 bg-white border border-slate-200 shadow-2xs shrink-0 mt-0.5"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span>National Capital District Commission</span>
                <span aria-hidden="true">·</span>
                <span>Module 6: Dashboards & Reporting</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-amber-700">Port Moresby Urban Analytics</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Municipal Dashboards & Statutory KPI Reporting
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-3xl">
                Integrated executive, engineering, communications, and citizen intelligence platform. Real-time indicators across active roadworks, structural defect triage, overdue asset audits, and gazette publication readiness.
              </p>
            </div>
          </div>

          {/* Quick Actions (Print / CSV) */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-auto">
            <button
              onClick={() => window.print()}
              type="button"
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Print executive dossier for committee review"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Dossier</span>
            </button>
            <button
              onClick={handleExportCSV}
              type="button"
              className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              title="Export all Module 6 indicators to CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Global Demonstration Indicator Banner */}
        <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-center gap-2 font-medium">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>STATUTORY NOTICE:</strong> All figures, condition indices, budgets, and milestones displayed across these dashboards are <strong>simulated demonstration metrics</strong> for architecture evaluation. Statutory risk certifications require physical inspection by registered MIEPNG civil engineers.
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded shrink-0">
            SEED OCTOBER 2026
          </span>
        </div>

        {exportNotice && (
          <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{exportNotice}</span>
          </div>
        )}

        {/* Interactive Filters Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filter District:</span>
            </div>
            <select
              value={selectedSuburb}
              onChange={(e) => setSelectedSuburb(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Port Moresby Suburbs ({assets.length} assets)</option>
              {POM_SUBURBS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={reportingPeriod}
              onChange={(e) => setReportingPeriod(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="current_quarter">Q4 2026 (Current Active Quarter)</option>
              <option value="prior_quarter">Q3 2026 (Audited Period)</option>
              <option value="ytd">Year-to-Date (Jan - Oct 2026)</option>
              <option value="annual_plan">2026-2027 Capital Works Outlook</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span>Active Record Scope:</span>
            <span className="font-mono font-bold text-slate-800">{filteredRoadworks.length} Roadworks</span>
            <span>·</span>
            <span className="font-mono font-bold text-slate-800">{filteredAssets.length} Assets</span>
            <span>·</span>
            <span className="font-mono font-bold text-slate-800">{filteredWorkOrders.length} Work Orders</span>
          </div>
        </div>
      </div>

      {/* DASHBOARD TABS SELECTOR (THE 4 SEPARATE AUDIENCES) */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-2 pt-2 gap-1 overflow-x-auto shadow-2xs">
        <button
          onClick={() => setActiveDashboard('public_info')}
          type="button"
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeDashboard === 'public_info'
              ? 'border-amber-500 text-amber-900 bg-amber-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <Globe2 className="w-4 h-4 text-amber-600" />
          <span>1. Public Information Dashboard</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
            Citizen Facing
          </span>
        </button>

        <button
          onClick={() => setActiveDashboard('engineering_ops')}
          type="button"
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeDashboard === 'engineering_ops'
              ? 'border-amber-500 text-amber-900 bg-amber-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <Wrench className="w-4 h-4 text-sky-600" />
          <span>2. Engineering Operations</span>
          {overdueInspections.length > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
              {overdueInspections.length} overdue
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveDashboard('management')}
          type="button"
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeDashboard === 'management'
              ? 'border-amber-500 text-amber-900 bg-amber-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>3. Executive & Management</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
            ISO 55001
          </span>
        </button>

        <button
          onClick={() => setActiveDashboard('communications')}
          type="button"
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeDashboard === 'communications'
              ? 'border-amber-500 text-amber-900 bg-amber-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <Megaphone className="w-4 h-4 text-purple-600" />
          <span>4. Communications & Gazetting</span>
          {noticesAwaitingApproval.length > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
              {noticesAwaitingApproval.length} pending
            </span>
          )}
        </button>
      </div>

      {/* DASHBOARD 1: PUBLIC INFORMATION DASHBOARD */}
      {activeDashboard === 'public_info' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => setActiveTab('roadworks')}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold text-slate-700">Active Roadworks</span>
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                  <Activity className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{activeRoadworks.length}</span>
                <span className="text-xs text-amber-700 font-medium">Corridors Under Construction</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 group-hover:text-amber-700">
                <span>View Live Roadworks Cartography</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </p>
            </div>

            <div
              onClick={() => setActiveTab('roadworks')}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold text-slate-700">Upcoming Planned Works</span>
                <span className="p-1.5 rounded-lg bg-sky-100 text-sky-800">
                  <Calendar className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{upcomingRoadworks.length}</span>
                <span className="text-xs text-sky-700 font-medium">Commencing in 30 Days</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 group-hover:text-sky-700">
                <span>Check Corridor Schedules & Detours</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </p>
            </div>

            <div
              onClick={() => setActiveTab('report')}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold text-slate-700">Citizen Reports Resolved</span>
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-700">{reportsByStatus.resolved || 0}</span>
                <span className="text-xs text-slate-500 font-medium">of {filteredReports.length} Submitted</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 group-hover:text-emerald-700">
                <span>Track or Log Infrastructure Defect</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </p>
            </div>

            <div
              onClick={() => setActiveTab('notices')}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold text-slate-700">Official Gazetted Notices</span>
                <span className="p-1.5 rounded-lg bg-purple-100 text-purple-800">
                  <FileText className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  {notices.filter((n) => n.status === 'published').length}
                </span>
                <span className="text-xs text-purple-700 font-medium">Active Public Gazettes</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 group-hover:text-purple-700">
                <span>Read Official Road Closure Orders</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </p>
            </div>
          </div>

          {/* Public Traffic Impact & Live Roadworks Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Active Roadworks Travel Advisories ({activeRoadworks.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time speed advisories and contractor details for Port Moresby commuters
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('roadworks')}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                >
                  <span>Open GIS Map</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {activeRoadworks.map((rw) => (
                  <div
                    key={rw.id}
                    onClick={() => setActiveTab('roadworks')}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-amber-400 hover:bg-amber-50/30 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{rw.id}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-bold text-slate-800">{rw.suburb}</span>
                        <span aria-hidden="true">·</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                          {rw.impact.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-900 text-sm">{rw.title}</h4>
                      <p className="text-slate-600 text-xs">{rw.detourInfo}</p>
                    </div>

                    <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-1">
                      <span className="text-[11px] text-slate-500">Speed Limit:</span>
                      <span className="font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        {rw.recommendedSpeedKmh} KM/H
                      </span>
                      <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${rw.progressPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{rw.progressPct}% Progress</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Citizen Reporting Resolution Funnel */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Citizen Report Resolution Funnel</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Transparency breakdown of {filteredReports.length} public defect reports
                </p>

                <div className="space-y-3 mt-4 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>1. Reports Received</span>
                      <span className="font-mono">{reportsByStatus.received || 0}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>2. Triaged & Verified by Staff</span>
                      <span className="font-mono">{reportsByStatus.triaged || 0}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>3. Inspection Scheduled</span>
                      <span className="font-mono">{reportsByStatus.inspection_scheduled || 0}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: '50%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>4. Repair Work Order Dispatched</span>
                      <span className="font-mono">{reportsByStatus.work_order_created || 0}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: '38%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-emerald-800 mb-1">
                      <span>5. Civil Defect Resolved</span>
                      <span className="font-mono font-bold">{reportsByStatus.resolved || 0}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '25%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 mt-4">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>NCDC Service Level Target</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Average response time for arterial potholes: <strong>72 hours</strong>. Drainage blockages during wet season: <strong>24-48 hours</strong>.
                </p>
                <button
                  onClick={() => setActiveTab('report')}
                  className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors text-center block mt-1"
                >
                  Report a Defect on Your Street
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD 2: ENGINEERING OPERATIONS DASHBOARD */}
      {activeDashboard === 'engineering_ops' && (
        <div className="space-y-6">
          {/* Engineering Ops Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => setActiveTab('operations')}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold text-slate-700">Outstanding Maintenance Tasks</span>
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                  <Wrench className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  {outstandingWorkOrders.length}
                </span>
                <span className="text-xs text-amber-700 font-medium">Work Orders Active / Scheduled</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 group-hover:text-amber-700">
                <span>Inspect Crew Assignments</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </p>
            </div>

            <div
              onClick={() => setActiveTab('operations')}
              className={`p-5 rounded-xl border shadow-2xs transition-all cursor-pointer group ${
                overdueInspections.length > 0
                  ? 'bg-rose-50/50 border-rose-300 hover:border-rose-400'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold text-rose-800">Overdue Structural Inspections</span>
                <span className="p-1.5 rounded-lg bg-rose-100 text-rose-800">
                  <AlertTriangle className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-rose-700">
                  {overdueInspections.length}
                </span>
                <span className="text-xs text-rose-800 font-medium">Lapsed Audit Dates</span>
              </div>
              <p className="text-[11px] text-rose-700 mt-2 flex items-center gap-1 font-semibold">
                <span>Immediate Field Dispatch Required</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </p>
            </div>

            <div
              onClick={() => setActiveTab('operations')}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold text-slate-700">Upcoming Scheduled Audits</span>
                <span className="p-1.5 rounded-lg bg-sky-100 text-sky-800">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  {upcomingInspections.length}
                </span>
                <span className="text-xs text-sky-700 font-medium">Within Next 14 Days</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 group-hover:text-sky-700">
                <span>View Assigned Inspectors</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </p>
            </div>

            <div
              onClick={() => setActiveTab('operations')}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold text-slate-700">Committed Maintenance Budget</span>
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-mono font-bold text-slate-500">PGK</span>
                <span className="text-2xl font-extrabold text-slate-900">
                  {(totalMaintenanceBudget / 1000000).toFixed(2)}M
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 group-hover:text-emerald-700">
                <span>PGK {(totalMaintenanceActualCost / 1000000).toFixed(2)}M Expended</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </p>
            </div>
          </div>

          {/* Overdue Inspections & Critical Outstanding Tasks Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overdue Structural Inspections Alert Box */}
            <div className="bg-white rounded-xl border border-rose-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Overdue Structural Inspections</h3>
                    <p className="text-xs text-slate-500">Mandatory statutory assessments past target date</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-mono font-bold text-xs rounded-full">
                  {overdueInspections.length} Overdue
                </span>
              </div>

              <div className="space-y-3">
                {overdueInspections.map((ins) => (
                  <div
                    key={ins.id}
                    onClick={() => setActiveTab('operations')}
                    className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-200 hover:bg-rose-100/40 transition-colors cursor-pointer text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="font-bold text-rose-900">{ins.id}</span>
                      <span className="text-rose-700 font-semibold">Scheduled Date: {ins.scheduledDate}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs">{ins.assetName}</h4>
                    <div className="flex items-center justify-between text-slate-600 text-[11px]">
                      <span>Type: {ins.inspectionType.replace('_', ' ')}</span>
                      <span>Inspector: {ins.inspectorName}</span>
                    </div>
                  </div>
                ))}

                {overdueInspections.length === 0 && (
                  <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                    <p className="font-semibold text-slate-800">All Scheduled Inspections Are Up to Date</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">No overdue structural assessments in current filter scope.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Outstanding Maintenance Tasks by Priority */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Outstanding Maintenance Tasks ({outstandingWorkOrders.length})
                  </h3>
                  <p className="text-xs text-slate-500">Prioritized by NCDC Risk-Matrix Composite Score</p>
                </div>
                <button
                  onClick={() => setActiveTab('operations')}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                >
                  <span>Dispatch New Order</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {outstandingWorkOrders.map((wo) => {
                  const isCritical = wo.priority === 'critical_urgent';
                  const isHigh = wo.priority === 'high';

                  return (
                    <div
                      key={wo.id}
                      onClick={() => setActiveTab('operations')}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-amber-400 transition-all cursor-pointer text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{wo.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isCritical
                                ? 'bg-rose-100 text-rose-800'
                                : isHigh
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {wo.priority.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <span className="font-mono text-slate-500 font-semibold">
                          Score: {wo.riskEvaluation.compositeScore}/20
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900">{wo.title}</h4>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200/50">
                        <span>Crew: {wo.assignedTeam}</span>
                        <span className="text-right font-mono font-semibold text-slate-800">
                          PGK {wo.estimatedBudgetPGK?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD 3: EXECUTIVE & MANAGEMENT DASHBOARD */}
      {activeDashboard === 'management' && (
        <div className="space-y-6">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block mb-1">
                Total Registered Municipal Assets
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{filteredAssets.length}</span>
                <span className="text-xs text-emerald-700 font-semibold">ISO 55001 Compliant</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Port Moresby Urban Infrastructure Register
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block mb-1">
                Asset Health Index (Good/Fair)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  {conditionDistribution.percentages[1] + conditionDistribution.percentages[2] + conditionDistribution.percentages[3]}%
                </span>
                <span className="text-xs text-sky-700 font-semibold">Grades 1 to 3</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {conditionDistribution.counts[4] + conditionDistribution.counts[5]} assets require urgent intervention
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block mb-1">
                Delayed / Suspended Capital Works
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-extrabold ${delayedProjects.length > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                  {delayedProjects.length}
                </span>
                <span className="text-xs text-amber-700 font-semibold">Variance Review Active</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Pending utility relocation or weather pause
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block mb-1">
                Capital Maintenance Allocation
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-mono font-bold text-slate-400">PGK</span>
                <span className="text-3xl font-extrabold text-slate-900">
                  {(totalMaintenanceBudget / 1000000).toFixed(1)}M
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Approved by NCDC Board of Works
              </p>
            </div>
          </div>

          {/* ASSET CONDITION DISTRIBUTION (ISO 55001 STANDARDS) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Municipal Asset Condition Distribution (ISO 55001 Benchmark)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Five-tier physical asset rating across Port Moresby roads, culverts, bridges, and signals ({conditionDistribution.total} assets)
                </p>
              </div>

              <button
                onClick={() => setActiveTab('assets')}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Open Asset Register</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Horizontal Stacked Condition Bar */}
            <div className="w-full h-8 rounded-lg overflow-hidden flex bg-slate-100 shadow-inner">
              <div
                className="bg-emerald-600 h-full transition-all flex items-center justify-center text-[11px] font-bold text-white"
                style={{ width: `${conditionDistribution.percentages[1]}%` }}
                title={`Grade 1 (Very Good): ${conditionDistribution.counts[1]} assets (${conditionDistribution.percentages[1]}%)`}
              >
                {conditionDistribution.percentages[1] > 8 ? `${conditionDistribution.percentages[1]}%` : ''}
              </div>
              <div
                className="bg-emerald-400 h-full transition-all flex items-center justify-center text-[11px] font-bold text-emerald-950"
                style={{ width: `${conditionDistribution.percentages[2]}%` }}
                title={`Grade 2 (Good): ${conditionDistribution.counts[2]} assets (${conditionDistribution.percentages[2]}%)`}
              >
                {conditionDistribution.percentages[2] > 8 ? `${conditionDistribution.percentages[2]}%` : ''}
              </div>
              <div
                className="bg-amber-400 h-full transition-all flex items-center justify-center text-[11px] font-bold text-amber-950"
                style={{ width: `${conditionDistribution.percentages[3]}%` }}
                title={`Grade 3 (Fair): ${conditionDistribution.counts[3]} assets (${conditionDistribution.percentages[3]}%)`}
              >
                {conditionDistribution.percentages[3] > 8 ? `${conditionDistribution.percentages[3]}%` : ''}
              </div>
              <div
                className="bg-orange-500 h-full transition-all flex items-center justify-center text-[11px] font-bold text-white"
                style={{ width: `${conditionDistribution.percentages[4]}%` }}
                title={`Grade 4 (Poor): ${conditionDistribution.counts[4]} assets (${conditionDistribution.percentages[4]}%)`}
              >
                {conditionDistribution.percentages[4] > 8 ? `${conditionDistribution.percentages[4]}%` : ''}
              </div>
              <div
                className="bg-rose-600 h-full transition-all flex items-center justify-center text-[11px] font-bold text-white"
                style={{ width: `${conditionDistribution.percentages[5]}%` }}
                title={`Grade 5 (Critical/Failed): ${conditionDistribution.counts[5]} assets (${conditionDistribution.percentages[5]}%)`}
              >
                {conditionDistribution.percentages[5] > 8 ? `${conditionDistribution.percentages[5]}%` : ''}
              </div>
            </div>

            {/* Detailed Breakdown Legend & Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs pt-2">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                  <span>Grade 1: Very Good</span>
                </div>
                <div className="flex items-baseline justify-between mt-2 font-mono">
                  <span className="text-lg font-bold text-emerald-950">{conditionDistribution.counts[1]} Assets</span>
                  <span className="text-emerald-700 font-semibold">{conditionDistribution.percentages[1]}%</span>
                </div>
                <p className="text-[10px] text-emerald-800 mt-1">Recently constructed; no defect maintenance needed.</p>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/70">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>Grade 2: Good</span>
                </div>
                <div className="flex items-baseline justify-between mt-2 font-mono">
                  <span className="text-lg font-bold text-emerald-950">{conditionDistribution.counts[2]} Assets</span>
                  <span className="text-emerald-700 font-semibold">{conditionDistribution.percentages[2]}%</span>
                </div>
                <p className="text-[10px] text-emerald-800 mt-1">Minor surface wear; routine cyclic inspection.</p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                  <span>Grade 3: Fair</span>
                </div>
                <div className="flex items-baseline justify-between mt-2 font-mono">
                  <span className="text-lg font-bold text-amber-950">{conditionDistribution.counts[3]} Assets</span>
                  <span className="text-amber-800 font-semibold">{conditionDistribution.percentages[3]}%</span>
                </div>
                <p className="text-[10px] text-amber-800 mt-1">Moderate deterioration; planned resealing program.</p>
              </div>

              <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
                <div className="flex items-center gap-1.5 font-bold text-orange-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                  <span>Grade 4: Poor</span>
                </div>
                <div className="flex items-baseline justify-between mt-2 font-mono">
                  <span className="text-lg font-bold text-orange-950">{conditionDistribution.counts[4]} Assets</span>
                  <span className="text-orange-800 font-semibold">{conditionDistribution.percentages[4]}%</span>
                </div>
                <p className="text-[10px] text-orange-800 mt-1">Structural wear; prioritized work order required.</p>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                <div className="flex items-center gap-1.5 font-bold text-rose-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
                  <span>Grade 5: Critical</span>
                </div>
                <div className="flex items-baseline justify-between mt-2 font-mono">
                  <span className="text-lg font-bold text-rose-950">{conditionDistribution.counts[5]} Assets</span>
                  <span className="text-rose-800 font-semibold">{conditionDistribution.percentages[5]}%</span>
                </div>
                <p className="text-[10px] text-rose-800 mt-1">Imminent safety hazard; emergency reconstruction.</p>
              </div>
            </div>
          </div>

          {/* DELAYED PROJECTS AND UPCOMING CAPITAL MILESTONES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Delayed Projects & Variance Audit ({delayedProjects.length})
                  </h3>
                  <p className="text-xs text-slate-500">Major infrastructure projects exceeding scheduled timeline</p>
                </div>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-xs rounded">
                  Executive Review
                </span>
              </div>

              <div className="space-y-3">
                {delayedProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setActiveTab('roadworks')}
                    className="p-4 bg-amber-50/40 rounded-xl border border-amber-200 hover:border-amber-400 transition-all cursor-pointer text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900">{p.id}</span>
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold uppercase text-[10px]">
                        {p.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">{p.title}</h4>
                    <p className="text-slate-600">{p.description}</p>

                    <div className="p-2.5 bg-white rounded-lg border border-amber-200/80 text-[11px] space-y-1">
                      <div className="flex justify-between text-slate-700">
                        <span>Executing Contractor:</span>
                        <strong className="text-slate-900">{p.contractor}</strong>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Milestone Delay Reason:</span>
                        <span className="text-amber-800 font-medium">Relocation of underground fibre optic conduit</span>
                      </div>
                      <div className="flex justify-between text-slate-700 font-mono">
                        <span>Scheduled Handover:</span>
                        <span className="text-rose-700 font-bold">{p.targetEndDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Capital Milestones & Target Handovers */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upcoming Milestone Schedule</h3>
                  <p className="text-xs text-slate-500">Scheduled commissioning dates for active works</p>
                </div>
                <span className="text-xs font-mono font-semibold text-slate-500">Q4 2026 Schedule</span>
              </div>

              <div className="space-y-3 text-xs">
                {filteredRoadworks
                  .filter((r) => r.status === 'active' || r.status === 'planned')
                  .slice(0, 4)
                  .map((r) => (
                    <div
                      key={r.id}
                      onClick={() => setActiveTab('roadworks')}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{r.road} ({r.suburb})</span>
                        <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          Due: {r.targetEndDate}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-1">{r.title}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${r.progressPct}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-slate-800">{r.progressPct}%</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD 4: COMMUNICATIONS & GAZETTING DASHBOARD */}
      {activeDashboard === 'communications' && (
        <div className="space-y-6">
          {/* Communications Top Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => setActiveTab('notices')}
              className={`p-5 rounded-xl border shadow-2xs transition-all cursor-pointer group ${
                noticesAwaitingApproval.length > 0
                  ? 'bg-amber-50/50 border-amber-300 hover:border-amber-400'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold text-amber-900">Notices Awaiting Clearance</span>
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                  <FileText className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-900">
                  {noticesAwaitingApproval.length}
                </span>
                <span className="text-xs text-amber-700 font-medium">Draft & Under Review</span>
              </div>
              <p className="text-[11px] text-amber-800 mt-2 flex items-center gap-1 font-semibold">
                <span>Directorate Approval Required</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </p>
            </div>

            <div
              onClick={() => setActiveTab('notices')}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold text-slate-700">Published Gazette Notices</span>
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-700">
                  {notices.filter((n) => n.status === 'published').length}
                </span>
                <span className="text-xs text-emerald-700 font-medium">Active in Public Feed</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 group-hover:text-emerald-700">
                <span>View Gazetted Bulletins</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </p>
            </div>

            <div
              onClick={() => setActiveTab('report')}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold text-slate-700">Civic Defect Submissions</span>
                <span className="p-1.5 rounded-lg bg-purple-100 text-purple-800">
                  <Megaphone className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{filteredReports.length}</span>
                <span className="text-xs text-purple-700 font-medium">Logged This Period</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 group-hover:text-purple-700">
                <span>Open Public Triage Queue</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block mb-1">
                Citizen Triage Verification Rate
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">84.2%</span>
                <span className="text-xs text-emerald-700 font-semibold">Valid Defects</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                15.8% merged duplicates or non-municipal
              </p>
            </div>
          </div>

          {/* Notices Awaiting Approval Queue & Public Advisory Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notices Awaiting Clearance Detail Box */}
            <div className="bg-white rounded-xl border border-amber-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Notices Awaiting Statutory Approval ({noticesAwaitingApproval.length})
                    </h3>
                    <p className="text-xs text-slate-500">Clearance pipeline before public portal dissemination</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('notices')}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                >
                  <span>Review in Module 3</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {noticesAwaitingApproval.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => setActiveTab('notices')}
                    className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 hover:bg-amber-100/40 transition-colors cursor-pointer text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="font-bold text-amber-900">{n.id}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 font-bold uppercase text-[10px]">
                        {n.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">{n.corridorSummary}</p>

                    <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Issuing Officer: <strong>{n.issuingOfficer}</strong></span>
                      <span className="font-mono">{n.effectiveDate}</span>
                    </div>
                  </div>
                ))}

                {noticesAwaitingApproval.length === 0 && (
                  <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                    <p className="font-semibold text-slate-800">All Notices Have Been Approved or Published</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">No unreviewed public notices in current queue.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Public Communications & Community Hotspots */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Community Reporting Hotspots</h3>
                  <p className="text-xs text-slate-500">Suburbs with highest citizen defect submissions</p>
                </div>
                <span className="text-xs font-mono text-slate-400">NCDC GIS Telemetry</span>
              </div>

              <div className="space-y-3 text-xs">
                {['Hohola', 'Waigani', 'Boroko', 'Gerehu', 'Gordons'].map((suburbName, index) => {
                  const suburbReportCount = reports.filter((r) => r.suburb.toLowerCase() === suburbName.toLowerCase()).length;
                  const pct = Math.min(100, Math.max(15, suburbReportCount * 30));

                  return (
                    <div key={suburbName} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold font-mono text-[11px] flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="font-bold text-slate-800">{suburbName}</span>
                        </div>
                        <span className="font-mono font-bold text-amber-700">
                          {suburbReportCount} Reports
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-950 space-y-1 mt-4">
                <span className="font-bold block">Press Release & Radio Advisory Readiness</span>
                <p className="text-[11px] text-purple-900">
                  Approved notices for Poreporena Freeway and Hubert Murray Highway are pre-formatted for broadcast over NBC PNG and commercial radio networks before morning peak traffic.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
