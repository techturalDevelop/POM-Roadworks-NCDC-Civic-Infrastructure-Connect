import React from 'react';
import { useInfrastructure } from '../../context/InfrastructureContext';
import { IMAGES } from '../../data/seedData';
import {
  Map as MapIcon,
  Layers,
  FileText,
  AlertTriangle,
  Wrench,
  ShieldCheck,
  BarChart3,
  RotateCcw,
  Building,
  Phone,
  Globe2,
  ChevronRight,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const {
    portalMode,
    setPortalMode,
    activeTab,
    setActiveTab,
    resetAllDemoData,
    roadworks,
    reports,
    notices
  } = useInfrastructure();

  const isStaff = portalMode === 'operations';

  const navItems = [
    {
      id: 'roadworks',
      label: 'Roadworks Map',
      icon: MapIcon,
      badge: `${roadworks.filter((r) => r.status === 'active').length} active`,
    },
    {
      id: 'assets',
      label: 'Asset Register',
      icon: Layers,
      badge: 'ISO 55001',
    },
    {
      id: 'notices',
      label: 'Official Notices',
      icon: FileText,
      badge: isStaff
        ? `${notices.length} total`
        : `${notices.filter((n) => n.status === 'published').length} gazetted`,
    },
    {
      id: 'report',
      label: 'Report Defect',
      icon: AlertTriangle,
      badge: `${reports.filter((r) => r.status === 'received').length} new`,
    },
    {
      id: 'operations',
      label: 'Engineering Ops',
      icon: Wrench,
      badge: 'Certified',
      staffOnly: true,
    },
    {
      id: 'dashboards',
      label: 'Dashboards & KPIs',
      icon: BarChart3,
      badge: 'Module 6',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Top Brand Block */}
          <div className="p-5 border-b border-slate-100 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src={IMAGES.logo}
                alt="NCDC Official Crest"
                className="w-11 h-11 object-contain rounded-lg p-0.5 bg-white border border-slate-200/90 shadow-2xs shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <h1 className="font-bold text-slate-900 text-sm leading-tight">
                  POM Roadworks
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">NCDC Civic Connect</p>
                <span className="text-[10px] text-amber-700 font-semibold tracking-wide">
                  PAPUA NEW GUINEA
                </span>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Portal Indicator */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[11px] text-slate-500 font-medium">Active Interface</span>
              <span className="text-[10px] font-mono text-slate-400">
                {isStaff ? 'STAFF MODE' : 'PUBLIC'}
              </span>
            </div>
            <div
              className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
                isStaff
                  ? 'bg-slate-900 text-white'
                  : 'bg-amber-100/70 text-amber-950 border border-amber-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isStaff ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Globe2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                )}
                <span className="truncate">{isStaff ? 'NCDC Operations' : 'Public Portal'}</span>
              </div>
            </div>
          </div>

          {/* Main Navigation Links */}
          <div className="p-3 flex-1 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Navigation Menu
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id === 'operations' && portalMode !== 'operations') {
                      setPortalMode('operations');
                    }
                    onCloseMobile();
                  }}
                  type="button"
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-amber-400' : 'text-slate-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Sidebar Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-3">
            <div className="text-[11px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700 flex items-center gap-1">
                <Building className="w-3 h-3 text-slate-400" /> NCDC City Hall
              </p>
              <p className="text-[10px] text-slate-500">Port Moresby, Papua New Guinea</p>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Reset all demonstration records to initial seed data?')) {
                  resetAllDemoData();
                }
              }}
              type="button"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Reset Sample Data</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
