export type PortalMode = 'public' | 'operations';

export type UserRole = 
  | 'public_citizen'
  | 'senior_civil_engineer'
  | 'asset_manager'
  | 'traffic_superintendent'
  | 'field_inspector'
  | 'directorate_admin';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  department: string;
  badgeNumber?: string;
}

// Module 1: Public Roadworks Map
export type RoadworkStatus = 'planned' | 'active' | 'completed' | 'suspended';

export type RoadworkImpact = 
  | 'major_closure' 
  | 'lane_reduction' 
  | 'detour_required' 
  | 'night_works' 
  | 'minor_delays';

export interface RoadworkProject {
  id: string; // e.g. POM-RW-2026-01
  title: string;
  road: string;
  suburb: string;
  landmark: string;
  coordinates: [number, number]; // [lat, lng]
  corridorCoordinates?: [number, number][]; // Polyline for road corridor
  status: RoadworkStatus;
  impact: RoadworkImpact;
  impactDescription: string;
  startDate: string;
  targetEndDate: string;
  progressPct: number;
  contractor: string;
  executingAgency: string;
  supervisingEngineer: string;
  description: string;
  detourInfo: string;
  recommendedSpeedKmh: number;
  lastUpdated: string;
  contactOfficer: string;
  contactPhone: string;
  estimatedBudgetPGK?: number;
}

// Module 2: Infrastructure Asset Register
export type AssetCategory = 
  | 'roads_segments' 
  | 'drainage_culverts' 
  | 'bridges_structures' 
  | 'streetlights_signals' 
  | 'custom';

export type ConditionRating = 1 | 2 | 3 | 4 | 5; // 1: Very Good, 2: Good, 3: Fair, 4: Poor, 5: Critical/Failed

export interface AssetInspection {
  id: string;
  date: string;
  inspectorName: string;
  inspectorId: string;
  conditionScore: ConditionRating;
  findings: string;
  recommendedAction: string;
  photoUrl?: string;
}

export interface AssetMaintenanceRecord {
  id: string;
  workOrderId: string;
  completionDate: string;
  contractorOrCrew: string;
  costPGK: number;
  summary: string;
  warrantyUntil?: string;
}

export interface InfrastructureAsset {
  id: string; // e.g. NCDC-RDS-0104
  name: string;
  category: AssetCategory;
  categoryName: string; // user-friendly or custom label
  suburb: string;
  locationDescription: string;
  coordinates: [number, number];
  responsibleAuthority: string; // e.g. NCDC Directorate of Engineering, PNG DOWH, Eda Ranu
  installationYear: number;
  condition: ConditionRating;
  description: string;
  specifications: Record<string, string>;
  inspectionHistory: AssetInspection[];
  maintenanceHistory: AssetMaintenanceRecord[];
  nextInspectionDate: string;
  imageUrl?: string;
  linkedProjectIds: string[];
  linkedWorkOrderIds: string[];
  linkedReportIds: string[];
}

export interface CustomCategoryConfig {
  id: string;
  name: string;
  codePrefix: string;
  iconName: string;
  description: string;
  attributes: string[];
}

// Module 3: Official Public Notices
export type NoticeStatus = 
  | 'draft' 
  | 'under_review' 
  | 'approved' 
  | 'scheduled' 
  | 'published' 
  | 'expired' 
  | 'archived';

export type NoticeCategory = 
  | 'road_closure' 
  | 'utility_disruption' 
  | 'public_safety' 
  | 'heavy_vehicle_restriction' 
  | 'emergency_works';

export interface NoticeDocument {
  title: string;
  docRef: string;
  fileType: string;
  size: string;
  uploadDate: string;
}

export interface NoticeAuditEntry {
  timestamp: string;
  user: string;
  role: string;
  action: string;
  notes: string;
}

export interface OfficialNotice {
  id: string; // e.g. NCDC-NOT-2026-031
  title: string;
  category: NoticeCategory;
  issuingDepartment: string;
  issuingOfficer: string;
  officerDesignation: string;
  affectedLocations: string[];
  corridorSummary: string;
  coordinates?: [number, number];
  effectiveDate: string;
  expiryDate: string;
  status: NoticeStatus;
  description: string;
  publicAdvisory: string;
  detourRoute: string;
  supportingDocuments: NoticeDocument[];
  changeHistory: NoticeAuditEntry[];
  publishedAt?: string;
  approvedBy?: string;
}

// Module 4: Public Infrastructure Reporting
export type ReportCategory = 
  | 'pothole' 
  | 'blocked_drain' 
  | 'damaged_sign' 
  | 'broken_streetlight' 
  | 'damaged_guardrail' 
  | 'water_pooling' 
  | 'illegal_excavation' 
  | 'other';

export type ReportStatus = 
  | 'received' 
  | 'duplicate_merged' 
  | 'triaged' 
  | 'inspection_scheduled' 
  | 'work_order_created' 
  | 'resolved' 
  | 'dismissed';

export interface CitizenReport {
  id: string; // e.g. POM-REP-2026-0842
  category: ReportCategory;
  categoryName: string;
  suburb: string;
  roadName: string;
  landmark: string;
  coordinates: [number, number];
  description: string;
  photoUrl?: string;
  submittedAt: string;
  reporterName?: string;
  reporterContact?: string;
  status: ReportStatus;
  isVerifiedEngineeringDefect: boolean;
  duplicateOfId?: string;
  internalTriageNotes?: string;
  assignedInspector?: string;
  linkedAssetId?: string;
  linkedWorkOrderId?: string;
  resolutionSummary?: string;
  urgencyCitizen: 'low' | 'medium' | 'high' | 'critical';
}

// Module 5: Engineering Operations & Risk Framework
export type RiskPriorityLevel = 'routine' | 'medium' | 'high' | 'critical_urgent';

export type WorkOrderStatus = 
  | 'created' 
  | 'scheduled' 
  | 'in_progress' 
  | 'quality_audit' 
  | 'completed';

export interface RiskEvaluationMatrix {
  trafficScore: number; // 1-5 (5 = Major arterial / high PM peak)
  structuralScore: number; // 1-5 (5 = Complete structural failure)
  safetyScore: number; // 1-5 (5 = Direct pedestrian/vehicle danger)
  assetCriticality: number; // 1-5 (5 = Single-point-of-failure bridge/freeway)
  compositeScore: number; // Max 20
  riskLevel: RiskPriorityLevel;
  engineeringJustification: string;
  evaluatedByEngineer: string;
  evaluationTimestamp: string;
}

export interface WorkOrderCompletion {
  completionDate: string;
  certifiedBy: string;
  engineerRegistrationNo: string;
  remarks: string;
  testedCompliance: boolean;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
}

export interface MaintenanceWorkOrder {
  id: string; // e.g. MWO-2026-0045
  title: string;
  assetId: string;
  assetName: string;
  suburb: string;
  coordinates: [number, number];
  priority: RiskPriorityLevel;
  riskEvaluation: RiskEvaluationMatrix;
  assignedTeam: string;
  supervisingEngineer: string;
  createdDate: string;
  scheduledStartDate: string;
  targetCompletionDate: string;
  status: WorkOrderStatus;
  estimatedBudgetPGK: number;
  actualCostPGK?: number;
  materialsRequired: string[];
  scopeOfWork: string;
  linkedReportId?: string;
  linkedRoadworkId?: string;
  completionEvidence?: WorkOrderCompletion;
}

export interface InspectionScheduleItem {
  id: string;
  assetId: string;
  assetName: string;
  suburb: string;
  inspectionType: 'routine_condition' | 'post_rain_survey' | 'citizen_report_verification' | 'structural_audit';
  scheduledDate: string;
  inspectorName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rescheduled';
  linkedReportId?: string;
  priority: 'low' | 'medium' | 'high';
}
