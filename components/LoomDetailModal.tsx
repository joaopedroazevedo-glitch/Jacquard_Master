import React, { useState, useEffect } from 'react';
import { Loom, Article, LoomStatus } from '../types';
import { STATUS_TEXT_COLORS } from '../constants';
import { X, Save, Clock, User, FileText, Tag, Briefcase, Hash } from 'lucide-react';

interface LoomDetailModalProps {
  loom: Loom;
  articles: Article[];
  onSave: (updatedLoom: Loom) => void;
  onClose: () => void;
}

export const LoomDetailModal: React.FC<LoomDetailModalProps> = ({ loom, articles, onSave, onClose }) => {
  const [formData, setFormData] = useState<Loom>({ ...loom });
  // customDuration is now in HOURS string
  const [customDuration, setCustomDuration] = useState<string>('');

  // Initialize duration from planned minutes or calculate from start/end
  useEffect(() => {
    let minutes = loom.plannedDurationMinutes || 120; // Default 2h
    
    // If running, we might want to show remaining or total? 
    // Let's stick to showing the Total Planned Duration which is editable
    if (loom.status === LoomStatus.RUNNING && loom.startTime && loom.expectedEndTime) {
       const start = new Date(loom.startTime).getTime();
       const end = new Date(loom.expectedEndTime).getTime();
       minutes = Math.round((end - start) / 60000);
    }
    
    setCustomDuration((minutes / 60).toFixed(1).replace('.0', ''));
  }, [loom]);

  const handleStatusChange = (status: LoomStatus) => {
    // Just update status, time calculations happen on Save or when editing duration
    setFormData(prev => ({ ...prev, status }));
  };

  const handleArticleChange = (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    if (article) {
        setFormData(prev => ({ ...prev, articleId: articleId }));
        // Update input to article default (in Hours)
        setCustomDuration((article.defaultTimeMinutes / 60).toFixed(1).replace('.0', ''));
    }
  };

  const handleSaveInternal = () => {
     const durationMinutes = Math.round(Number(customDuration) * 60);
     const now = new Date();
     const updates: Partial<Loom> = {
         ...formData,
         plannedDurationMinutes: durationMinutes
     };

     // Logic: If transitioning TO Running or IS Running, update timestamps based on new duration
     // Or if we are just updating the duration while running
     if (formData.status === LoomStatus.RUNNING) {
         // If it WAS NOT running before, or if we want to reset/adjust time
         if (loom.status !== LoomStatus.RUNNING) {
             // Starting now
             updates.startTime = now.toISOString();
             updates.expectedEndTime = new Date(now.getTime() + durationMinutes * 60000).toISOString();
             updates.progress = 0;
         } else {
             // Already running, adjust End Time based on Start Time + New Duration
             if (formData.startTime) {
                 const start = new Date(formData.startTime).getTime();
                 updates.expectedEndTime = new Date(start + durationMinutes * 60000).toISOString();
             }
         }
     } else {
         // Not running, just clear active timestamps but keep planned duration
         // updates.startTime = null; // Optional: keep history or clear? Let's keep it simple.
         // updates.expectedEndTime = null;
     }

     onSave({ ...loom, ...updates });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">{formData.name}</h2>
                <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm text-gray-500">Estado Atual:</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${STATUS_TEXT_COLORS[formData.status]}`}>
                        {formData.status}
                    </span>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={24} className="text-gray-500" />
            </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto space-y-8 bg-white">
            
            {/* Status Section */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider block">Definir Estado da Máquina</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.values(LoomStatus).map((status) => (
                        <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            className={`px-4 py-3 text-sm font-medium rounded-xl border-2 transition-all duration-200 flex items-center justify-center text-center ${
                                formData.status === status 
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                                : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Client Info Group */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-5">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                        <Briefcase size={18} className="text-indigo-500" />
                        Dados do Cliente
                    </h3>
                    
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block ml-1">Cliente</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={formData.clientName}
                                onChange={e => setFormData({...formData, clientName: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-gray-800"
                                placeholder="Nome do Cliente"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block ml-1">Ordem de Fabrico (OF)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Hash size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={formData.internalOrderNumber}
                                onChange={e => setFormData({...formData, internalOrderNumber: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-gray-800"
                                placeholder="Ex: OF-2024..."
                            />
                        </div>
                    </div>
                </div>

                {/* Article Info Group */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-5">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                        <FileText size={18} className="text-indigo-500" />
                        Dados de Produção
                    </h3>
                    
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block ml-1">Artigo</label>
                        <select
                            value={formData.articleId || ''}
                            onChange={(e) => handleArticleChange(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-gray-800"
                        >
                            <option value="">Selecione um artigo...</option>
                            {articles.map(a => (
                                <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Manual override for duration - Always Visible now */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block ml-1">Tempo Previsto (Horas)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Clock size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="number"
                                step="0.1"
                                value={customDuration}
                                onChange={(e) => setCustomDuration(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="Ex: 1.5 para 1h 30m"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes Section - Full Width */}
            <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-100">
                <label className="text-sm font-bold text-yellow-800 flex items-center gap-2 mb-2 uppercase tracking-wide">
                    <Tag size={18} />
                    Descrição
                </label>
                <textarea
                    rows={3}
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full p-4 bg-white border-2 border-yellow-100 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none text-gray-700 placeholder-gray-400"
                    placeholder="Escreva aqui detalhes importantes sobre a paragem, problemas de qualidade ou notas para o próximo turno..."
                />
            </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 z-10">
            <button 
                onClick={onClose}
                className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors"
            >
                Cancelar
            </button>
            <button 
                onClick={handleSaveInternal}
                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 transform active:scale-95"
            >
                <Save size={20} />
                Guardar
            </button>
        </div>
      </div>
    </div>
  );
};