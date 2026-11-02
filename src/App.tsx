/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InfrastructureProvider, useInfrastructure } from './context/InfrastructureContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { DemoBanner } from './components/common/DemoBanner';
import { RoadworksModule } from './components/roadworks/RoadworksModule';
import { AssetRegisterModule } from './components/assets/AssetRegisterModule';
import { NoticesModule } from './components/notices/NoticesModule';
import { CitizenReportingModule } from './components/reports/CitizenReportingModule';
import { EngineeringOpsModule } from './components/operations/EngineeringOpsModule';
import { DashboardsModule } from './components/dashboards/DashboardsModule';
import { IMAGES } from './data/seedData';
import { Building, Phone } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab } = useInfrastructure();

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
      {activeTab === 'roadworks' && <RoadworksModule />}
      {activeTab === 'assets' && <AssetRegisterModule />}
      {activeTab === 'notices' && <NoticesModule />}
      {activeTab === 'report' && <CitizenReportingModule />}
      {activeTab === 'operations' && <EngineeringOpsModule />}
      {activeTab === 'dashboards' && <DashboardsModule />}
    </main>
  );
};

const Footer: React.FC = () => {
  const { resetAllDemoData } = useInfrastructure();

  return (
    <footer className="mt-16 bg-white border-t border-slate-200 text-xs text-slate-500 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <img
                src={IMAGES.logo}
                alt="NCDC Official Crest"
                className="w-10 h-10 object-contain rounded-lg p-0.5 bg-white border border-slate-200 shadow-2xs shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="font-bold text-slate-900 text-xs block leading-tight">
                  National Capital District Commission (NCDC)
                </span>
                <span className="text-[10px] text-amber-700 font-semibold tracking-wider">
                  PORT MORESBY · PAPUA NEW GUINEA
                </span>
              </div>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Proposed municipal digital platform prototype. City Hall, Champion Parade, Konedobu, Port Moresby, Papua New Guinea.
            </p>
          </div>

          <div className="space-y-1 text-slate-600">
            <span className="font-bold text-slate-900 text-xs block">Technical Standards</span>
            <p>Google Earth Satellite & OpenStreetMap Cartography</p>
            <p>ISO 55001 Municipal Asset Standards</p>
            <p>PNG Department of Works & Highways Specification</p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-900 text-xs block">Statutory Governance</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Registered human engineers (MIEPNG) hold sole authority over structural certifications and statutory risk scoring.
            </p>
            <button
              onClick={() => {
                if (window.confirm('Reset sample demonstration records to initial seed state?')) {
                  resetAllDemoData();
                }
              }}
              className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold underline block pt-1"
            >
              Reset Demonstration Dataset
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <p>© 2026 NCDC Port Moresby, Papua New Guinea. Architecture Prototype.</p>
          <p>Satellite Imagery: © Google Earth / Maxar · Map Data: © OpenStreetMap</p>
        </div>
      </div>
    </footer>
  );
};

const AppLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans selection:bg-amber-500 selection:text-white">
      {/* Relocated Main Menu on Left Panel */}
      <Sidebar
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <DemoBanner />
        {/* Header containing ONLY the sign-in feature */}
        <Header onToggleMobileMenu={() => setMobileSidebarOpen(true)} />

        <div className="flex-1">
          <MainContent />
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <InfrastructureProvider>
      <AppLayout />
    </InfrastructureProvider>
  );
}
