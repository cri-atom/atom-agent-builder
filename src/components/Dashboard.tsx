import React, { useState } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Copy,
  Bot,
  ChevronDown,
  Power,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from 'lucide-react';
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
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(flows.length / pageSize));
  const currentPage = 1;

  return (
    <div className="dashboard-agents flex min-h-0 flex-1 flex-col bg-bg-secondary p-4">
      <div className="dashboard-agents__card flex min-h-0 flex-1 flex-col overflow-hidden rounded-s bg-bg-primary">
        <header className="shrink-0 px-4 pt-4">
          <h2 className="text-base font-bold leading-6 text-fg-primary">Agentes</h2>
          <p className="mt-1 max-w-2xl text-xs leading-4 text-fg-secondary">
            Crea, edita y administra agentes para automatizar las conversaciones con tus clientes de manera
            inteligente.
          </p>
        </header>

        <div className="flex shrink-0 items-center justify-between gap-4 p-4">
          <Button
            type="button"
            variant="Secondary"
            size="m"
            iconLeft={<Search className="size-4" aria-hidden />}
            className="shrink-0 !px-2"
            aria-label="Buscar agentes"
          >
            <span className="sr-only">Buscar</span>
          </Button>
          <Button
            type="button"
            onClick={onNewAgent}
            variant="Primary"
            size="m"
            iconLeft={<Plus size={16} />}
            className="shrink-0"
          >
            Crear agente
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="dashboard-agents__table-scroll">
            <div className="table-shell">
              <table className="table table--agents table--min-scroll">
                <thead>
                  <tr className="table__head-row">
                    <th className="table__th">Nombre</th>
                    <th className="table__th table__th--col-estado">Estado</th>
                    <th className="table__th table__th--col-fecha">F. Última edición</th>
                    <th className="table__th table__th--col-usuario">Usuario</th>
                    <th className="table__th table__th--end table__th--col-acciones">Acciones</th>
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
                              <Bot className="h-4 w-4" aria-hidden />
                            </div>
                            <span className="table__cell-title truncate">{flow.name}</span>
                          </div>
                        </td>
                        <td className="table__td table__td--col-estado">
                          <span
                            className={
                              flow.status === 'publicado' || flow.status === 'activo'
                                ? 'table__tag table__tag--success'
                                : 'table__tag table__tag--neutral'
                            }
                          >
                            {flow.status === 'publicado'
                              ? 'Publicado'
                              : flow.status === 'borrador'
                                ? 'Borrador'
                                : 'Activo'}
                          </span>
                        </td>
                        <td className="table__td table__cell-meta table__td--col-fecha">{flow.lastEdited}</td>
                        <td className="table__td table__cell-meta table__td--col-usuario">
                          {flow.lastModifiedBy || 'Maria Pereira'}
                        </td>
                        <td className="table__td table__td--end table__td--col-acciones">
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
                              <MoreVertical className="h-4 w-4" />
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
                                      iconLeft={<Copy className="h-4 w-4" />}
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
                                      iconLeft={<Power className="h-4 w-4" />}
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
          </div>

          <div className="dashboard-agents__pagination">
            <div className="dashboard-agents__pagination-start">
              <span className="label text-fg-primary">Registros por página</span>
              <div className="dashboard-agents__page-size-wrap">
                <select
                  className="dashboard-agents__page-size"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  aria-label="Registros por página"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDown className="dashboard-agents__page-size-chevron" aria-hidden />
              </div>
            </div>
            <div className="dashboard-agents__pagination-center">
              <p className="label text-fg-primary">
                Página {currentPage} de {totalPages}
              </p>
            </div>
            <div className="dashboard-agents__pagination-end">
              <Button type="button" variant="Secondary" size="m" disabled className="!p-2" aria-label="Primera página">
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button type="button" variant="Secondary" size="m" disabled className="!p-2" aria-label="Página anterior">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button type="button" variant="Secondary" size="m" disabled className="!p-2" aria-label="Página siguiente">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button type="button" variant="Secondary" size="m" disabled className="!p-2" aria-label="Última página">
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
