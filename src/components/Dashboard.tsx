import React, { useState } from 'react';
import { Plus, Search, MoreVertical, Trash2, Copy, ExternalLink, Clock, Bot, Filter, ChevronDown, ArrowUpDown, MessageSquare, Power } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Flow } from '../types';
import { Button } from './Button';

interface DashboardProps {
  flows: Flow[];
  onNewAgent: () => void;
  onOpenAgent: (id: string) => void;
  onDeleteAgent: (id: string) => void;
  onDuplicateAgent: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  flows,
  onNewAgent,
  onOpenAgent,
  onDeleteAgent,
  onDuplicateAgent,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <div className="flex-1 bg-[#F8F9FA] p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2">Agentes</h2>
          <p className="text-sm text-gray-500 max-w-2xl">
            Crea, edita y administra agentes para automatizar las conversaciones con tus clientes de manera inteligente.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Buscar por nombre del agente..."
                className="w-full pl-4 pr-12 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
              />
              <div className="absolute right-0 top-0 h-full w-12 flex items-center justify-center border-l border-gray-200">
                <Search className="w-5 h-5 text-[#1A1A1A]" />
              </div>
            </div>
          </div>

          <Button
            onClick={onNewAgent}
            variant="Primary"
            size="m"
            iconLeft={<Plus size={16} />}
          >
            Crear agente
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                <th className="px-6 py-4 text-sm font-bold text-[#1A1A1A]">Nombre</th>
                <th className="px-6 py-4 text-sm font-bold text-[#1A1A1A]">Estado</th>
                <th className="px-6 py-4 text-sm font-bold text-[#1A1A1A] flex items-center gap-1">
                  F. Última Edición
                  <ArrowUpDown className="w-3 h-3" />
                </th>
                <th className="px-6 py-4 text-sm font-bold text-[#1A1A1A]">Usuario del Último Cambio</th>
                <th className="px-6 py-4 text-sm font-bold text-[#1A1A1A] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {flows.length > 0 ? (
                flows.map((flow) => (
                  <tr 
                    key={flow.id} 
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all cursor-pointer group"
                    onClick={() => onOpenAgent(flow.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-sm font-bold text-[#1A1A1A]">{flow.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-[11px] font-bold rounded-full border ${
                        flow.status === 'publicado' || flow.status === 'activo'
                          ? "bg-green-50 text-green-600 border-green-100" 
                          : "bg-gray-50 text-gray-400 border-gray-100"
                      }`}>
                        {flow.status === 'publicado' ? 'Publicado' : flow.status === 'borrador' ? 'Borrador' : 'Activo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{flow.lastEdited}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{flow.lastModifiedBy || 'Maria Pereira'}</td>
                    <td className="px-6 py-4 text-right relative">
                      <div className="flex items-center justify-end">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === flow.id ? null : flow.id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        <AnimatePresence>
                          {openMenuId === flow.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                }}
                              />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-6 top-12 w-40 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden"
                              >
                                <Button
                                  type="button"
                                  variant="Tertiary"
                                  size="m"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDuplicateAgent(flow.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full !min-h-0 justify-start rounded-none px-4 py-2.5 text-sm font-normal text-fg-secondary hover:bg-bg-secondary"
                                  iconLeft={<Copy className="w-4 h-4" />}
                                >
                                  Duplicar
                                </Button>
                                <Button
                                  type="button"
                                  variant="Destructive Tertiary"
                                  size="m"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteAgent(flow.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full !min-h-0 justify-start rounded-none px-4 py-2.5 text-sm font-normal hover:bg-bg-status-error/10"
                                  iconLeft={<Power className="w-4 h-4" />}
                                >
                                  Desactivar
                                </Button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-32">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="relative mb-6">
                        <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center">
                          <div className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center">
                            <Bot className="w-12 h-12 text-gray-200" />
                          </div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-gray-100 rounded-full animate-pulse"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-gray-50 rounded-full"></div>
                        <div className="absolute top-4 right-4 w-8 h-8 bg-[#FF6B00] rounded-full flex items-center justify-center shadow-lg">
                          <Plus className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <p className="text-lg font-medium text-gray-400">No hay agentes disponibles.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 font-medium">Registros por página</span>
              <div className="relative">
                <select className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 transition-all">
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center gap-8">
              <span className="text-xs text-gray-500 font-medium">1 - {flows.length} de {flows.length} items</span>
              <div className="flex items-center gap-2">
                <Button variant="Tertiary" size="xs" disabled><ChevronDown className="w-4 h-4 rotate-90" /></Button>
                <Button variant="Tertiary" size="xs" disabled><ChevronDown className="w-4 h-4 rotate-180" /></Button>
                <Button variant="Tertiary" size="xs" disabled><ChevronDown className="w-4 h-4" /></Button>
                <Button variant="Tertiary" size="xs" disabled><ChevronDown className="w-4 h-4 -rotate-90" /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
