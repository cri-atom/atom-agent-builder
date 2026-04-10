import React, { useState } from 'react';
import { X, Globe, MessageSquare, Layers, Tag, Plus, Trash2, ChevronDown, ChevronRight, ChevronLeft, Save, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlobalConfig, GlobalStage, GlobalTag, SaveField } from '../types';
import { Button } from './Button';

interface GlobalConfigPanelProps {
  config: GlobalConfig;
  onUpdate: (config: GlobalConfig) => void;
  isOpen: boolean;
  onToggle: () => void;
}

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

  const handleUpdate = (field: keyof GlobalConfig, value: any) => {
    onUpdate({ ...config, [field]: value });
  };

  const currentStages = config.pipelineType === 'venta' ? config.stagesVenta : config.stagesServicio;
  const stagesField = config.pipelineType === 'venta' ? 'stagesVenta' : 'stagesServicio';

  const sortedStages = [...currentStages].sort((a, b) => 
    STAGE_ORDER.indexOf(a.type) - STAGE_ORDER.indexOf(b.type)
  );

  const availableTypes = STAGE_ORDER.filter(type => !currentStages.some(s => s.type === type));

  const addStage = () => {
    const newStage: GlobalStage = {
      id: Math.random().toString(36).substr(2, 9),
      name: availableTypes.length > 0 ? availableTypes[0] : 'Nueva Etapa',
      type: (availableTypes.length > 0 ? availableTypes[0] : '-') as any,
      condition: '',
    };
    handleUpdate(stagesField, [...currentStages, newStage]);
  };

  const updateStage = (id: string, updates: Partial<GlobalStage>) => {
    handleUpdate(stagesField, currentStages.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeStage = (id: string) => {
    handleUpdate(stagesField, currentStages.filter(s => s.id !== id));
  };

  const addTag = () => {
    const newTag: GlobalTag = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Nueva Etapa Custom',
      condition: '',
    };
    handleUpdate('tags', [...config.tags, newTag]);
  };

  const updateTag = (id: string, updates: Partial<GlobalTag>) => {
    handleUpdate('tags', config.tags.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const removeTag = (id: string) => {
    handleUpdate('tags', config.tags.filter(t => t.id !== id));
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
    handleUpdate('saveFields', config.saveFields.filter((f: SaveField) => f.id !== id));
  };

  return (
    <div className="relative flex h-full shrink-0">
      <motion.div
        initial={false}
        animate={{ 
          width: isOpen ? 400 : 0,
          opacity: isOpen ? 1 : 0,
          marginRight: isOpen ? 0 : -20
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="h-full bg-bg-primary border-r border-border-tertiary flex flex-col overflow-hidden shadow-xl z-20"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-tertiary flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="h2 text-fg-primary whitespace-nowrap">Configuración Global</h2>
              <p className="caption text-fg-tertiary whitespace-nowrap">Afecta a todo el flujo</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar min-w-[400px]">
          {/* General Instructions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <MessageSquare className="w-4 h-4 text-fg-tertiary" />
              <h3 className="label font-bold text-fg-tertiary uppercase tracking-wider">Instrucciones Generales</h3>
            </div>
            <textarea
              value={config.generalInstructions}
              onChange={(e) => handleUpdate('generalInstructions', e.target.value)}
              className="w-full bg-bg-secondary border border-border-tertiary rounded-xl px-4 py-3 caption text-fg-primary focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[120px] resize-none"
              placeholder="Estas instrucciones aplicarán a todos los agentes del flujo (estilo, tono, etc.)..."
            />
          </div>

          {/* Stages */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-fg-tertiary" />
                <h3 className="label font-bold text-fg-tertiary uppercase tracking-wider">Etapas</h3>
              </div>
              <Button
                type="button"
                variant="Tertiary"
                size="s"
                onClick={addStage}
                className="border-0 p-0 font-normal uppercase shadow-none label-small font-bold text-primary hover:text-primary/80 hover:bg-transparent"
                iconLeft={<Plus className="h-4 w-4 rounded-full border-2 border-primary p-0.5" />}
              >
                Agregar
              </Button>
            </div>

            {/* Pipeline Type Selector inside Stages */}
            <div className="flex gap-2 rounded-xl border border-border-tertiary bg-bg-secondary p-1">
              <Button
                type="button"
                variant="Tertiary"
                size="s"
                onClick={() => handleUpdate('pipelineType', 'venta')}
                className={`flex-1 rounded-lg border-0 py-1.5 font-bold shadow-none label-small ${
                  config.pipelineType === 'venta'
                    ? 'bg-bg-primary text-primary shadow-sm'
                    : 'text-fg-tertiary hover:bg-transparent hover:text-fg-secondary'
                }`}
              >
                Venta
              </Button>
              <Button
                type="button"
                variant="Tertiary"
                size="s"
                onClick={() => handleUpdate('pipelineType', 'servicio')}
                className={`flex-1 rounded-lg border-0 py-1.5 font-bold shadow-none label-small ${
                  config.pipelineType === 'servicio'
                    ? 'bg-bg-primary text-primary shadow-sm'
                    : 'text-fg-tertiary hover:bg-transparent hover:text-fg-secondary'
                }`}
              >
                Servicio
              </Button>
            </div>
            
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {sortedStages.map((stage) => (
                  <motion.div 
                    key={stage.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    className="p-4 bg-bg-secondary border border-border-tertiary rounded-2xl space-y-3 relative group"
                  >
                    <button 
                      onClick={() => removeStage(stage.id)}
                      className="absolute top-4 right-4 p-1.5 text-fg-tertiary hover:text-fg-status-error opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="label-small text-fg-tertiary uppercase">Nombre en Atom</label>
                        <div className="relative">
                          <select
                            value={stage.type}
                            onChange={(e) => updateStage(stage.id, { type: e.target.value as any })}
                            className="w-full bg-bg-primary border border-border-tertiary rounded-lg px-3 py-2 caption text-fg-primary focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                          >
                            {STAGE_ORDER.map(type => {
                              const isUsed = type !== '-' && currentStages.some(s => s.type === type && s.id !== stage.id);
                              return (
                                <option key={type} value={type} disabled={isUsed}>
                                  {type} {isUsed ? '(Ya usado)' : ''}
                                </option>
                              );
                            })}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-fg-tertiary pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="label-small text-fg-tertiary uppercase">Nombre de la etapa</label>
                        <input
                          type="text"
                          value={stage.name}
                          onChange={(e) => updateStage(stage.id, { name: e.target.value })}
                          className="w-full bg-bg-primary border border-border-tertiary rounded-lg px-3 py-2 caption text-fg-primary focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          placeholder="Nombre de la etapa"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="label-small text-fg-tertiary uppercase">Condición para guardar</label>
                      <input
                        type="text"
                        value={stage.condition}
                        onChange={(e) => updateStage(stage.id, { condition: e.target.value })}
                        className="w-full bg-bg-primary border border-border-tertiary rounded-lg px-3 py-2 caption text-fg-primary focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="Ej: Si el usuario muestra interés..."
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {currentStages.length === 0 && (
                <div className="p-8 bg-bg-secondary border border-dashed border-border-tertiary rounded-2xl text-center">
                  <p className="caption text-fg-tertiary italic">No hay etapas definidas para el pipeline de {config.pipelineType}.</p>
                </div>
              )}
            </div>
          </div>

          {/* Save Fields */}
          <div className="pt-4 border-t border-border-tertiary">
            <Button
              type="button"
              variant="Tertiary"
              size="m"
              onClick={() => setIsSaveFieldsOpen(!isSaveFieldsOpen)}
              className="group w-full !min-h-0 justify-between rounded-none border-0 p-0 font-normal shadow-none"
              iconLeft={
                <Save className="h-4 w-4 shrink-0 text-fg-tertiary transition-colors group-hover:text-primary" />
              }
              iconRight={
                isSaveFieldsOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-fg-tertiary" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-fg-tertiary" />
                )
              }
            >
              <span className="label font-bold uppercase text-fg-tertiary transition-colors group-hover:text-fg-primary">
                Campos a identificar y guardar
              </span>
            </Button>

            <AnimatePresence>
              {isSaveFieldsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <div className="space-y-4 pt-4">
                    <p className="caption text-fg-tertiary">
                      Define qué información debe identificar y guardar el agente si el cliente la menciona durante la conversación.
                    </p>

                    {/* Fields List */}
                    <div className="space-y-3">
                      {config.saveFields?.length > 0 && (
                        <div className="flex items-center gap-3 px-1 pb-2 border-b border-border-tertiary">
                          <div className="flex-1 label-small font-bold text-fg-tertiary uppercase">Campo a identificar</div>
                          <div className="w-10" />
                        </div>
                      )}

                      {config.saveFields?.map((field: SaveField) => (
                        <div key={field.id} className="flex items-center gap-3">
                          <div className="flex-1 relative">
                            <Button
                              type="button"
                              variant="Secondary"
                              size="m"
                              onClick={() => setIsFieldDropdownOpen(field.id)}
                              className="w-full justify-between rounded-xl border-border-tertiary bg-white font-normal shadow-none label text-fg-primary hover:border-primary/50"
                              iconRight={<ChevronDown className="h-4 w-4 shrink-0 text-fg-tertiary" />}
                            >
                              <span className="truncate">{field.label}</span>
                            </Button>

                            <AnimatePresence>
                              {isFieldDropdownOpen === field.id && (
                                <>
                                  <div className="fixed inset-0 z-40" onClick={() => setIsFieldDropdownOpen(null)} />
                                  <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-border-tertiary rounded-xl shadow-xl z-50 overflow-hidden"
                                  >
                                    <div className="p-2 border-b border-border-tertiary flex items-center gap-2">
                                      <Search className="w-4 h-4 text-fg-tertiary" />
                                      <input
                                        type="text"
                                        value={fieldSearch}
                                        onChange={(e) => setFieldSearch(e.target.value)}
                                        placeholder="Buscar campo..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 label p-0 text-fg-primary"
                                        autoFocus
                                      />
                                    </div>
                                    <div className="max-h-48 overflow-y-auto">
                                      {['Nombre', 'Apellido', 'Email', 'Teléfono', 'Empresa', 'Dirección', 'Ciudad', 'País'].filter(f => f.toLowerCase().includes(fieldSearch.toLowerCase())).map(f => (
                                        <Button
                                          key={f}
                                          type="button"
                                          variant="Tertiary"
                                          size="s"
                                          onClick={() => {
                                            const newFields = config.saveFields.map((sf: SaveField) => 
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

                          <button 
                            onClick={() => removeSaveField(field.id)}
                            className="p-2 text-fg-tertiary hover:text-fg-status-error transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="button"
                        variant="Tertiary"
                        size="s"
                        onClick={addSaveField}
                        className="border-0 p-0 font-normal uppercase shadow-none label font-bold text-primary hover:text-primary/80 hover:bg-transparent"
                        iconLeft={<Plus className="h-5 w-5 rounded-full border-2 border-primary p-0.5" />}
                      >
                        Agregar campo
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Timezone */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Globe className="w-4 h-4 text-fg-tertiary" />
              <h3 className="label font-bold text-fg-tertiary uppercase tracking-wider">Zona Horaria</h3>
            </div>
            <div className="relative">
              <select
                value={config.timezone}
                onChange={(e) => handleUpdate('timezone', e.target.value)}
                className="w-full bg-bg-secondary border border-border-tertiary rounded-xl px-4 py-3 caption text-fg-primary focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
              >
                <option value="Argentina - Buenos Aires">Argentina - Buenos Aires</option>
                <option value="USA - New York">USA - New York</option>
                <option value="UK - London">UK - London</option>
                <option value="Spain - Madrid">Spain - Madrid</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-tertiary pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Toggle Button */}
      <div className="absolute left-full top-1/2 -translate-y-1/2 z-30">
        <button
          onClick={onToggle}
          className="w-6 h-12 bg-bg-primary border border-l-0 border-border-tertiary rounded-r-xl flex items-center justify-center text-fg-tertiary hover:text-primary hover:bg-bg-secondary transition-all shadow-md"
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </div>
  );
};
