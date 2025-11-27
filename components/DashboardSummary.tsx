import React from 'react';
import { Loom, LoomStatus } from '../types';
import { BarChart3 } from 'lucide-react';

interface DashboardSummaryProps {
  looms: Loom[];
}

// Map internal status to display labels and colors
const STATUS_CONFIG: Record<string, { label: string; color: string; tailwindColor: string }> = {
  [LoomStatus.RUNNING]: { label: 'Operacional', color: '#22c55e', tailwindColor: 'bg-green-500' },
  [LoomStatus.STOPPED]: { label: 'Parado', color: '#ef4444', tailwindColor: 'bg-red-500' },
  [LoomStatus.MAINTENANCE]: { label: 'Manutenção', color: '#f97316', tailwindColor: 'bg-orange-500' },
  [LoomStatus.SETUP]: { label: 'Troca de Artigo', color: '#3b82f6', tailwindColor: 'bg-blue-500' },
  [LoomStatus.WAITING_MATERIAL]: { label: 'Aguardando Fio', color: '#facc15', tailwindColor: 'bg-yellow-400' },
  [LoomStatus.OFFLINE]: { label: 'Desligado', color: '#9ca3af', tailwindColor: 'bg-gray-400' },
};

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({ looms }) => {
  // Calculate counts and percentages
  const total = looms.length;
  const stats = looms.reduce((acc, loom) => {
    acc[loom.status] = (acc[loom.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Prepare segments for conic-gradient
  let currentAngle = 0;
  const segments: string[] = [];
  const legendItems: Array<{ label: string; count: number; color: string }> = [];

  // Order of display in legend/chart
  const displayOrder = [
    LoomStatus.MAINTENANCE,
    LoomStatus.RUNNING,
    LoomStatus.STOPPED,
    LoomStatus.SETUP,
    LoomStatus.WAITING_MATERIAL,
    LoomStatus.OFFLINE
  ];

  displayOrder.forEach(status => {
    const count = stats[status] || 0;
    if (count > 0) {
      const config = STATUS_CONFIG[status];
      const percentage = (count / total) * 100;
      const angle = (count / total) * 360;
      
      segments.push(`${config.color} ${currentAngle}deg ${currentAngle + angle}deg`);
      
      currentAngle += angle;
      legendItems.push({
        label: config.label,
        count: count,
        color: config.tailwindColor
      });
    }
  });

  const gradientString = `conic-gradient(${segments.join(', ')})`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="text-gray-700" size={20} />
        <h2 className="text-lg font-bold text-gray-800">Distribuição</h2>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
        {/* Chart */}
        <div className="relative w-48 h-48 flex-shrink-0">
          <div 
            className="w-full h-full rounded-full"
            style={{ background: segments.length > 0 ? gradientString : '#e5e7eb' }}
          ></div>
          {/* Inner Circle for Donut effect */}
          <div className="absolute inset-0 m-auto w-32 h-32 bg-white rounded-full flex items-center justify-center flex-col">
            <span className="text-3xl font-bold text-gray-800">{total}</span>
            <span className="text-xs text-gray-500 uppercase font-medium">Teares</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-x-8 gap-y-3">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2 min-w-[120px]">
              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-xs text-gray-500">{item.count} {item.count === 1 ? 'Tear' : 'Teares'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
