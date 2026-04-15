import React, { useState } from 'react';
import { X, Plus, Trash2, ChevronDown, ChevronLeft, ChevronRight, Search, Ban } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlobalConfig, GlobalStage, SaveField } from '../types';
import { Button } from './Button';
import {
  PanelSection,
  PipelineTypeTabs,
  PanelEmptyState,
  CollapsibleSectionHeader,
  GlobalConfigOpenButton,
} from './panel';

interface GlobalConfigPanelProps {
  config: GlobalConfig;
  onUpdate: (config: GlobalConfig) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const formTextareaClass =
  'w-full min-h-[120px] resize-none rounded-[var(--radius-s)] border border-border-secondary bg-bg-primary px-[var(--spacing-sm)] py-[var(--spacing-s)] caption text-fg-primary outline-none transition-colors focus:border-[var(--color-border-interactive-secondary-focused)] focus:ring-2 focus:ring-[var(--color-alpha-400)]';

const formSelectClass =
  'w-full appearance-none rounded-[var(--radius-s)] border border-border-secondary bg-bg-primary px-[var(--spacing-sm)] py-[var(--spacing-s)] caption text-fg-primary outline-none transition-colors focus:border-[var(--color-border-interactive-secondary-focused)] focus:ring-2 focus:ring-[var(--color-alpha-400)]';

const formInputClass =
  'w-full rounded-[var(--radius-s)] border border-border-secondary bg-bg-primary px-[var(--spacing-sm)] py-[var(--spacing-s)] caption text-fg-primary outline-none transition-colors focus:border-[var(--color-border-interactive-secondary-focused)] focus:ring-2 focus:ring-[var(--color-alpha-400)]';

/** Panel width (px); positioning lives on the parent in Canvas. */
export const GLOBAL_CONFIG_PANEL_WIDTH_PX = 382;

export const GlobalConfigPanel: React.FC<GlobalConfigPanelProps> = ({
  config,
  onUpdate,
  isOpen,
  onToggle,
}) => {
  const [isSaveFieldsOpen, setIsSaveFieldsOpen] = useState(true);
  const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState<string | null>(null);
  const [fieldSearch, setFieldSearch] = useState('');

  const STAGE_ORDER = ['Awareness', 'Lead', 'MQL', 'SQL', 'Opportunity', '-'];

  const handleUpdate = (field: keyof GlobalConfig, value: unknown) => {
    onUpdate({ ...config, [field]: value });
  };

  const currentStages = config.pipelineType === 'venta' ? config.stagesVenta : config.stagesServicio;
  const stagesField = config.pipelineType === 'venta' ? 'stagesVenta' : 'stagesServicio';

  const sortedStages = [...currentStages].sort(
    (a, b) => STAGE_ORDER.indexOf(a.type) - STAGE_ORDER.indexOf(b.type)
  );

  const availableTypes = STAGE_ORDER.filter((type) => !currentStages.some((s) => s.type === type));

  const addStage = () => {
    const newStage: GlobalStage = {
      id: Math.random().toString(36).substr(2, 9),
      name: availableTypes.length > 0 ? availableTypes[0] : 'Nueva Etapa',
      type: (availableTypes.length > 0 ? availableTypes[0] : '-') as GlobalStage['type'],
      condition: '',
    };
    handleUpdate(stagesField, [...currentStages, newStage]);
  };

  const updateStage = (id: string, updates: Partial<GlobalStage>) => {
    handleUpdate(
      stagesField,
      currentStages.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const removeStage = (id: string) => {
    handleUpdate(
      stagesField,
      currentStages.filter((s) => s.id !== id)
    );
  };

  const addSaveField = () => {
    const newField: SaveField = {
      id: Math.random().toString(36).substr(2, 9),
      label: 'Seleccionar campo',
      description: '',
      type: 'required',
      dataType: 'string',
    };
    handleUpdate('saveFields', [...(config.saveFields || []), newField]);
  };

  const removeSaveField = (id: string) => {
    handleUpdate(
      'saveFields',
      config.saveFields.filter((f: SaveField) => f.id !== id)
    );
  };

  const emptyStagesMessage =
    config.pipelineType === 'venta'
      ? 'No hay etapas definidas para el pipeline de venta.'
      : 'No hay servicios definidos para el pipeline de servicio.';

  const addStageLabel = config.pipelineType === 'venta' ? 'Agregar venta' : 'Agregar servicio';

  return (
    <div
      className={`relative flex h-full min-h-0 w-max max-w-full ${!isOpen ? 'min-w-8' : ''}`}
    >
      {!isOpen && (
        <GlobalConfigOpenButton onClick={onToggle} className="absolute left-0 top-0 z-40" />
      )}

      {/* Global Config Panel */}
      <motion.div
        initial={false}
        animate={{
          width: isOpen ? GLOBAL_CONFIG_PANEL_WIDTH_PX : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="flex h-full max-h-full min-h-0 flex-col overflow-hidden rounded-[var(--radius-m)] border border-border-tertiary bg-bg-primary shadow-[0px_6px_14px_0px_rgba(9,9,11,0.08)]"
      >
          {isOpen && (
            <>
              <header className="flex shrink-0 items-center gap-[var(--spacing-s)] border-b border-border-tertiary px-[var(--spacing-m)] py-[var(--spacing-s)]">
                <h2 className="min-w-0 flex-1 caption font-bold text-fg-primary">Configuración global</h2>
                <Button variant="Tertiary" size="s" type="button" onClick={onToggle}>
                  <X className="size-4 text-fg-secondary" />
                </Button>
              </header>

              {/* Scrollable content body del panel */}
              <div className="custom-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto">

                {/* Seccion Instrucciones generales */}
                <PanelSection title="Instrucciones generales">
                  <textarea
                    value={config.generalInstructions}
                    onChange={(e) => handleUpdate('generalInstructions', e.target.value)}
                    className={formTextareaClass}
                    placeholder="Aplican a todos los agentes del flujo (estilo, tono, etc.)..."
                  />
                </PanelSection>

                {/* Seccion Etapas */}
                <PanelSection title="Etapas" contentClassName="flex flex-col gap-[var(--spacing-s)]">
                  <PipelineTypeTabs
                    value={config.pipelineType}
                    onChange={(v) => handleUpdate('pipelineType', v)}
                  />

                  <div className="flex flex-col gap-[var(--spacing-s)]">
                    <AnimatePresence mode="popLayout">
                      {sortedStages.map((stage) => (
                        <motion.div
                          key={stage.id}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          layout
                          className="relative space-y-3 rounded-[var(--radius-m)] border border-border-tertiary bg-bg-secondary p-4 group"
                        >
                          <button
                            type="button"
                            onClick={() => removeStage(stage.id)}
                            className="absolute right-3 top-3 rounded-md p-1.5 text-fg-quaternary opacity-0 transition-all hover:text-fg-status-error group-hover:opacity-100"
                          >
                            <Trash2 className="size-4" />
                          </button>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="label font-medium text-fg-tertiary">Nombre en Atom</label>
                              <div className="relative">
                                <select
                                  value={stage.type}
                                  onChange={(e) =>
                                    updateStage(stage.id, { type: e.target.value as GlobalStage['type'] })
                                  }
                                  className={formSelectClass}
                                >
                                  {STAGE_ORDER.map((type) => {
                                    const isUsed =
                                      type !== '-' &&
                                      currentStages.some((s) => s.type === type && s.id !== stage.id);
                                    return (
                                      <option key={type} value={type} disabled={isUsed}>
                                        {type} {isUsed ? '(Ya usado)' : ''}
                                      </option>
                                    );
                                  })}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-fg-quaternary" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="label font-medium text-fg-tertiary">Nombre de la etapa</label>
                              <input
                                type="text"
                                value={stage.name}
                                onChange={(e) => updateStage(stage.id, { name: e.target.value })}
                                className={formInputClass}
                                placeholder="Nombre de la etapa"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="label font-medium text-fg-tertiary">Condición para guardar</label>
                            <input
                              type="text"
                              value={stage.condition}
                              onChange={(e) => updateStage(stage.id, { condition: e.target.value })}
                              className={formInputClass}
                              placeholder="Ej: Si el usuario muestra interés..."
                            />
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {currentStages.length === 0 && (
                      <PanelEmptyState icon={<Ban className="size-4" strokeWidth={2} />}>
                        {emptyStagesMessage}
                      </PanelEmptyState>
                    )}

                    {/* Button Agregar stage */}
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="Secondary"
                        size="s"
                        onClick={addStage}
                        className="w-full"
                        iconLeft={<Plus className="size-4" />}
                      >
                        {addStageLabel}
                      </Button>
                    </div>

                  </div>
                </PanelSection>

                {/* Seccion Campos a identificar y guardar */}
                <div className="border-b border-border-tertiary">
                  <CollapsibleSectionHeader
                    title="Campos a identificar y guardar"
                    isOpen={isSaveFieldsOpen}
                    onToggle={() => setIsSaveFieldsOpen(!isSaveFieldsOpen)}
                  />
                  <AnimatePresence initial={false}>
                    {isSaveFieldsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="flex flex-col gap-[var(--spacing-s)] px-[var(--spacing-m)] pb-[var(--spacing-m)] pt-0">
                          <p className="label font-normal text-fg-quaternary">
                            Define qué información debe identificar y guardar el agente si el cliente la menciona
                            durante la conversación.
                          </p>

                          <div className="flex flex-col gap-3">
                            {config.saveFields?.length > 0 && (
                              <div className="flex items-center gap-3 border-b border-border-tertiary pb-2">
                                <div className="flex-1 label font-medium text-fg-tertiary">Campo a identificar</div>
                                <div className="w-10" />
                              </div>
                            )}

                            {config.saveFields?.map((field: SaveField) => (
                              // Field row. Todo el select con botton trash
                              <div key={field.id} className="flex items-center gap-3">
                                {/* Select */}
                                <div className="relative min-w-0 flex-1">
                                  <Button
                                    type="button"
                                    variant="Secondary"
                                    size="m"
                                    onClick={() => setIsFieldDropdownOpen(field.id)}
                                    className="w-full justify-between rounded-[var(--radius-s)] border-border-secondary bg-bg-primary font-normal shadow-none label text-fg-primary hover:border-primary/40"
                                    iconRight={<ChevronDown className="size-4 shrink-0 text-fg-quaternary" />}
                                  >
                                    <span className="truncate">{field.label}</span>
                                  </Button>

                                  {/* Dropdown Seleccionar campos */}
                                  <AnimatePresence>
                                    {isFieldDropdownOpen === field.id && (
                                      <>
                                        <div
                                          className="fixed inset-0 z-40"
                                          onClick={() => setIsFieldDropdownOpen(null)}
                                          aria-hidden
                                        />
                                        <motion.div
                                          initial={{ opacity: 0, y: 4 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: 4 }}
                                          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-[var(--radius-m)] border border-border-tertiary bg-bg-primary shadow-xl"
                                        >
                                          <div className="flex items-center gap-2 border-b border-border-tertiary p-2">
                                            <Search className="size-4 text-fg-quaternary" />
                                            <input
                                              type="text"
                                              value={fieldSearch}
                                              onChange={(e) => setFieldSearch(e.target.value)}
                                              placeholder="Buscar campo..."
                                              className={formInputClass}
                                              autoFocus
                                            />
                                          </div>
                                          <div className="max-h-48 overflow-y-auto">
                                            {['Nombre', 'Apellido', 'Email', 'Teléfono', 'Empresa', 'Dirección', 'Ciudad', 'País']
                                              .filter((f) => f.toLowerCase().includes(fieldSearch.toLowerCase()))
                                              .map((f) => (
                                                <Button
                                                  key={f}
                                                  type="button"
                                                  variant="Tertiary"
                                                  size="s"
                                                  onClick={() => {
                                                    const newFields = (config.saveFields || []).map((sf: SaveField) =>
                                                      sf.id === field.id ? { ...sf, label: f, type: 'optional' } : sf
                                                    );
                                                    handleUpdate('saveFields', newFields);
                                                    setIsFieldDropdownOpen(null);
                                                    setFieldSearch('');
                                                  }}
                                                  className="w-full justify-start rounded-none border-0 px-4 py-2.5 font-normal shadow-none label text-fg-primary hover:bg-bg-secondary"
                                                >
                                                  {f}
                                                </Button>
                                              ))}
                                          </div>
                                        </motion.div>
                                      </>
                                    )}
                                  </AnimatePresence>
                                </div>

                                {/* Button Trash */}
                                <button
                                  type="button"
                                  onClick={() => removeSaveField(field.id)}
                                  className="rounded-md p-2 text-fg-quaternary transition-colors hover:text-fg-status-error"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Button Agregar campo */}
                          <div className="flex justify-center">
                            <Button
                              type="button"
                              variant="Secondary"
                              size="s"
                              onClick={addSaveField}
                              iconLeft={<Plus className="size-4" />}
                              className="w-full"
                            >
                              Agregar campo
                            </Button>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <PanelSection title="Zona horaria">
                  <div className="relative">
                    <select
                      value={config.timezone}
                      onChange={(e) => handleUpdate('timezone', e.target.value)}
                      className={formSelectClass}
                    >
                      <option value="Argentina - Buenos Aires">Argentina - Buenos Aires</option>
                      <option value="USA - New York">USA - New York</option>
                      <option value="UK - London">UK - London</option>
                      <option value="Spain - Madrid">Spain - Madrid</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-fg-quaternary" />
                  </div>
                </PanelSection>
              </div>
            </>
          )}
      </motion.div>
    </div>
  );
};
