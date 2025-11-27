import React, { useState } from 'react';
import { Article } from '../types';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';

interface ArticleManagerProps {
  articles: Article[];
  onUpdateArticles: (articles: Article[]) => void;
  onClose: () => void;
}

export const ArticleManager: React.FC<ArticleManagerProps> = ({ articles, onUpdateArticles, onClose }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Article>>({});

  const handleEdit = (article: Article) => {
    setEditingId(article.id);
    setFormData(article);
  };

  const handleCreate = () => {
    setEditingId('new');
    setFormData({ code: '', name: '', defaultTimeMinutes: 120 }); // Default 2 hours
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem a certeza que deseja remover este artigo?')) {
      onUpdateArticles(articles.filter(a => a.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.code || !formData.name || !formData.defaultTimeMinutes) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    if (editingId === 'new') {
      const newArticle: Article = {
        id: Date.now().toString(),
        code: formData.code,
        name: formData.name,
        defaultTimeMinutes: Number(formData.defaultTimeMinutes)
      };
      onUpdateArticles([...articles, newArticle]);
    } else {
      onUpdateArticles(articles.map(a => a.id === editingId ? { ...a, ...formData } as Article : a));
    }
    setEditingId(null);
    setFormData({});
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Base de Dados de Artigos</h2>
            <p className="text-sm text-gray-500">Registo de artigos e tempos previstos</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Create New Button */}
          {!editingId && (
            <button 
              onClick={handleCreate}
              className="mb-6 flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
            >
              <Plus size={18} /> Novo Artigo
            </button>
          )}

          {/* Edit Form */}
          {editingId && (
            <div className="bg-indigo-50 p-6 rounded-xl mb-6 border border-indigo-100">
              <h3 className="font-semibold text-indigo-900 mb-4">{editingId === 'new' ? 'Criar Novo Artigo' : 'Editar Artigo'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-indigo-800 mb-1">Código</label>
                  <input 
                    type="text" 
                    value={formData.code || ''}
                    onChange={e => setFormData({...formData, code: e.target.value})}
                    className="w-full p-2 border border-indigo-200 rounded-md focus:ring-2 focus:ring-indigo-400 outline-none"
                    placeholder="Ex: JACQ-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-indigo-800 mb-1">Nome do Artigo</label>
                  <input 
                    type="text" 
                    value={formData.name || ''}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full p-2 border border-indigo-200 rounded-md focus:ring-2 focus:ring-indigo-400 outline-none"
                    placeholder="Descrição do tecido"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-indigo-800 mb-1">Tempo Previsto (Horas)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={formData.defaultTimeMinutes ? formData.defaultTimeMinutes / 60 : ''}
                    onChange={e => setFormData({...formData, defaultTimeMinutes: Math.round(Number(e.target.value) * 60)})}
                    className="w-full p-2 border border-indigo-200 rounded-md focus:ring-2 focus:ring-indigo-400 outline-none"
                    placeholder="Ex: 2.5"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setEditingId(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                  <Save size={16} /> Salvar
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
                <tr>
                  <th className="p-4">Código</th>
                  <th className="p-4">Nome</th>
                  <th className="p-4">Tempo Previsto</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {articles.map(article => (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-gray-700 font-medium">{article.code}</td>
                    <td className="p-4 text-gray-800">{article.name}</td>
                    <td className="p-4 text-gray-600">
                        {article.defaultTimeMinutes ? (article.defaultTimeMinutes / 60).toFixed(1).replace('.0', '') : 0} h
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => handleEdit(article)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(article.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {articles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500 italic">
                      Nenhum artigo registado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Footer with Explicit Close Button */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};