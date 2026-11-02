import React from 'react';
import { useInfrastructure } from '../../context/InfrastructureContext';
import { STAFF_PROFILES, IMAGES } from '../../data/seedData';
import { ShieldCheck, UserCheck, ChevronDown, Menu, LogOut, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const {
    portalMode,
    setPortalMode,
    activeTab,
    currentUser,
    setCurrentUser,
  } = useInfrastructure();

  const isStaff = portalMode === 'operations';

  // Section titles for left header breadcrumb
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'roadworks':
        return 'Public Roadworks Cartography & Advisories';
      case 'assets':
        return 'Municipal Civil Infrastructure Asset Register';
      case 'notices':
        return 'Official Gazetted Public Notices';
      case 'report':
        return 'Citizen Infrastructure Defect Reporting';
      case 'operations':
        return 'Engineering Operations & Risk Framework';
      case 'dashboards':
        return 'Municipal Dashboards & Statutory KPI Reporting';
      default:
        return 'National Capital District Commission';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Left Zone: Mobile toggle button & Active section contextual breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onToggleMobileMenu}
              type="button"
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg md:hidden shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Header Brand with NCDC Logo */}
            <div className="flex items-center gap-2.5 md:hidden min-w-0">
              <img
                src={IMAGES.logo}
                alt="NCDC Logo"
                className="w-8 h-8 object-contain rounded-md bg-white border border-slate-200 p-0.5 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="truncate">
                <span className="font-bold text-xs text-slate-900 block truncate">POM Roadworks</span>
                <span className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider block">NCDC Civic</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  NCDC · Port Moresby GIS
                </span>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  {getTabTitle(activeTab)}
                </h2>
              </div>
            </div>
          </div>

          {/* Right Zone: STRICTLY ONLY THE SIGN IN FEATURE */}
          <div className="flex items-center gap-3 shrink-0">
            {isStaff ? (
              /* Signed-in staff user controls */
              <div className="flex items-center gap-2">
                {/* Staff Role Switcher */}
                <div className="relative">
                  <select
                    value={currentUser.id}
                    onChange={(e) => {
                      const found = STAFF_PROFILES.find((p) => p.id === e.target.value);
                      if (found) setCurrentUser(found);
                    }}
                    className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold bg-slate-100 text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer whitespace-nowrap shrink-0"
                    title="Switch active engineering role profile"
                  >
                    {STAFF_PROFILES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.title.split(' ')[0]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Sign Out / Exit Staff Portal Button */}
                <button
                  onClick={() => {
                    setPortalMode('public');
                  }}
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  title="Sign out of operations portal and return to public citizen view"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Sign Out to Public</span>
                  <span className="sm:hidden">Exit</span>
                </button>
              </div>
            ) : (
              /* Unauthenticated / Citizen Sign In Trigger */
              <button
                onClick={() => {
                  setPortalMode('operations');
                }}
                type="button"
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap shrink-0 shadow-xs"
              >
                <UserCheck className="w-4 h-4" />
                <span>NCDC Staff Sign-In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
