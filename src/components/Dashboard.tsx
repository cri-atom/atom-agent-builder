import React, { useState } from 'react';
import { Plus, Search, MoreVertical, Copy, Bot, ChevronDown, ArrowUpDown, Power } from 'lucide-react';
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
        <div className="table-page-card">
          <div className="table-shell">
            <table className="table">
            <thead>
              <tr className="table__head-row">
                <th className="table__th">Nombre</th>
                <th className="table__th">Estado</th>
                <th className="table__th">
                  <span className="table__th-sort-wrap">
                    F. Última Edición
                    <ArrowUpDown className="table__sort-icon" aria-hidden />
                  </span>
                </th>
                <th className="table__th">Usuario del Último Cambio</th>
                <th className="table__th table__th--end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {flows.length > 0 ? (
                flows.map((flow) => (
                  <tr 
                    key={flow.id} 
                    className="table__row cursor-pointer"
                    onClick={() => onOpenAgent(flow.id)}
                  >
                    <td className="table__td">
                      <div className="table__cell-lead">
                        <div className="table__avatar">
                          <Bot className="w-4 h-4" aria-hidden />
                        </div>
                        <span className="table__cell-title truncate">{flow.name}</span>
                      </div>
                    </td>
                    <td className="table__td">
                      <span
                        className={
                          flow.status === 'publicado' || flow.status === 'activo'
                            ? 'table__tag table__tag--success'
                            : 'table__tag table__tag--neutral'
                        }
                      >
                        {flow.status === 'publicado' ? 'Publicado' : flow.status === 'borrador' ? 'Borrador' : 'Activo'}
                      </span>
                    </td>
                    <td className="table__td table__cell-meta">{flow.lastEdited}</td>
                    <td className="table__td table__cell-meta">{flow.lastModifiedBy || 'Maria Pereira'}</td>
                    <td className="table__td table__td--end">
                      <div className="table__actions">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === flow.id ? null : flow.id);
                          }}
                          className="table__action-trigger"
                          aria-label="Más acciones"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        <AnimatePresence>
                          {openMenuId === flow.id && (
                            <>
                              <div 
                                className="table__row-menu-backdrop" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                }}
                              />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="table__row-menu"
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
                  <td colSpan={5} className="table__td table__td--stretch">
                    <div className="table__empty">
                      <div className="table__empty-visual">
                        <div className="table__empty-ring-outer">
                          <div className="table__empty-ring-inner">
                            <Bot className="table__empty-icon" aria-hidden />
                          </div>
                        </div>
                        <div className="table__empty-pulse" aria-hidden />
                        <div className="table__empty-orbit" aria-hidden />
                        <div className="table__empty-badge">
                          <Plus className="table__empty-badge-icon" aria-hidden />
                        </div>
                      </div>
                      <p className="table__empty-message">No hay agentes disponibles.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
          
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
