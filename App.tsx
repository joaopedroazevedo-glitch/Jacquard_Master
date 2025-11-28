import React, { useState, useEffect } from 'react';
import { INITIAL_LOOMS, INITIAL_ARTICLES, STATUS_COLORS, STATUS_TEXT_COLORS } from './constants';
import { Loom, Article, LoomStatus } from './types';
import { LayoutGrid, RefreshCw, AlertCircle, Clock, User, Tag, Hash } from 'lucide-react';
import { LoomDetailModal } from './components/LoomDetailModal';
import { DashboardSummary } from './components/DashboardSummary';

const App = () => {
  // Initialize state from LocalStorage if available, otherwise use defaults
  // Also recalculate progress immediately to account for time passed while closed
  const [looms, setLooms] = useState<Loom[]>(() => {
    try {
      const saved = localStorage.getItem('jacquard_looms');
      if (saved) {
        const parsedLooms: Loom[] = JSON.parse(saved);
        // Recalculate progress on load
        return parsedLooms.map(loom => {
          if (loom.status === LoomStatus.RUNNING && loom.startTime && loom.expectedEndTime) {
            const start = new Date(loom.startTime).getTime();
            const end = new Date(loom.expectedEndTime).getTime();
            const now = new Date().getTime();
            const total = end - start;
            const elapsed = now - start;
            let progress = Math.floor((elapsed / total) * 100);
            if (progress > 100) progress = 100;
            if (progress < 0) progress = 0;
            return { ...loom, progress };
          }
          return loom;
        });
      }
    } catch (e) {
      console.error("Erro ao carregar dados locais:", e);
    }
    return INITIAL_LOOMS;
  });

  // setArticles is unused without ArticleManager, so we omit it to avoid linter warnings
  const [articles] = useState<Article[]>(INITIAL_ARTICLES);
  const [selectedLoom, setSelectedLoom] = useState<Loom | null>(null);

  // Persist looms to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem('jacquard_looms', JSON.stringify(looms));
  }, [looms]);
  
  // Timer to update progress bars every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setLooms(currentLooms => 
        currentLooms.map(loom => {
          if (loom.status === LoomStatus.RUNNING && loom.startTime && loom.expectedEndTime) {
            const start = new Date(loom.startTime).getTime();
            const end = new Date(loom.expectedEndTime).getTime();
            const now = new Date().getTime();
            const total = end - start;
            const elapsed = now - start;
            let progress = Math.floor((elapsed / total) * 100);
            if (progress > 100) progress = 100;
            if (progress < 0) progress = 0;
            return { ...loom, progress };
          }
          return loom;
        })
      );
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleLoomClick = (loom: Loom) => {
    setSelectedLoom(loom);
  };

  const handleLoomSave = (updatedLoom: Loom) => {
    setLooms(prev => prev.map(l => l.id === updatedLoom.id ? updatedLoom : l));
    setSelectedLoom(null);
  };

  const getArticleName = (id: string | null) => {
    if (!id) return '---';
    return articles.find(a => a.id === id)?.name || 'Artigo Desconhecido';
  };

  const calculateTimeRemaining = (loom: Loom) => {
    if (loom.status !== LoomStatus.RUNNING || !loom.expectedEndTime) return null;
    const now = new Date();
    const end = new Date(loom.expectedEndTime);
    const diffMs = end.getTime() - now.getTime();
    if (diffMs <= 0) return 'Concluído';
    
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Stats
  const runningCount = looms.filter(l => l.status === LoomStatus.RUNNING).length;
  const stoppedCount = looms.filter(l => l.status === LoomStatus.STOPPED).length;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <LayoutGrid className="text-white w-6 h-6" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">JacquardMaster</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Sistema de Gestão de Produção Têxtil</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-4 text-sm mr-4 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
                <span className="flex items-center gap-1.5 text-green-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Em Produção: {runningCount}
                </span>
                <span className="w-px h-4 bg-gray-300"></span>
                <span className="flex items-center gap-1.5 text-red-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Parados: {stoppedCount}
                </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Looms Grid - Middle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {looms.map((loom) => {
             const timeRemaining = calculateTimeRemaining(loom);
             return (
              <div 
                key={loom.id}
                onClick={() => handleLoomClick(loom)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer group flex flex-col overflow-hidden relative"
              >
                {/* Status Indicator Stripe */}
                <div className={`h-1.5 w-full ${STATUS_COLORS[loom.status]}`}></div>
                
                <div className="p-5 flex-1 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors">
                            {loom.name}
                        </h3>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${STATUS_TEXT_COLORS[loom.status]} border-opacity-20`}>
                            {loom.status}
                        </span>
                    </div>

                    <div className="space-y-3 text-sm text-gray-600">
                        {/* Client & OF Row */}
                        <div className="flex flex-col gap-1">
                             <div className="flex items-center gap-2 text-gray-900 font-medium">
                                 <User size={14} className="text-gray-400" />
                                 <span className="truncate">{loom.clientName || '-'}</span>
                             </div>
                             <div className="flex items-center gap-2">
                                 <Hash size={14} className="text-gray-400" />
                                 <span className="font-mono text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">{loom.internalOrderNumber || '-'}</span>
                             </div>
                        </div>

                        {/* Article Box */}
                        <div className="bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-50">
                            <span className="text-[10px] uppercase text-indigo-400 font-bold mb-0.5 block">Artigo Atual</span>
                            <span className="font-medium text-indigo-900 line-clamp-1">{getArticleName(loom.articleId)}</span>
                        </div>

                        {/* Situation/Notes */}
                        {loom.notes && (
                            <div className="mt-1 p-2.5 bg-yellow-50 border border-yellow-100 rounded-md text-xs text-gray-700 relative">
                                <span className="absolute top-2 left-2 text-yellow-500"><Tag size={12} /></span>
                                <p className="pl-5 italic line-clamp-2 leading-relaxed font-medium text-yellow-800">{loom.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer / Progress */}
                {loom.status === LoomStatus.RUNNING && (
                     <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5">
                            <span className="flex items-center gap-1"><RefreshCw size={10}/> {loom.progress}%</span>
                            <span className="flex items-center gap-1 text-indigo-600"><Clock size={10}/> {timeRemaining}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className={`h-1.5 rounded-full transition-all duration-1000 ${
                                    loom.progress > 90 ? 'bg-orange-500' : 'bg-green-500'
                                }`} 
                                style={{ width: `${loom.progress}%` }}
                            ></div>
                        </div>
                     </div>
                )}
                {loom.status !== LoomStatus.RUNNING && (
                     <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 text-center h-[58px] flex items-center justify-center">
                         <span className="text-xs text-gray-400 font-medium flex items-center justify-center gap-1 opacity-70">
                            <AlertCircle size={12}/> Aguardando Ação
                         </span>
                     </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Dashboard Summary - Bottom */}
        <DashboardSummary looms={looms} />

      </main>

      {/* Modals */}
      {selectedLoom && (
        <LoomDetailModal 
            loom={selectedLoom} 
            articles={articles}
            onSave={handleLoomSave}
            onClose={() => setSelectedLoom(null)} 
        />
      )}
    </div>
  );
};

export default App;