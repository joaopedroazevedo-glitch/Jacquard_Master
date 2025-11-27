import React from 'react';
import { Loom, LoomStatus } from '../types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface QuickStatusSummaryProps {
  looms: Loom[];
}

export const QuickStatusSummary: React.FC<QuickStatusSummaryProps> = ({ looms }) => {
  const runningCount = looms.filter(l => l.status === LoomStatus.RUNNING).length;
  // Strictly counting 'STOPPED' status to match the header stats and "Parados" label consistency
  const stoppedCount = looms.filter(l => l.status === LoomStatus.STOPPED).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Estado Rápido</h3>
      
      <div className="flex flex-col gap-3">
        {/* Productive Bar */}
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-xl text-green-900">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <span className="font-semibold text-base">Produtivos</span>
          </div>
          <span className="text-2xl font-bold text-green-700">{runningCount}</span>
        </div>

        {/* Stopped Bar */}
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl text-red-900">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <span className="font-semibold text-base">Parados</span>
          </div>
          <span className="text-2xl font-bold text-red-700">{stoppedCount}</span>
        </div>
      </div>
    </div>
  );
};
