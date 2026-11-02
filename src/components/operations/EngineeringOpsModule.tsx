import React, { useState, useMemo } from 'react';
import { useInfrastructure } from '../../context/InfrastructureContext';
import {
  MaintenanceWorkOrder,
  WorkOrderStatus,
  RiskPriorityLevel,
  RiskEvaluationMatrix,
  InspectionScheduleItem,
  WorkOrderCompletion
} from '../../types/infrastructure';
import { POM_SUBURBS, IMAGES } from '../../data/seedData';
import {
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  FileCheck,
  UserCheck,
  Plus,
  Layers,
  ArrowRight,
  Calculator,
  HardHat,
  Search,
  Filter,
  DollarSign,
  FileText,
  Camera,
  X
} from 'lucide-react';

export const EngineeringOpsModule: React.FC = () => {
  const {
    workOrders,
    inspections,
    assets,
    roadworks,
    reports,
    createWorkOrder,
    updateWorkOrderStatus,
    completeWorkOrder,
    scheduleInspection,
    currentUser,
    isStaff
  } = useInfrastructure();

  // Sub-tabs: 'work_orders' | 'inspections' | 'risk_framework' | 'completion_audit'
  const [activeOpsTab, setActiveOpsTab] = useState<'work_orders' | 'inspections' | 'risk_framework'>(
    'work_orders'
  );

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<MaintenanceWorkOrder | null>(null);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // New Work Order Form State
  const [orderForm, setOrderForm] = useState({
    title: '',
    assetId: assets[0]?.id || '',
    suburb: 'Waigani',
    assignedTeam: 'NCDC Civil Works Rapid Maintenance Crew #1',
    supervisingEngineer: currentUser.name,
    scheduledStartDate: new Date().toISOString().split('T')[0],
    targetCompletionDate: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
    estimatedBudgetPGK: 350000,
    materialsStr: 'Dense Graded Asphalt, Cement Stabilized Base, Bitumen Tack Coat',
    scopeOfWork: '',
    // Risk Matrix Criteria
    trafficScore: 4,
    structuralScore: 4,
    safetyScore: 4,
    assetCriticality: 4,
    engineeringJustification: '',
  });

  // Schedule Inspection Form State
  const [inspectionForm, setInspectionForm] = useState({
    assetId: assets[0]?.id || '',
    suburb: 'Hohola',
    inspectionType: 'routine_condition' as InspectionScheduleItem['inspectionType'],
    scheduledDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    inspectorName: currentUser.name,
    priority: 'medium' as InspectionScheduleItem['priority'],
  });

  // Completion Evidence Form State
  const [completionForm, setCompletionForm] = useState({
    certifiedBy: currentUser.name,
    engineerRegistrationNo: 'PNG-R.ENG-0482',
    remarks: 'Pavement depth, asphalt compaction, and hydraulic cross-fall verified compliant with NCDC Standard Specifications for Civil Engineering Works.',
    testedCompliance: true,
  });

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return workOrders.filter((order) => {
      const matchesSearch =
        searchQuery === '' ||
        order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.suburb.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [workOrders, searchQuery, priorityFilter, statusFilter]);

  // Priority Level Visual Helpers
  const renderPriorityBadge = (priority: RiskPriorityLevel) => {
    switch (priority) {
      case 'critical_urgent':
        return (
          <span className="text-rose-700 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span> Critical Urgent
          </span>
        );
      case 'high':
        return (
          <span className="text-orange-700 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-600"></span> High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="text-amber-700 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium
          </span>
        );
      case 'routine':
        return (
          <span className="text-slate-600 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span> Routine
          </span>
        );
    }
  };

  const renderStatusBadge = (status: WorkOrderStatus) => {
    switch (status) {
      case 'in_progress':
        return <span className="text-amber-700 font-bold">In Progress</span>;
      case 'scheduled':
        return <span className="text-sky-700 font-semibold">Scheduled</span>;
      case 'created':
        return <span className="text-slate-600 font-medium">Created</span>;
      case 'quality_audit':
        return <span className="text-purple-700 font-semibold">Quality Audit</span>;
      case 'completed':
        return <span className="text-emerald-700 font-bold">Completed & Certified</span>;
    }
  };

  // Calculate composite risk score
  const calculateCompositeRisk = (
    traffic: number,
    structural: number,
    safety: number,
    criticality: number
  ): { score: number; level: RiskPriorityLevel } => {
    const score = traffic + structural + safety + criticality;
    let level: RiskPriorityLevel = 'routine';
    if (score >= 18) level = 'critical_urgent';
    else if (score >= 14) level = 'high';
    else if (score >= 9) level = 'medium';
    return { score, level };
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find((a) => a.id === orderForm.assetId) || assets[0];
    const { score, level } = calculateCompositeRisk(
      orderForm.trafficScore,
      orderForm.structuralScore,
      orderForm.safetyScore,
      orderForm.assetCriticality
    );

    const riskEval: RiskEvaluationMatrix = {
      trafficScore: orderForm.trafficScore,
      structuralScore: orderForm.structuralScore,
      safetyScore: orderForm.safetyScore,
      assetCriticality: orderForm.assetCriticality,
      compositeScore: score,
      riskLevel: level,
      engineeringJustification:
        orderForm.engineeringJustification ||
        `Pavement structural risk assessed at ${score}/20 based on arterial traffic and observed deterioration.`,
      evaluatedByEngineer: currentUser.name,
      evaluationTimestamp: new Date().toISOString(),
    };

    createWorkOrder({
      title: orderForm.title,
      assetId: asset.id,
      assetName: asset.name,
      suburb: orderForm.suburb,
      coordinates: asset.coordinates,
      priority: level,
      riskEvaluation: riskEval,
      assignedTeam: orderForm.assignedTeam,
      supervisingEngineer: orderForm.supervisingEngineer,
      scheduledStartDate: orderForm.scheduledStartDate,
      targetCompletionDate: orderForm.targetCompletionDate,
      status: 'scheduled',
      estimatedBudgetPGK: Number(orderForm.estimatedBudgetPGK),
      materialsRequired: orderForm.materialsStr.split(',').map((s) => s.trim()),
      scopeOfWork: orderForm.scopeOfWork || 'Execute standard civil engineering restoration.',
    });

    setShowCreateOrderModal(false);
  };

  const handleScheduleInspectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find((a) => a.id === inspectionForm.assetId) || assets[0];
    scheduleInspection({
      assetId: asset.id,
      assetName: asset.name,
      suburb: inspectionForm.suburb,
      inspectionType: inspectionForm.inspectionType,
      scheduledDate: inspectionForm.scheduledDate,
      inspectorName: inspectionForm.inspectorName,
      status: 'pending',
      priority: inspectionForm.priority,
    });
    setShowScheduleModal(false);
  };

  const handleCompleteOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    completeWorkOrder(selectedOrder.id, {
      completionDate: new Date().toISOString().split('T')[0],
      certifiedBy: completionForm.certifiedBy,
      engineerRegistrationNo: completionForm.engineerRegistrationNo,
      remarks: completionForm.remarks,
      testedCompliance: completionForm.testedCompliance,
      beforePhotoUrl: IMAGES.inspection,
      afterPhotoUrl: IMAGES.hero,
    });

    setSelectedOrder({
      ...selectedOrder,
      status: 'completed',
      completionEvidence: {
        completionDate: new Date().toISOString().split('T')[0],
        certifiedBy: completionForm.certifiedBy,
        engineerRegistrationNo: completionForm.engineerRegistrationNo,
        remarks: completionForm.remarks,
        testedCompliance: completionForm.testedCompliance,
        beforePhotoUrl: IMAGES.inspection,
        afterPhotoUrl: IMAGES.hero,
      },
    });

    setShowCompletionModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Statutory Human Governance Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>National Capital District Commission</span>
              <span aria-hidden="true">·</span>
              <span>Module 5: Engineering Operations & Risk Framework</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-amber-700">MIEPNG Certified Governance</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Civil Works & Asset Operations Control
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Centralized engineering operations console for maintenance work order dispatch, defect resolution, statutory inspection scheduling, and human-in-the-loop risk prioritization.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setShowScheduleModal(true)}
              type="button"
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <span>Schedule Inspection</span>
            </button>
            <button
              onClick={() => setShowCreateOrderModal(true)}
              type="button"
              className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Work Order</span>
            </button>
          </div>
        </div>

        {/* STATUTORY ETHICAL GOVERNANCE NOTICE */}
        <div className="p-3.5 bg-slate-900 text-white rounded-xl text-xs flex items-center justify-between gap-3 border border-slate-800">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-[11px] text-slate-200 leading-normal">
              <strong className="text-amber-400">Statutory Human Review Mandate:</strong> In accordance with NCDC municipal governance standards, risk priority scores and engineering certifications require human sign-off by a registered professional engineer (MIEPNG). Automated algorithms and AI models do not certify safety or make autonomous financial or statutory determinations.
            </p>
          </div>
          <span className="font-mono text-[10px] text-slate-400 shrink-0 hidden sm:inline">
            POLICY #ENG-ETHICS-26
          </span>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveOpsTab('work_orders')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeOpsTab === 'work_orders'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Maintenance Work Orders ({workOrders.length})
          </button>
          <button
            onClick={() => setActiveOpsTab('inspections')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeOpsTab === 'inspections'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Inspection Schedule ({inspections.length})
          </button>
          <button
            onClick={() => setActiveOpsTab('risk_framework')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeOpsTab === 'risk_framework'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Configurable Risk Matrix
          </button>
        </div>
      </div>

      {/* VIEW 1: WORK ORDERS LIST */}
      {activeOpsTab === 'work_orders' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search MWO ID, asset, suburb..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Priorities</option>
                <option value="critical_urgent">Critical Urgent (Score 18-20)</option>
                <option value="high">High Priority (Score 14-17)</option>
                <option value="medium">Medium Priority (Score 9-13)</option>
                <option value="routine">Routine (Score &lt;= 8)</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Order Statuses</option>
                <option value="in_progress">In Progress</option>
                <option value="scheduled">Scheduled</option>
                <option value="created">Created</option>
                <option value="completed">Completed & Certified</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Work Order & Asset</th>
                    <th className="px-4 py-3">Risk Level & Score</th>
                    <th className="px-4 py-3">Assigned Team</th>
                    <th className="px-4 py-3">Budget (PGK)</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-slate-900">{order.id}</span>
                        <p className="font-semibold text-slate-800 mt-0.5">{order.title}</p>
                        <span className="text-[11px] text-slate-500">
                          {order.assetName} ({order.suburb})
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {renderPriorityBadge(order.priority)}
                        <span className="font-mono text-[11px] text-slate-500 block mt-0.5">
                          Score: {order.riskEvaluation.compositeScore}/20
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800">{order.assignedTeam}</span>
                        <span className="text-[11px] text-slate-400 block">
                          Sup: {order.supervisingEngineer}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                        PGK {order.estimatedBudgetPGK.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {order.targetCompletionDate}
                      </td>
                      <td className="px-4 py-3">{renderStatusBadge(order.status)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1 bg-slate-100 text-slate-800 hover:bg-amber-500 hover:text-slate-950 font-bold rounded transition-colors whitespace-nowrap"
                        >
                          Manage Order
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: INSPECTIONS SCHEDULE */}
      {activeOpsTab === 'inspections' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Municipal Asset Inspection Calendar</h3>
              <p className="text-xs text-slate-500">
                Scheduled visual assessments, post-rain stormwater surveys, and citizen report verifications.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Schedule ID & Type</th>
                  <th className="px-4 py-3">Target Asset</th>
                  <th className="px-4 py-3">Suburb</th>
                  <th className="px-4 py-3">Scheduled Date</th>
                  <th className="px-4 py-3">Assigned Inspector</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {inspections.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-slate-900">{item.id}</span>
                      <p className="font-medium text-slate-800 capitalize">
                        {item.inspectionType.replace('_', ' ')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800">{item.assetName}</span>
                      <span className="font-mono text-[11px] text-slate-400 block">{item.assetId}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{item.suburb}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                      {item.scheduledDate}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{item.inspectorName}</td>
                    <td className="px-4 py-3 capitalize font-bold text-slate-800">{item.priority}</td>
                    <td className="px-4 py-3 capitalize font-medium text-amber-700">
                      {item.status.replace('_', ' ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: CONFIGURABLE RISK MATRIX EXPLANATION & AUDIT */}
      {activeOpsTab === 'risk_framework' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-600" />
              <span>NCDC Transparent Risk-Priority Matrix</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every maintenance order and structural defect is scored by municipal engineers across 4 objective criteria (1 to 5 scale), resulting in an aggregated composite score of up to 20 points.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-900 block">1. Traffic Volume (Weight: 1-5)</span>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  5 = Major arterial expressway (Poreporena / Hubert Murray, &gt;30,000 AADT) · 1 = Minor residential lane
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-900 block">2. Structural Deterioration (Weight: 1-5)</span>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  5 = Imminent culvert or bridge collapse, sinkholes · 1 = Superficial surface wear
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-900 block">3. Safety & Collision Hazard (Weight: 1-5)</span>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  5 = Severe pedestrian or high-speed vehicle impact risk · 1 = Minor speed damping
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-900 block">4. Asset Criticality (Weight: 1-5)</span>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  5 = Single point of failure for airport transit or hospital access · 1 = Readily bypassed
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Priority Threshold Breakdown</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-950">
                <div className="flex items-center justify-between font-bold">
                  <span>CRITICAL URGENT (18 - 20 PTS)</span>
                  <span className="font-mono">Immediate 24hr Dispatch</span>
                </div>
                <p className="text-[11px] text-rose-900 mt-1">
                  Active sinkholes, collapsed drainage box culverts, broken bridge joints on arterial corridors. Requires immediate traffic diversion.
                </p>
              </div>

              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-950">
                <div className="flex items-center justify-between font-bold">
                  <span>HIGH PRIORITY (14 - 17 PTS)</span>
                  <span className="font-mono">72hr Response Target</span>
                </div>
                <p className="text-[11px] text-orange-900 mt-1">
                  Major canal desilting, deep potholes on bus routes, damaged pedestrian overpass handrails.
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-950">
                <div className="flex items-center justify-between font-bold">
                  <span>MEDIUM PRIORITY (9 - 13 PTS)</span>
                  <span className="font-mono">14-Day Maintenance Window</span>
                </div>
                <p className="text-[11px] text-amber-900 mt-1">
                  Routine scheduled resealing, non-critical traffic light loop adjustments, kerb realignments.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
                <div className="flex items-center justify-between font-bold">
                  <span>ROUTINE (≤ 8 PTS)</span>
                  <span className="font-mono">Quarterly Program</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Vegetation clearing along road servitude, touch-up thermo-plastic striping.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE WORK ORDER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Header */}
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
                    <span className="font-mono font-bold text-slate-900">{selectedOrder.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedOrder.suburb}</span>
                    <span aria-hidden="true">·</span>
                    <div>{renderPriorityBadge(selectedOrder.priority)}</div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {selectedOrder.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 text-xs text-slate-700">
              {/* Risk Evaluation Breakdown */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs">Certified Engineering Risk Audit</h4>
                  <span className="font-mono font-bold text-amber-700">
                    Composite Score: {selectedOrder.riskEvaluation.compositeScore} / 20
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Traffic</span>
                    <strong className="font-mono text-slate-900 text-sm">
                      {selectedOrder.riskEvaluation.trafficScore}/5
                    </strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Structural</span>
                    <strong className="font-mono text-slate-900 text-sm">
                      {selectedOrder.riskEvaluation.structuralScore}/5
                    </strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Safety</span>
                    <strong className="font-mono text-slate-900 text-sm">
                      {selectedOrder.riskEvaluation.safetyScore}/5
                    </strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Criticality</span>
                    <strong className="font-mono text-slate-900 text-sm">
                      {selectedOrder.riskEvaluation.assetCriticality}/5
                    </strong>
                  </div>
                </div>

                <p className="text-slate-700 text-xs italic bg-white p-2.5 rounded border border-slate-100">
                  "{selectedOrder.riskEvaluation.engineeringJustification}"
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Sign-off: {selectedOrder.riskEvaluation.evaluatedByEngineer}</span>
                  <span className="font-mono">
                    {new Date(selectedOrder.riskEvaluation.evaluationTimestamp).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>

              {/* Execution Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 font-medium">Assigned Team / Contractor</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedOrder.assignedTeam}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 font-medium">Supervising Engineer</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedOrder.supervisingEngineer}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 font-medium">Estimated Budget (PGK)</span>
                  <p className="font-bold font-mono text-slate-900 mt-0.5">
                    PGK {selectedOrder.estimatedBudgetPGK.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 font-medium">Target Completion Date</span>
                  <p className="font-bold font-mono text-slate-900 mt-0.5">
                    {selectedOrder.targetCompletionDate}
                  </p>
                </div>
              </div>

              {/* Scope of Work */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-1">Scope of Engineering Works</h4>
                <p className="text-slate-700 text-xs leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {selectedOrder.scopeOfWork}
                </p>
              </div>

              {/* Materials */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-1">Bill of Materials</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs">
                  {selectedOrder.materialsRequired.map((mat, idx) => (
                    <li key={idx}>{mat}</li>
                  ))}
                </ul>
              </div>

              {/* Completion Evidence if Finished */}
              {selectedOrder.status === 'completed' && selectedOrder.completionEvidence && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Statutory Completion Certificate & Sign-off</span>
                  </div>
                  <p className="text-xs">{selectedOrder.completionEvidence.remarks}</p>
                  <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-[11px]">
                    <span>
                      Certified By: <strong>{selectedOrder.completionEvidence.certifiedBy}</strong>
                    </span>
                    <span className="font-mono">
                      Reg: {selectedOrder.completionEvidence.engineerRegistrationNo}
                    </span>
                  </div>
                </div>
              )}

              {/* Status Update Buttons for Operations Team */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 block text-xs">Operational Status Transition</span>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedOrder.status !== 'in_progress' && selectedOrder.status !== 'completed' && (
                    <button
                      onClick={() => {
                        updateWorkOrderStatus(selectedOrder.id, 'in_progress');
                        setSelectedOrder({ ...selectedOrder, status: 'in_progress' });
                      }}
                      className="px-3 py-1.5 bg-amber-600 text-white font-semibold rounded text-xs hover:bg-amber-700"
                    >
                      Start Execution (In Progress)
                    </button>
                  )}

                  {selectedOrder.status === 'in_progress' && (
                    <button
                      onClick={() => {
                        updateWorkOrderStatus(selectedOrder.id, 'quality_audit');
                        setSelectedOrder({ ...selectedOrder, status: 'quality_audit' });
                      }}
                      className="px-3 py-1.5 bg-purple-700 text-white font-semibold rounded text-xs hover:bg-purple-800"
                    >
                      Submit for Quality Audit
                    </button>
                  )}

                  {selectedOrder.status !== 'completed' && (
                    <button
                      onClick={() => setShowCompletionModal(true)}
                      className="px-3.5 py-1.5 bg-emerald-600 text-white font-bold rounded text-xs hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Certify & Complete Work Order</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
              >
                Close Order View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE WORK ORDER MODAL */}
      {showCreateOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Dispatch Maintenance Work Order</h3>
                <p className="text-xs text-slate-500">Include Certified Risk Scoring</p>
              </div>
              <button
                onClick={() => setShowCreateOrderModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Work Order Title</label>
                <input
                  type="text"
                  required
                  value={orderForm.title}
                  onChange={(e) => setOrderForm({ ...orderForm, title: e.target.value })}
                  placeholder="e.g. Hubert Murray Highway Pavement Restoration & Overlay"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Target Asset</label>
                  <select
                    value={orderForm.assetId}
                    onChange={(e) => setOrderForm({ ...orderForm, assetId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} - {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Suburb Location</label>
                  <select
                    value={orderForm.suburb}
                    onChange={(e) => setOrderForm({ ...orderForm, suburb: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    {POM_SUBURBS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Risk Scoring Form Strip */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                <span className="font-bold text-amber-950 block">Risk Evaluation Criteria (1 to 5)</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Traffic (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={orderForm.trafficScore}
                      onChange={(e) =>
                        setOrderForm({ ...orderForm, trafficScore: Number(e.target.value) })
                      }
                      className="w-full px-2 py-1.5 bg-white border border-amber-200 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Structural (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={orderForm.structuralScore}
                      onChange={(e) =>
                        setOrderForm({ ...orderForm, structuralScore: Number(e.target.value) })
                      }
                      className="w-full px-2 py-1.5 bg-white border border-amber-200 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Safety (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={orderForm.safetyScore}
                      onChange={(e) =>
                        setOrderForm({ ...orderForm, safetyScore: Number(e.target.value) })
                      }
                      className="w-full px-2 py-1.5 bg-white border border-amber-200 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Criticality (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={orderForm.assetCriticality}
                      onChange={(e) =>
                        setOrderForm({ ...orderForm, assetCriticality: Number(e.target.value) })
                      }
                      className="w-full px-2 py-1.5 bg-white border border-amber-200 rounded text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                    Engineering Justification
                  </label>
                  <input
                    type="text"
                    value={orderForm.engineeringJustification}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, engineeringJustification: e.target.value })
                    }
                    placeholder="Rationale for priority assessment..."
                    className="w-full px-2 py-1 bg-white border border-amber-200 rounded text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Assigned Maintenance Team</label>
                  <input
                    type="text"
                    value={orderForm.assignedTeam}
                    onChange={(e) => setOrderForm({ ...orderForm, assignedTeam: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Estimated Budget (PGK)</label>
                  <input
                    type="number"
                    value={orderForm.estimatedBudgetPGK}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, estimatedBudgetPGK: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Scope of Engineering Work</label>
                <textarea
                  rows={2}
                  required
                  value={orderForm.scopeOfWork}
                  onChange={(e) => setOrderForm({ ...orderForm, scopeOfWork: e.target.value })}
                  placeholder="Detail excavation, asphalt placement, compaction, and drainage connection..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Materials Required (comma separated)</label>
                <input
                  type="text"
                  value={orderForm.materialsStr}
                  onChange={(e) => setOrderForm({ ...orderForm, materialsStr: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateOrderModal(false)}
                  className="px-3.5 py-2 border border-slate-200 bg-white rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 shadow-sm"
                >
                  Dispatch Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE INSPECTION MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Schedule Infrastructure Inspection</h3>
            <form onSubmit={handleScheduleInspectionSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Target Asset</label>
                <select
                  value={inspectionForm.assetId}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, assetId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.id} - {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Inspection Type</label>
                <select
                  value={inspectionForm.inspectionType}
                  onChange={(e) =>
                    setInspectionForm({
                      ...inspectionForm,
                      inspectionType: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="routine_condition">Routine Condition Assessment</option>
                  <option value="post_rain_survey">Post-Rain Stormwater Survey</option>
                  <option value="citizen_report_verification">Citizen Defect Verification</option>
                  <option value="structural_audit">Major Structural Bridge Audit</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  required
                  value={inspectionForm.scheduledDate}
                  onChange={(e) =>
                    setInspectionForm({ ...inspectionForm, scheduledDate: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Assigned Field Officer</label>
                <input
                  type="text"
                  value={inspectionForm.inspectorName}
                  onChange={(e) =>
                    setInspectionForm({ ...inspectionForm, inspectorName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3.5 py-2 border border-slate-200 bg-white rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CERTIFY & COMPLETE MODAL */}
      {showCompletionModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <img
                src={IMAGES.logo}
                alt="NCDC Official Crest"
                className="w-12 h-12 object-contain rounded-lg p-0.5 bg-white border border-slate-200 shadow-2xs shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">
                  National Capital District Commission
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Statutory Engineering Completion Certificate
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Certifying formal handover of Work Order <strong>{selectedOrder.id}</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleCompleteOrderSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Certifying Civil Engineer</label>
                <input
                  type="text"
                  required
                  value={completionForm.certifiedBy}
                  onChange={(e) =>
                    setCompletionForm({ ...completionForm, certifiedBy: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  MIEPNG Registration Number
                </label>
                <input
                  type="text"
                  required
                  value={completionForm.engineerRegistrationNo}
                  onChange={(e) =>
                    setCompletionForm({
                      ...completionForm,
                      engineerRegistrationNo: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Engineering Remarks & Compliance Findings
                </label>
                <textarea
                  rows={3}
                  required
                  value={completionForm.remarks}
                  onChange={(e) =>
                    setCompletionForm({ ...completionForm, remarks: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <input
                  type="checkbox"
                  id="testedComplianceCheck"
                  checked={completionForm.testedCompliance}
                  onChange={(e) =>
                    setCompletionForm({ ...completionForm, testedCompliance: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="testedComplianceCheck" className="text-[11px] text-emerald-950 font-medium">
                  I formally certify that civil works satisfy NCDC structural, hydraulic, and safety regulations.
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCompletionModal(false)}
                  className="px-3.5 py-2 border border-slate-200 bg-white rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!completionForm.testedCompliance}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50"
                >
                  Issue Completion Sign-Off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
