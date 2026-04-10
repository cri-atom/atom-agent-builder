import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Settings, Database, Wrench, Save, Sparkles, Wand2, Plus, Trash2, ChevronDown, ChevronRight, Send, Loader2, Layout, FileText, MoreVertical, FolderOpen, Search, CheckSquare, Square, Info, Globe, Code, Table } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FileSelectionModal } from './FileSelectionModal';
import { ToolSelectionModal } from './ToolSelectionModal';
import { HttpRequestModal } from './HttpRequestModal';
import { FieldCreationModal } from './FieldCreationModal';
import { AgentNodeData, EndNodeData, LLMEdgeData, SaveField, KnowledgeBaseDoc, Tool } from '../types';
import { Button } from './Button';
import { CANVAS_CHROME_TOP, CANVAS_PANEL_WIDTH_PX } from '../lib/canvasChrome';

interface ConfigPanelProps {
  selectedElement: any;
  onUpdate: (data: any) => void;
  onDelete: () => void;
  onClose: () => void;
  onOpenPromptEditor: () => void;
}

interface IntegrationAccordionItemProps {
  tool: Tool;
  onDelete: () => void;
}

const IntegrationAccordionItem: React.FC<IntegrationAccordionItemProps> = ({ tool, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-bg-primary border border-border-tertiary rounded-2xl overflow-hidden group hover:border-primary/30 transition-all">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 flex items-start justify-between cursor-pointer hover:bg-bg-secondary/50 transition-colors"
      >
        <div className="flex gap-4">
          <div className="p-2 bg-bg-tertiary rounded-xl">
            {tool.toolkitId === 'http' ? (
              <Globe className="h-5 w-5 text-fg-status-success" />
            ) : (
              <Wrench className="w-5 h-5 text-fg-tertiary" />
            )}
          </div>
          <div className="space-y-1">
            <p className="label font-bold text-fg-primary">{tool.name}</p>
            <p className="caption text-fg-tertiary line-clamp-1">{tool.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 hover:bg-bg-status-error/10 text-fg-status-error rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {isOpen ? <ChevronDown className="w-4 h-4 text-fg-tertiary" /> : <ChevronRight className="w-4 h-4 text-fg-tertiary" />}
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 border-t border-border-tertiary pt-3 bg-bg-secondary/30"
          >
            <div className="space-y-2">
              <p className="caption text-fg-tertiary">{tool.description}</p>
              <div className="flex items-center gap-2">
                <span className="label-small font-bold text-fg-tertiary uppercase tracking-wider bg-bg-tertiary px-2 py-0.5 rounded-md">
                  {tool.toolkitName}
                </span>
                <span className="label-small text-fg-tertiary uppercase tracking-wider">
                  {tool.id?.toUpperCase() || ''}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  selectedElement,
  onUpdate,
  onDelete,
  onClose,
  onOpenPromptEditor,
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isSaveFieldsOpen, setIsSaveFieldsOpen] = useState(true);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [isAddingHttpTool, setIsAddingHttpTool] = useState(false);
  const [editingHttpTool, setEditingHttpTool] = useState<Tool | null>(null);
  const [fieldSearch, setFieldSearch] = useState('');
  const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState<string | null>(null);
  const [mentionMenu, setMentionMenu] = useState<{ isOpen: boolean; filter: string } | null>(null);
  const [isSqlAdvancedOpen, setIsSqlAdvancedOpen] = useState(false);

  const MOCK_TABLES = [
    { id: 'table-1', name: 'Panama Car Rental' },
    { id: 'table-2', name: 'Inventario General' },
    { id: 'table-3', name: 'Lista de Precios 2024' },
  ];

  const isNode = 'position' in selectedElement;
  const isAgent = selectedElement?.type === 'agent';
  const isEnd = selectedElement?.type === 'end';
  const isStart = selectedElement?.type === 'start';
  const isEdge = 'source' in selectedElement;

  const data = selectedElement?.data || {};

  const handleInputChange = (field: string, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const selectionStart = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, selectionStart);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

    if (lastAtSymbol !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtSymbol + 1);
      if (!textAfterAt.includes(' ') && textAfterAt.length < 20) {
        setMentionMenu({
          isOpen: true,
          filter: textAfterAt.toLowerCase()
        });
      } else {
        setMentionMenu(null);
      }
    } else {
      setMentionMenu(null);
    }

    handleInputChange('instructions', value);
  };

  const addSaveField = () => {
    const newField: SaveField = {
      id: Math.random().toString(36).substr(2, 9),
      label: 'Nuevo campo',
      description: '',
      type: 'required',
      dataType: 'string',
    };
    handleInputChange('saveFields', [...(data.saveFields || []), newField]);
  };

  const removeSaveField = (id: string) => {
    handleInputChange('saveFields', data.saveFields.filter((f: SaveField) => f.id !== id));
  };

  return (
    <motion.div
      initial={{ x: 48, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 48, opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      className="absolute right-[var(--spacing-s)] z-20 flex max-w-full flex-col overflow-hidden rounded-[var(--radius-sm)] border border-border-tertiary bg-bg-primary shadow-2xl"
      style={{
        top: CANVAS_CHROME_TOP,
        bottom: 'var(--spacing-s)',
        width: `min(${CANVAS_PANEL_WIDTH_PX}px, calc(100% - var(--spacing-s) * 2))`,
      }}
    >
      <div className="p-5 border-b border-border-tertiary flex items-center justify-between">
        {isAgent ? (
          <input
            type="text"
            value={data.label || ''}
            onChange={(e) => handleInputChange('label', e.target.value)}
            className="h3 text-fg-primary bg-transparent border-none focus:ring-0 p-0 w-full font-bold"
            placeholder="Nombre del Agente"
          />
        ) : (
          <h2 className="h3 text-fg-primary">
            {isEnd ? 'Fin' : isStart ? 'Inicio' : 'Condición'}
          </h2>
        )}
        <div className="flex items-center gap-1">
          <Button variant="Tertiary" size="s" onClick={onClose} className="p-2">
            <X className="w-4 h-4 text-fg-tertiary" />
          </Button>
        </div>
      </div>

      {isAgent && (
        <div className="flex border-b border-border-tertiary">
          {[
            { id: 'general', label: 'General' },
            { id: 'knowledge', label: 'Base de conocimiento' },
            { id: 'tools', label: 'Herramientas' },
          ].map((tab) => (
            <Button
              key={tab.id}
              type="button"
              variant="Tertiary"
              size="m"
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 rounded-none border-0 py-3 shadow-none label font-semibold uppercase text-[10px] tracking-wider ${
                activeTab === tab.id ? 'text-primary' : 'text-fg-tertiary hover:text-fg-primary'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </Button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-5">
        <AnimatePresence mode="wait">
          {isAgent && activeTab === 'general' && (
            <motion.div
              key="general"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              <div className="space-y-1.5 relative">
                <div className="flex items-center justify-between">
                  <label className="label text-fg-tertiary">Objetivo de la conversación</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="Tertiary"
                      size="xs"
                      onClick={onOpenPromptEditor}
                      iconLeft={<Wand2 size={12} />}
                    >
                      Asistente
                    </Button>
                  </div>
                </div>

                <div className="relative group">
                  <textarea
                    value={data.instructions || ''}
                    onChange={handleInstructionsChange}
                    onClick={onOpenPromptEditor}
                    rows={6}
                    className="w-full bg-bg-secondary border border-border-tertiary rounded-lg px-3 py-2 caption text-fg-primary focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all resize-none cursor-pointer hover:border-primary/50"
                    placeholder="Añade las instrucciones para el agente."
                    readOnly
                  />
                  <div 
                    onClick={onOpenPromptEditor}
                    className="absolute bottom-3 right-3 cursor-pointer rounded-md border border-border-tertiary bg-bg-primary p-1.5 opacity-0 shadow-sm transition-all group-hover:opacity-100 hover:bg-bg-secondary"
                  >
                    <Layout className="w-3.5 h-3.5 text-fg-tertiary" />
                  </div>
                </div>

                <AnimatePresence>
                  {mentionMenu?.isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border-tertiary bg-bg-primary shadow-2xl"
                    >
                      <div className="p-2 border-b border-border-tertiary bg-bg-secondary/50 flex items-center gap-2">
                        <Wrench className="w-3.5 h-3.5 text-primary" />
                        <span className="label-small font-bold text-fg-tertiary uppercase tracking-wider">Insertar Herramienta</span>
                      </div>
                      <div className="max-h-48 overflow-y-auto p-1">
                        {data.tools?.filter((t: Tool) => t.name.toLowerCase().includes(mentionMenu.filter)).length > 0 ? (
                          data.tools
                            .filter((t: Tool) => t.name.toLowerCase().includes(mentionMenu.filter))
                            .map((tool: Tool) => (
                              <Button
                                key={tool.id}
                                type="button"
                                variant="Tertiary"
                                size="s"
                                onClick={() => {
                                  const value = data.instructions || '';
                                  const lastAt = value.lastIndexOf('@');
                                  const newValue = value.substring(0, lastAt) + `[${tool.name}] ` + value.substring(lastAt + mentionMenu.filter.length + 1);
                                  handleInputChange('instructions', newValue);
                                  setMentionMenu(null);
                                }}
                                className="group w-full !min-h-0 justify-start rounded-lg border-0 px-3 py-2 font-normal shadow-none hover:bg-bg-secondary"
                                iconLeft={
                                  <div className="rounded-md bg-bg-tertiary p-1.5 transition-colors group-hover:bg-bg-primary">
                                    <Wrench className="h-3.5 w-3.5 text-fg-tertiary" />
                                  </div>
                                }
                              >
                                <span className="label font-semibold text-fg-primary">{tool.name}</span>
                              </Button>
                            ))
                        ) : (
                          <div className="p-4 text-center">
                            <p className="caption text-fg-tertiary">No se encontraron herramientas seleccionadas.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

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
                    Consultar campos de información
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
                          Define qué información debe solicitar el agente al cliente.
                        </p>

                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-start gap-3">
                          <div className="mt-0.5">
                            <Info className="w-5 h-5 text-primary" />
                          </div>
                          <p className="label text-fg-primary">
                            Marca como <span className="font-bold text-primary">obligatorio</span> los campos que el cliente debe proporcionar para avanzar.
                          </p>
                        </div>


                        <div className="flex items-center gap-3 px-1">
                          <Button
                            type="button"
                            variant="Tertiary"
                            size="s"
                            onClick={() => {
                              const allRequired = data.saveFields?.every((f: SaveField) => f.type === 'required');
                              const newFields = data.saveFields?.map((f: SaveField) => ({
                                ...f,
                                type: allRequired ? 'optional' : 'required'
                              }));
                              handleInputChange('saveFields', newFields || []);
                            }}
                            className="group border-0 p-0 font-normal shadow-none hover:bg-transparent"
                            iconLeft={
                              data.saveFields?.length > 0 && data.saveFields?.every((f: SaveField) => f.type === 'required') ? (
                                <CheckSquare className="h-5 w-5 text-primary" />
                              ) : (
                                <Square className="h-5 w-5 text-fg-tertiary transition-colors group-hover:text-primary" />
                              )
                            }
                          >
                            <span className="label text-fg-primary">Seleccionar todos</span>
                          </Button>
                        </div>

                        {/* Fields List */}
                        <div className="space-y-3">
                          {data.saveFields?.length > 0 && (
                            <div className="flex items-center gap-3 px-1 pb-2 border-b border-border-tertiary">
                              <div className="flex-1 label-small font-bold text-fg-tertiary uppercase">Campo</div>
                              <div className="w-24 text-center label-small font-bold text-fg-tertiary uppercase">Obligatorio</div>
                              <div className="w-10" />
                            </div>
                          )}

                          {data.saveFields?.map((field: SaveField) => (
                            <div key={field.id} className="flex items-center gap-3">
                              <div className="flex-1 relative">
                                <Button
                                  type="button"
                                  variant="Secondary"
                                  size="m"
                                  onClick={() => setIsFieldDropdownOpen(field.id)}
                                  className="label w-full justify-between rounded-xl border-border-tertiary bg-bg-primary font-normal text-fg-primary shadow-none hover:border-primary/50"
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
                                        className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border-tertiary bg-bg-primary shadow-xl"
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
                                                const newFields = data.saveFields.map((sf: SaveField) => 
                                                  sf.id === field.id ? { ...sf, label: f } : sf
                                                );
                                                handleInputChange('saveFields', newFields);
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

                              <div className="w-24 flex justify-center">
                                <button 
                                  onClick={() => {
                                    const newFields = data.saveFields.map((f: SaveField) => 
                                      f.id === field.id ? { ...f, type: f.type === 'required' ? 'optional' : 'required' } : f
                                    );
                                    handleInputChange('saveFields', newFields);
                                  }}
                                  className="p-2 hover:bg-bg-secondary rounded-lg transition-all"
                                >
                                  {field.type === 'required' ? (
                                    <CheckSquare className="w-5 h-5 text-primary" />
                                  ) : (
                                    <Square className="w-5 h-5 text-fg-tertiary hover:text-primary transition-colors" />
                                  )}
                                </button>
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

                        {isFieldDropdownOpen && <div className="h-40" />}

                        <div className="flex justify-end pt-2 gap-3">
                          <Button 
                            variant="Secondary"
                            size="s"
                            onClick={() => setIsFieldModalOpen(true)}
                            iconLeft={<Plus size={14} />}
                          >
                            Crear campo
                          </Button>
                          <Button 
                            variant="Primary"
                            size="s"
                            onClick={() => {
                              const newField: SaveField = {
                                id: Math.random().toString(36).substr(2, 9),
                                label: 'Seleccionar campo',
                                description: '',
                                type: 'required',
                                dataType: 'string',
                              };
                              handleInputChange('saveFields', [...(data.saveFields || []), newField]);
                            }}
                            iconLeft={<Plus size={14} />}
                          >
                            Agregar campo
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="pt-4 border-t border-border-tertiary">
                <Button
                  type="button"
                  variant="Tertiary"
                  size="m"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="group w-full !min-h-0 justify-between rounded-none border-0 p-0 font-normal shadow-none"
                  iconLeft={
                    <Settings className="h-4 w-4 shrink-0 text-fg-tertiary transition-colors group-hover:text-primary" />
                  }
                  iconRight={
                    isAdvancedOpen ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-fg-tertiary" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-fg-tertiary" />
                    )
                  }
                >
                  <span className="label uppercase text-fg-tertiary transition-colors group-hover:text-fg-primary">
                    Configuración avanzada
                  </span>
                </Button>
                
                <AnimatePresence>
                  {isAdvancedOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={isAdvancedOpen ? "" : "overflow-hidden"}
                    >
                      <div className="space-y-4 pt-4">
                        <div className="space-y-1.5">
                          <label className="label text-fg-tertiary">Modelo LLM</label>
                          <select
                            value={data.llm || 'gemini-pro'}
                            onChange={(e) => handleInputChange('llm', e.target.value)}
                            className="w-full bg-bg-secondary border border-border-tertiary rounded-lg px-3 py-2 caption text-fg-primary focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all"
                          >
                            <option value="gemini-pro">Gemini 1.5 Pro</option>
                            <option value="gemini-flash">Gemini 1.5 Flash</option>
                            <option value="gpt-4">GPT-4 Turbo</option>
                            <option value="haiku">Claude Haiku</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {isAgent && activeTab === 'knowledge' && (
            <motion.div
              key="knowledge"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Documents Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <FileText className="w-4 h-4 text-fg-tertiary" />
                  <h3 className="label font-bold text-fg-tertiary uppercase tracking-wider">Documentos</h3>
                </div>
                
                <Button
                  onClick={() => setIsFileModalOpen(true)}
                  variant="Primary"
                  size="m"
                  className="w-full"
                  iconLeft={<Plus size={16} />}
                >
                  Seleccionar o cargar archivo
                </Button>
                
                <div className="space-y-2">
                  {data.knowledgeBase && data.knowledgeBase.length > 0 ? (
                    data.knowledgeBase.map((doc: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-bg-secondary rounded-xl border border-border-tertiary group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center">
                            <FileText className="w-4 h-4 text-fg-tertiary" />
                          </div>
                          <div>
                            <p className="label font-bold text-fg-primary">{doc.name}</p>
                            <p className="label-small text-fg-tertiary">{doc.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => {
                              const newKB = data.knowledgeBase.filter((_: any, i: number) => i !== idx);
                              handleInputChange('knowledgeBase', newKB);
                            }}
                            className="p-1.5 hover:bg-bg-status-error/10 text-fg-status-error rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 hover:bg-bg-tertiary rounded-lg text-fg-tertiary">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="caption text-fg-tertiary px-1 italic">No hay documentos seleccionados.</p>
                  )}
                </div>
              </div>

              {/* Dynamic Tables Section */}
              <div className="space-y-4 pt-4 border-t border-border-tertiary">
                <div className="flex items-center gap-2 px-1">
                  <Table className="w-4 h-4 text-fg-tertiary" />
                  <h3 className="label font-bold text-fg-tertiary uppercase tracking-wider">Tabla dinámica</h3>
                </div>

                <div className="space-y-4">
                  <p className="caption text-fg-tertiary">
                    Selecciona la tabla que servirá como base de conocimiento para responder las consultas de tus clientes.
                  </p>

                  <div className="space-y-2">
                    <label className="label-small text-fg-tertiary uppercase">Seleccionar tabla*</label>
                    <div className="relative">
                      <select
                        value={data.dynamicTableId || ''}
                        onChange={(e) => handleInputChange('dynamicTableId', e.target.value)}
                        className="w-full bg-bg-secondary border border-border-tertiary rounded-xl px-4 py-3 caption text-fg-primary appearance-none focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      >
                        <option value="">Ninguna tabla seleccionada</option>
                        {MOCK_TABLES.map(table => (
                          <option key={table.id} value={table.id}>{table.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-tertiary pointer-events-none" />
                    </div>
                  </div>

                  {data.dynamicTableId && (
                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="Tertiary"
                        size="s"
                        onClick={() => setIsSqlAdvancedOpen(!isSqlAdvancedOpen)}
                        className="group !min-h-0 border-0 p-0 font-normal shadow-none"
                        iconLeft={
                          <Settings className="h-3.5 w-3.5 shrink-0 text-fg-tertiary transition-colors group-hover:text-primary" />
                        }
                        iconRight={
                          isSqlAdvancedOpen ? (
                            <ChevronDown className="h-3 w-3 shrink-0 text-fg-tertiary" />
                          ) : (
                            <ChevronRight className="h-3 w-3 shrink-0 text-fg-tertiary" />
                          )
                        }
                      >
                        <span className="label-small uppercase text-fg-tertiary transition-colors group-hover:text-fg-primary">
                          Configuración avanzada
                        </span>
                      </Button>
                      
                      <AnimatePresence>
                        {isSqlAdvancedOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-3 pt-3">
                              <div className="space-y-1.5">
                                <label className="label-small text-fg-tertiary uppercase">Prompt SQL</label>
                                <textarea
                                  value={data.sqlPrompt || ''}
                                  onChange={(e) => handleInputChange('sqlPrompt', e.target.value)}
                                  placeholder="Escribe aquí las instrucciones SQL personalizadas..."
                                  className="w-full bg-bg-secondary border border-border-tertiary rounded-xl px-4 py-3 caption text-fg-primary focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[100px] resize-none"
                                />
                                <p className="caption-small text-fg-tertiary">
                                  Define reglas específicas para las consultas SQL de esta tabla.
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {isAgent && activeTab === 'tools' && (
            <motion.div
              key="tools"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Integrations Tools */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Wrench className="w-4 h-4 text-fg-tertiary" />
                  <h3 className="label font-bold text-fg-tertiary uppercase tracking-wider">Integraciones</h3>
                </div>

                <Button
                  onClick={() => setIsToolModalOpen(true)}
                  variant="Primary"
                  size="m"
                  className="w-full"
                  iconLeft={<Plus size={16} />}
                >
                  Añadir Integración
                </Button>

                <div className="space-y-3">
                  {data.tools?.filter((t: Tool) => t.toolkitId !== 'http').length > 0 ? (
                    data.tools
                      .filter((t: Tool) => t.toolkitId !== 'http')
                      .map((tool: Tool) => (
                        <IntegrationAccordionItem 
                          key={tool.id} 
                          tool={tool} 
                          onDelete={() => {
                            const newTools = data.tools.filter((t: Tool) => t.id !== tool.id);
                            handleInputChange('tools', newTools);
                          }} 
                        />
                      ))
                  ) : (
                    <p className="caption text-fg-tertiary px-1 italic">No hay integraciones seleccionadas.</p>
                  )}
                </div>
              </div>

              {/* HTTP Tools */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Globe className="w-4 h-4 text-fg-tertiary" />
                  <h3 className="label font-bold text-fg-tertiary uppercase tracking-wider">HTTP Request</h3>
                </div>

                <Button
                  onClick={() => setIsAddingHttpTool(true)}
                  variant="Primary"
                  size="m"
                  className="w-full"
                  iconLeft={<Plus size={16} />}
                >
                  Añadir Petición HTTP
                </Button>

                <div className="space-y-3">
                  {data.tools?.filter((t: Tool) => t.toolkitId === 'http').length > 0 ? (
                    data.tools
                      .filter((t: Tool) => t.toolkitId === 'http')
                      .map((tool: Tool) => (
                        <IntegrationAccordionItem 
                          key={tool.id} 
                          tool={tool} 
                          onDelete={() => {
                            const newTools = data.tools.filter((t: Tool) => t.id !== tool.id);
                            handleInputChange('tools', newTools);
                          }} 
                        />
                      ))
                  ) : (
                    <p className="caption text-fg-tertiary px-1 italic">No hay peticiones HTTP configuradas.</p>
                  )}
                </div>
              </div>

              {/* Code Component Placeholder */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Code className="w-4 h-4 text-fg-tertiary" />
                  <h3 className="label font-bold text-fg-tertiary uppercase tracking-wider">Código</h3>
                </div>
                <div className="p-6 bg-bg-secondary border border-dashed border-border-tertiary rounded-2xl flex flex-col items-center justify-center text-center space-y-2 opacity-60 grayscale">
                  <div className="p-3 bg-bg-tertiary rounded-xl">
                    <Code className="w-6 h-6 text-fg-tertiary" />
                  </div>
                  <div>
                    <p className="label font-bold text-fg-tertiary uppercase tracking-widest">Próximamente</p>
                    <p className="caption text-fg-tertiary">Ejecuta scripts personalizados en el flujo.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {isEnd && (
            <motion.div
              key="end"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="label text-fg-tertiary">Etiqueta de Finalización</label>
                <input
                  type="text"
                  value={data.label || ''}
                  onChange={(e) => handleInputChange('label', e.target.value)}
                  className="w-full bg-bg-secondary border border-border-tertiary rounded-lg px-3 py-2 caption text-fg-primary focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Ej: Resuelto, Escalado..."
                />
              </div>
            </motion.div>
          )}

          {isEdge && (
            <motion.div
              key="edge"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="label text-fg-tertiary">Nombre</label>
                <input
                  type="text"
                  value={data.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-bg-secondary border border-border-tertiary rounded-lg px-3 py-2 caption text-fg-primary focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Ej: Transferir a Soporte"
                />
              </div>
              <div className="space-y-1.5">
                <label className="label text-fg-tertiary">
                  {data.isTimeout ? 'Tiempo sin respuesta' : 'Condición'}
                </label>
                {data.isTimeout ? (
                  <div className="space-y-3">
                    <p className="caption text-fg-tertiary italic">
                      Define cuánto tiempo debe pasar sin respuesta del usuario para que se active esta rama.
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={data.timeoutValue || 10}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          const unit = data.timeoutUnit || 'min';
                          onUpdate({ ...data, timeoutValue: val, condition: `Sin respuesta (${val} ${unit})` });
                        }}
                        className="w-20 bg-bg-secondary border border-border-tertiary rounded-lg px-3 py-2 caption text-fg-primary focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all"
                        min="1"
                      />
                      <select
                        value={data.timeoutUnit || 'min'}
                        onChange={(e) => {
                          const unit = e.target.value;
                          const val = data.timeoutValue || 10;
                          onUpdate({ ...data, timeoutUnit: unit, condition: `Sin respuesta (${val} ${unit})` });
                        }}
                        className="bg-bg-secondary border border-border-tertiary rounded-lg px-3 py-2 caption text-fg-primary focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all"
                      >
                        <option value="min">Minutos</option>
                        <option value="h">Horas</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={data.condition || ''}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    rows={4}
                    className="w-full bg-bg-secondary border border-border-tertiary rounded-lg px-3 py-2 caption text-fg-primary focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    placeholder="Ej: El usuario está molesto..."
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals placed outside scrollable container and using portal to prevent clipping */}
      {createPortal(
        <>
          <FieldCreationModal 
            isOpen={isFieldModalOpen}
            onClose={() => setIsFieldModalOpen(false)}
            onCreate={(field) => handleInputChange('saveFields', [...(data.saveFields || []), field])}
          />

          <FileSelectionModal 
            isOpen={isFileModalOpen}
            onClose={() => setIsFileModalOpen(false)}
            onSelect={(files) => handleInputChange('knowledgeBase', files)}
            selectedFiles={data.knowledgeBase || []}
          />

          <ToolSelectionModal 
            isOpen={isToolModalOpen}
            onClose={() => setIsToolModalOpen(false)}
            onSave={(tools) => handleInputChange('tools', tools)}
            selectedTools={data.tools || []}
          />

          <HttpRequestModal 
            isOpen={isAddingHttpTool || !!editingHttpTool}
            onClose={() => {
              setIsAddingHttpTool(false);
              setEditingHttpTool(null);
            }}
            initialData={editingHttpTool || undefined}
            onSave={(tool) => {
              if (editingHttpTool) {
                const newTools = data.tools.map((t: Tool) => t.id === tool.id ? tool : t);
                handleInputChange('tools', newTools);
              } else {
                handleInputChange('tools', [...(data.tools || []), tool]);
              }
              setIsAddingHttpTool(false);
              setEditingHttpTool(null);
            }}
          />
        </>,
        document.body
      )}
    </motion.div>
  );
};
