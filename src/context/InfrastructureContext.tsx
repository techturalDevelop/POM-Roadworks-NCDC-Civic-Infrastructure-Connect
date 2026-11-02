import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PortalMode,
  UserProfile,
  RoadworkProject,
  InfrastructureAsset,
  CustomCategoryConfig,
  OfficialNotice,
  CitizenReport,
  MaintenanceWorkOrder,
  InspectionScheduleItem,
  NoticeStatus,
  ConditionRating,
  RiskEvaluationMatrix,
  WorkOrderStatus,
  ReportStatus
} from '../types/infrastructure';
import {
  SEED_ROADWORKS,
  SEED_ASSETS,
  SEED_NOTICES,
  SEED_CITIZEN_REPORTS,
  SEED_WORK_ORDERS,
  SEED_INSPECTION_SCHEDULE,
  INITIAL_CUSTOM_CATEGORIES,
  STAFF_PROFILES
} from '../data/seedData';

interface InfrastructureContextType {
  // Navigation & Identity
  portalMode: PortalMode;
  setPortalMode: (mode: PortalMode) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  isStaff: boolean;

  // Data lists
  roadworks: RoadworkProject[];
  assets: InfrastructureAsset[];
  customCategories: CustomCategoryConfig[];
  notices: OfficialNotice[];
  reports: CitizenReport[];
  workOrders: MaintenanceWorkOrder[];
  inspections: InspectionScheduleItem[];

  // Focused map entity
  selectedEntity: {
    type: 'roadwork' | 'asset' | 'notice' | 'report' | 'work_order';
    id: string;
    coordinates?: [number, number];
  } | null;
  setSelectedEntity: (entity: {
    type: 'roadwork' | 'asset' | 'notice' | 'report' | 'work_order';
    id: string;
    coordinates?: [number, number];
  } | null) => void;

  // Module 1 Actions
  updateRoadworkStatus: (id: string, status: RoadworkProject['status'], progressPct?: number) => void;

  // Module 2 Actions
  addAsset: (asset: Omit<InfrastructureAsset, 'id'> & { id?: string }) => void;
  updateAssetCondition: (id: string, condition: ConditionRating, notes?: string) => void;
  addCustomCategory: (cat: CustomCategoryConfig) => void;

  // Module 3 Actions
  createNotice: (notice: Omit<OfficialNotice, 'id' | 'changeHistory'>) => string;
  updateNoticeStatus: (id: string, newStatus: NoticeStatus, notes: string) => void;
  publishNotice: (id: string) => void;

  // Module 4 Actions
  submitCitizenReport: (report: Omit<CitizenReport, 'id' | 'submittedAt' | 'status' | 'isVerifiedEngineeringDefect'>) => string;
  triageReport: (id: string, status: ReportStatus, isVerified: boolean, notes: string, assignedInspector?: string) => void;
  mergeDuplicateReport: (reportId: string, primaryReportId: string, reason: string) => void;

  // Module 5 Actions
  createWorkOrder: (order: Omit<MaintenanceWorkOrder, 'id' | 'createdDate'>) => string;
  updateWorkOrderStatus: (id: string, status: WorkOrderStatus) => void;
  completeWorkOrder: (id: string, evidence: MaintenanceWorkOrder['completionEvidence']) => void;
  scheduleInspection: (inspection: Omit<InspectionScheduleItem, 'id'>) => string;

  // Utility
  resetAllDemoData: () => void;
}

const STORAGE_KEY_PREFIX = 'ncdc_pom_infra_v2_';

const InfrastructureContext = createContext<InfrastructureContextType | undefined>(undefined);

export const InfrastructureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [portalMode, setPortalMode] = useState<PortalMode>('public');
  const [activeTab, setActiveTab] = useState<string>('roadworks');
  const [currentUser, setCurrentUser] = useState<UserProfile>(STAFF_PROFILES[0]);

  // Data collections with localStorage cache fallback
  const [roadworks, setRoadworks] = useState<RoadworkProject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'roadworks');
    return saved ? JSON.parse(saved) : SEED_ROADWORKS;
  });

  const [assets, setAssets] = useState<InfrastructureAsset[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'assets');
    return saved ? JSON.parse(saved) : SEED_ASSETS;
  });

  const [customCategories, setCustomCategories] = useState<CustomCategoryConfig[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'custom_categories');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOM_CATEGORIES;
  });

  const [notices, setNotices] = useState<OfficialNotice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'notices');
    return saved ? JSON.parse(saved) : SEED_NOTICES;
  });

  const [reports, setReports] = useState<CitizenReport[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'reports');
    return saved ? JSON.parse(saved) : SEED_CITIZEN_REPORTS;
  });

  const [workOrders, setWorkOrders] = useState<MaintenanceWorkOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'work_orders');
    return saved ? JSON.parse(saved) : SEED_WORK_ORDERS;
  });

  const [inspections, setInspections] = useState<InspectionScheduleItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'inspections');
    return saved ? JSON.parse(saved) : SEED_INSPECTION_SCHEDULE;
  });

  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'roadwork' | 'asset' | 'notice' | 'report' | 'work_order';
    id: string;
    coordinates?: [number, number];
  } | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'roadworks', JSON.stringify(roadworks));
  }, [roadworks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'custom_categories', JSON.stringify(customCategories));
  }, [customCategories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'work_orders', JSON.stringify(workOrders));
  }, [workOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'inspections', JSON.stringify(inspections));
  }, [inspections]);

  // Actions
  const updateRoadworkStatus = (id: string, status: RoadworkProject['status'], progressPct?: number) => {
    setRoadworks(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status,
              progressPct: progressPct !== undefined ? progressPct : item.progressPct,
              lastUpdated: new Date().toISOString(),
            }
          : item
      )
    );
  };

  const addAsset = (newAsset: Omit<InfrastructureAsset, 'id'> & { id?: string }) => {
    const id = newAsset.id || `NCDC-AST-${String(assets.length + 101).padStart(4, '0')}`;
    const completeAsset: InfrastructureAsset = {
      ...newAsset,
      id,
      inspectionHistory: newAsset.inspectionHistory || [],
      maintenanceHistory: newAsset.maintenanceHistory || [],
      linkedProjectIds: newAsset.linkedProjectIds || [],
      linkedWorkOrderIds: newAsset.linkedWorkOrderIds || [],
      linkedReportIds: newAsset.linkedReportIds || [],
    };
    setAssets(prev => [completeAsset, ...prev]);
  };

  const updateAssetCondition = (id: string, condition: ConditionRating, notes?: string) => {
    setAssets(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newInspection = notes
            ? [
                {
                  id: `INS-${Date.now().toString().slice(-4)}`,
                  date: new Date().toISOString().split('T')[0],
                  inspectorName: currentUser.name,
                  inspectorId: currentUser.id,
                  conditionScore: condition,
                  findings: notes,
                  recommendedAction: condition >= 4 ? 'Immediate work order required' : 'Routine monitoring',
                },
                ...item.inspectionHistory,
              ]
            : item.inspectionHistory;

          return {
            ...item,
            condition,
            inspectionHistory: newInspection,
          };
        }
        return item;
      })
    );
  };

  const addCustomCategory = (cat: CustomCategoryConfig) => {
    setCustomCategories(prev => [...prev, cat]);
  };

  // Module 3 Notices
  const createNotice = (noticeData: Omit<OfficialNotice, 'id' | 'changeHistory'>): string => {
    const id = `NCDC-NOT-2026-${String(notices.length + 36).padStart(3, '0')}`;
    const newNotice: OfficialNotice = {
      ...noticeData,
      id,
      changeHistory: [
        {
          timestamp: new Date().toISOString(),
          user: currentUser.name,
          role: currentUser.title,
          action: 'Notice Draft Created',
          notes: 'Initial notice drafted via Operations Portal.',
        },
      ],
    };
    setNotices(prev => [newNotice, ...prev]);
    return id;
  };

  const updateNoticeStatus = (id: string, newStatus: NoticeStatus, notes: string) => {
    setNotices(prev =>
      prev.map(notice => {
        if (notice.id === id) {
          const isPublishing = newStatus === 'published';
          const isApproving = newStatus === 'approved';
          return {
            ...notice,
            status: newStatus,
            approvedBy: isApproving || isPublishing ? `${currentUser.name} (${currentUser.title})` : notice.approvedBy,
            publishedAt: isPublishing ? new Date().toISOString() : notice.publishedAt,
            changeHistory: [
              {
                timestamp: new Date().toISOString(),
                user: currentUser.name,
                role: currentUser.title,
                action: `Status updated to ${newStatus.replace('_', ' ').toUpperCase()}`,
                notes,
              },
              ...notice.changeHistory,
            ],
          };
        }
        return notice;
      })
    );
  };

  const publishNotice = (id: string) => {
    updateNoticeStatus(id, 'published', 'Official gazettal & public broadcast authorization granted.');
  };

  // Module 4 Citizen Reporting
  const submitCitizenReport = (
    reportData: Omit<CitizenReport, 'id' | 'submittedAt' | 'status' | 'isVerifiedEngineeringDefect'>
  ): string => {
    const id = `POM-REP-2026-${String(reports.length + 851).padStart(4, '0')}`;
    const newReport: CitizenReport = {
      ...reportData,
      id,
      submittedAt: new Date().toISOString(),
      status: 'received',
      isVerifiedEngineeringDefect: false,
    };
    setReports(prev => [newReport, ...prev]);
    return id;
  };

  const triageReport = (
    id: string,
    status: ReportStatus,
    isVerified: boolean,
    notes: string,
    assignedInspector?: string
  ) => {
    setReports(prev =>
      prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            status,
            isVerifiedEngineeringDefect: isVerified,
            internalTriageNotes: notes,
            assignedInspector: assignedInspector || r.assignedInspector,
          };
        }
        return r;
      })
    );
  };

  const mergeDuplicateReport = (reportId: string, primaryReportId: string, reason: string) => {
    setReports(prev =>
      prev.map(r => {
        if (r.id === reportId) {
          return {
            ...r,
            status: 'duplicate_merged',
            duplicateOfId: primaryReportId,
            internalTriageNotes: `Merged as duplicate of ${primaryReportId}: ${reason}`,
          };
        }
        return r;
      })
    );
  };

  // Module 5 Engineering Operations
  const createWorkOrder = (orderData: Omit<MaintenanceWorkOrder, 'id' | 'createdDate'>): string => {
    const id = `MWO-2026-${String(workOrders.length + 55).padStart(4, '0')}`;
    const newOrder: MaintenanceWorkOrder = {
      ...orderData,
      id,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setWorkOrders(prev => [newOrder, ...prev]);

    // Also link back to asset if exists
    if (orderData.assetId) {
      setAssets(prev =>
        prev.map(a =>
          a.id === orderData.assetId ? { ...a, linkedWorkOrderIds: [...a.linkedWorkOrderIds, id] } : a
        )
      );
    }

    return id;
  };

  const updateWorkOrderStatus = (id: string, status: WorkOrderStatus) => {
    setWorkOrders(prev => prev.map(order => (order.id === id ? { ...order, status } : order)));
  };

  const completeWorkOrder = (id: string, evidence: MaintenanceWorkOrder['completionEvidence']) => {
    setWorkOrders(prev =>
      prev.map(order =>
        order.id === id
          ? {
              ...order,
              status: 'completed',
              completionEvidence: evidence,
              actualCostPGK: order.actualCostPGK || order.estimatedBudgetPGK * 0.96,
            }
          : order
      )
    );
  };

  const scheduleInspection = (itemData: Omit<InspectionScheduleItem, 'id'>): string => {
    const id = `SCH-2026-${String(inspections.length + 105).padStart(3, '0')}`;
    const newItem: InspectionScheduleItem = {
      ...itemData,
      id,
    };
    setInspections(prev => [newItem, ...prev]);
    return id;
  };

  const resetAllDemoData = () => {
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'roadworks');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'assets');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'custom_categories');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'notices');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'reports');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'work_orders');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'inspections');

    setRoadworks(SEED_ROADWORKS);
    setAssets(SEED_ASSETS);
    setCustomCategories(INITIAL_CUSTOM_CATEGORIES);
    setNotices(SEED_NOTICES);
    setReports(SEED_CITIZEN_REPORTS);
    setWorkOrders(SEED_WORK_ORDERS);
    setInspections(SEED_INSPECTION_SCHEDULE);
    setSelectedEntity(null);
  };

  return (
    <InfrastructureContext.Provider
      value={{
        portalMode,
        setPortalMode,
        activeTab,
        setActiveTab,
        currentUser,
        setCurrentUser,
        isStaff: portalMode === 'operations',

        roadworks,
        assets,
        customCategories,
        notices,
        reports,
        workOrders,
        inspections,

        selectedEntity,
        setSelectedEntity,

        updateRoadworkStatus,
        addAsset,
        updateAssetCondition,
        addCustomCategory,

        createNotice,
        updateNoticeStatus,
        publishNotice,

        submitCitizenReport,
        triageReport,
        mergeDuplicateReport,

        createWorkOrder,
        updateWorkOrderStatus,
        completeWorkOrder,
        scheduleInspection,

        resetAllDemoData,
      }}
    >
      {children}
    </InfrastructureContext.Provider>
  );
};

export const useInfrastructure = () => {
  const context = useContext(InfrastructureContext);
  if (!context) {
    throw new Error('useInfrastructure must be used within an InfrastructureProvider');
  }
  return context;
};
