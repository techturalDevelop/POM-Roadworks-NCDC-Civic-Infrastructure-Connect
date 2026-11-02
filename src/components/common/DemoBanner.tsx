import React, { useState } from 'react';
import { AlertCircle, Info, X } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs border-b border-amber-600 font-medium">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-slate-950" />
          <p>
            <strong className="font-bold">UNVERIFIED DEMONSTRATION PROTOTYPE:</strong> Proposed digital platform for the National Capital District Commission (NCDC), Papua New Guinea. All roadworks, asset inventories, notices, and engineering reports are simulated demonstration records for architecture review. Not officially endorsed or connected to live government systems.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-950/70 hover:text-slate-950 p-1 shrink-0 rounded transition-colors"
          aria-label="Dismiss disclaimer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
