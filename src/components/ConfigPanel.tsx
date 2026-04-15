import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Settings, Wrench, Wand2, Plus, Trash2, ChevronDown, ChevronRight, Layout, FileText, MoreVertical, Search, CheckSquare, Square, Globe, Code, MessageSquare, AlertTriangle, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FileSelectionModal } from './FileSelectionModal';
import { ToolSelectionModal } from './ToolSelectionModal';
import { HttpRequestModal } from './HttpRequestModal';
import { FieldCreationModal } from './FieldCreationModal';
import { AgentNodeData, EndNodeData, LLMEdgeData, SaveField, KnowledgeBaseDoc, Tool } from '../types';
import { Button } from './Button';
import { CollapsibleSectionHeader, InspectorTabs, PanelSection } from './panel';

const formFieldBase =
  'w-full rounded-[var(--radius-s)] border border-border-secondary bg-bg-primary px-[var(--spacing-sm)] py-[var(--spacing-s)] caption text-fg-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20';

/** Panel width (px); positioning lives on the parent in Canvas. */
export const FLOW_INSPECTOR_PANEL_WIDTH_PX = 382;

interface ConfigPanelProps {
  selectedElement: any;
  onUpdate: (data: any) => void;
  onDelete: () => void;
  onClose: () => void;
  onOpenPromptEditor: () => void;
  /** Passed from App for future actions; optional until wired in UI */
  onDuplicate?: () => void;
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
                <span className="label-small font-bold text-fg-tertiary bg-bg-tertiary px-2 py-0.5 rounded-md">
                  {tool.toolkitName}
                </span>
                <span className="label-small text-fg-tertiary">
                  {tool.id || ''}
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
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-[var(--radius-m)] border border-border-tertiary bg-bg-primary shadow-[0px_6px_14px_0px_rgba(9,9,11,0.08)]"
      style={{
        /* 100vw evita ciclo de % con el wrapper pointer-events-auto en Canvas */
        width: `min(${FLOW_INSPECTOR_PANEL_WIDTH_PX}px, calc(100vw - var(--spacing-s) * 4))`,
      }}
    >
      <header className="flex items-center gap-[var(--spacing-s)] border-b border-border-tertiary px-[var(--spacing-m)] py-[var(--spacing-s)]">
        {isAgent ? (
          <>
            <Bot className="size-6 shrink-0 text-fg-quaternary" aria-hidden />
            <input
              type="text"
              value={data.label || ''}
              onChange={(e) => handleInputChange('label', e.target.value)}
              className="min-w-0 flex-1 border-none bg-transparent p-0 caption font-bold text-fg-primary outline-none focus:ring-0"
              placeholder="Nuevo agente"
            />
          </>
        ) : (
          <h2 className="min-w-0 flex-1 caption font-bold text-fg-primary">
            {isEnd ? 'Fin' : isStart ? 'Inicio' : 'Condición'}
          </h2>
        )}
        <Button variant="Tertiary" size="s" type="button" onClick={onClose} className="shrink-0 p-1">
          <X className="size-4 text-fg-secondary" />
        </Button>
      </header>

      {isAgent && (
        <InspectorTabs
          tabs={[
            { id: 'general', label: 'General' },
            { id: 'knowledge', label: 'Base de conocimiento' },
            { id: 'tools', label: 'Herramientas' },
          ]}
          activeId={activeTab}
          onChange={setActiveTab}
        />
      )}

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {isAgent && activeTab === 'general' && (
            <motion.div
              key="general"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <section className="border-b border-border-tertiary">
                <div className="flex min-h-[34px] items-center justify-between gap-2 px-[var(--spacing-m)] py-[var(--spacing-s)]">
                  <h3 className="label font-medium text-fg-primary">Objetivo de la conversación</h3>
                  <Button
                    variant="Tertiary"
                    size="xs"
                    type="button"
                    onClick={onOpenPromptEditor}
                    iconLeft={<Wand2 size={12} />}
                  >
                    Asistente
                  </Button>
                </div>
                <div className="relative px-[var(--spacing-m)] pb-[var(--spacing-m)] pt-0">
                  <div className="group relative">
                    <textarea
                      value={data.instructions || ''}
                      onChange={handleInstructionsChange}
                      onClick={onOpenPromptEditor}
                      rows={6}
                      className={`${formFieldBase} resize-none cursor-pointer hover:border-primary/40`}
                      placeholder="Añade las instrucciones para el agente..."
                      readOnly
                    />
                    <div
                      onClick={onOpenPromptEditor}
                      className="absolute bottom-3 right-3 cursor-pointer rounded-md border border-border-tertiary bg-bg-primary p-1.5 opacity-0 shadow-sm transition-all group-hover:opacity-100 hover:bg-bg-secondary"
                    >
                      <Layout className="size-3.5 text-fg-quaternary" />
                    </div>
                  </div>

                  <AnimatePresence>
                    {mentionMenu?.isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-[var(--spacing-m)] right-[var(--spacing-m)] top-full z-50 mt-1 overflow-hidden rounded-[var(--radius-m)] border border-border-tertiary bg-bg-primary shadow-xl"
                      >
                        <div className="flex items-center gap-2 border-b border-border-tertiary bg-bg-secondary/50 p-2">
                          <Wrench className="size-3.5 text-primary" />
                          <span className="label-small font-bold text-fg-tertiary">
                            Insertar herramienta
                          </span>
                        </div>
                        <div className="max-h-48 overflow-y-auto p-1">
                          {data.tools?.filter((t: Tool) => t.name.toLowerCase().includes(mentionMenu.filter)).length >
                          0 ? (
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
                                    const newValue =
                                      value.substring(0, lastAt) +
                                      `[${tool.name}] ` +
                                      value.substring(lastAt + mentionMenu.filter.length + 1);
                                    handleInputChange('instructions', newValue);
                                    setMentionMenu(null);
                                  }}
                                  className="group w-full !min-h-0 justify-start rounded-lg border-0 px-3 py-2 font-normal shadow-none hover:bg-bg-secondary"
                                  iconLeft={
                                    <div className="rounded-md bg-bg-tertiary p-1.5 transition-colors group-hover:bg-bg-primary">
                                      <Wrench className="size-3.5 text-fg-tertiary" />
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
              </section>

              <div className="border-b border-border-tertiary">
                <CollapsibleSectionHeader
                  title="Consultar campos de información"
                  isOpen={isSaveFieldsOpen}
                  onToggle={() => setIsSaveFieldsOpen(!isSaveFieldsOpen)}
                />
                <AnimatePresence initial={false}>
                  {isSaveFieldsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-[var(--spacing-s)] px-[var(--spacing-m)] pb-[var(--spacing-m)] pt-0">
                        <p className="label font-normal text-fg-quaternary">
                          Define qué información debe solicitar el agente al cliente.
                        </p>

                        <div className="flex gap-4 rounded-[var(--radius-s)] border border-border-status-warning bg-bg-status-warning p-[var(--spacing-m)]">
                          <AlertTriangle className="mt-0.5 size-6 shrink-0 text-fg-status-warning" />
                          <p className="label text-fg-status-warning">
                            Marca como <span className="font-bold">obligatorio</span> los campos que el cliente debe
                            proporcionar para avanzar.
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="Tertiary"
                            size="s"
                            onClick={() => {
                              const allRequired = data.saveFields?.every((f: SaveField) => f.type === 'required');
                              const newFields = data.saveFields?.map((f: SaveField) => ({
                                ...f,
                                type: allRequired ? 'optional' : 'required',
                              }));
                              handleInputChange('saveFields', newFields || []);
                            }}
                            className="group border-0 p-0 font-normal shadow-none hover:bg-transparent"
                            iconLeft={
                              data.saveFields?.length > 0 &&
                              data.saveFields?.every((f: SaveField) => f.type === 'required') ? (
                                <CheckSquare className="size-5 text-primary" />
                              ) : (
                                <Square className="size-5 text-fg-quaternary transition-colors group-hover:text-primary" />
                              )
                            }
                          >
                            <span className="label text-fg-primary">Seleccionar todos</span>
                          </Button>
                        </div>

                        <div className="flex flex-col gap-3">
                          {data.saveFields?.length > 0 && (
                            <div className="flex items-center gap-3 border-b border-border-tertiary pb-2">
                              <div className="flex-1 label font-medium text-fg-tertiary">Campo</div>
                              <div className="w-24 text-center label font-medium text-fg-tertiary">Obligatorio</div>
                              <div className="w-10 shrink-0" />
                            </div>
                          )}

                          {data.saveFields?.map((field: SaveField) => (
                            <div key={field.id} className="flex items-center gap-[var(--spacing-s)]">
                              <div className="relative min-w-0 flex-1">
                                <Button
                                  type="button"
                                  variant="Secondary"
                                  size="m"
                                  onClick={() => setIsFieldDropdownOpen(field.id)}
                                  className="label w-full justify-between rounded-[var(--radius-s)] border-border-secondary bg-bg-primary font-normal text-fg-primary shadow-none hover:border-primary/40"
                                  iconRight={<ChevronDown className="size-4 shrink-0 text-fg-quaternary" />}
                                >
                                  <span className="truncate">{field.label}</span>
                                </Button>

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
                                            className="label min-w-0 flex-1 border-none bg-transparent p-0 text-fg-primary focus:ring-0"
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
                                                  const newFields = (data.saveFields || []).map((sf: SaveField) =>
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

                              <div className="flex w-[63px] shrink-0 justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newFields = (data.saveFields || []).map((f: SaveField) =>
                                      f.id === field.id
                                        ? { ...f, type: f.type === 'required' ? 'optional' : 'required' }
                                        : f
                                    );
                                    handleInputChange('saveFields', newFields);
                                  }}
                                  className="rounded-lg p-2 transition-all hover:bg-bg-secondary"
                                >
                                  {field.type === 'required' ? (
                                    <CheckSquare className="size-5 text-primary" />
                                  ) : (
                                    <Square className="size-5 text-fg-quaternary transition-colors hover:text-primary" />
                                  )}
                                </button>
                              </div>

                              <Button
                                variant="Tertiary"
                                size="s"
                                type="button"
                                onClick={() => removeSaveField(field.id)}
                                className="shrink-0 p-2"
                              >
                                <Trash2 className="size-4 text-fg-secondary" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        {isFieldDropdownOpen && <div className="h-40" />}

                        <div className="flex gap-2 pt-1">
                          <Button
                            variant="Secondary"
                            size="s"
                            type="button"
                            className="min-h-0 flex-1 justify-center shadow-none"
                            onClick={() => setIsFieldModalOpen(true)}
                            iconLeft={<Plus className="size-4" />}
                          >
                            Crear campo
                          </Button>
                          <Button
                            variant="Secondary"
                            size="s"
                            type="button"
                            className="min-h-0 flex-1 justify-center shadow-none"
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
                            iconLeft={<Plus className="size-4" />}
                          >
                            Agregar campo
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="border-b border-border-tertiary">
                <CollapsibleSectionHeader
                  title="Configuración avanzada"
                  isOpen={isAdvancedOpen}
                  onToggle={() => setIsAdvancedOpen(!isAdvancedOpen)}
                />
                <AnimatePresence initial={false}>
                  {isAdvancedOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 px-[var(--spacing-m)] pb-[var(--spacing-m)] pt-0">
                        <label className="label font-medium text-fg-tertiary">Modelo</label>
                        <div className="relative">
                          <select
                            value={data.llm || 'gemini-pro'}
                            onChange={(e) => handleInputChange('llm', e.target.value)}
                            className={`${formFieldBase} appearance-none pr-10`}
                          >
                            <option value="gemini-pro">Gemini 1.5 Pro</option>
                            <option value="gemini-flash">Gemini 1.5 Flash</option>
                            <option value="gpt-4">GPT-4 Turbo</option>
                            <option value="haiku">Claude Haiku</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-fg-quaternary" />
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
            >
              <PanelSection title="Documentos">
                <div className="flex flex-col gap-[var(--spacing-s)]">
                  <Button
                    type="button"
                    onClick={() => setIsFileModalOpen(true)}
                    variant="Primary"
                    size="m"
                    className="w-full"
                    iconLeft={<Plus className="size-4" />}
                  >
                    Seleccionar o cargar archivo
                  </Button>

                  <div className="flex flex-col gap-2">
                    {data.knowledgeBase && data.knowledgeBase.length > 0 ? (
                      data.knowledgeBase.map((doc: { name: string; size?: string }, idx: number) => (
                        <div
                          key={idx}
                          className="group flex items-center justify-between rounded-[var(--radius-m)] border border-border-tertiary bg-bg-secondary p-3 transition-all hover:border-primary/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-bg-tertiary">
                              <FileText className="size-4 text-fg-quaternary" />
                            </div>
                            <div>
                              <p className="label font-medium text-fg-primary">{doc.name}</p>
                              {doc.size ? <p className="label-small text-fg-quaternary">{doc.size}</p> : null}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const newKB = data.knowledgeBase.filter((_: unknown, i: number) => i !== idx);
                                handleInputChange('knowledgeBase', newKB);
                              }}
                              className="rounded-lg p-1.5 text-fg-status-error opacity-0 transition-all hover:bg-bg-status-error/10 group-hover:opacity-100"
                              title="Eliminar"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              className="rounded-lg p-1.5 text-fg-quaternary hover:bg-bg-tertiary"
                            >
                              <MoreVertical className="size-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="label font-normal italic text-fg-quaternary">No hay documentos seleccionados.</p>
                    )}
                  </div>
                </div>
              </PanelSection>

              <PanelSection title="Tabla dinámica">
                <div className="flex flex-col gap-[var(--spacing-m)]">
                  <p className="label font-normal text-fg-quaternary">
                    Selecciona la tabla que servirá como base de conocimiento para responder las consultas de tus clientes.
                  </p>

                  <div className="flex flex-col gap-2">
                    <label className="label font-medium text-fg-tertiary">Seleccionar tabla*</label>
                    <div className="relative">
                      <select
                        value={data.dynamicTableId || ''}
                        onChange={(e) => handleInputChange('dynamicTableId', e.target.value)}
                        className={`${formFieldBase} appearance-none pr-10`}
                      >
                        <option value="">Ninguna tabla seleccionada</option>
                        {MOCK_TABLES.map((table) => (
                          <option key={table.id} value={table.id}>
                            {table.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-fg-quaternary" />
                    </div>
                  </div>

                  {data.dynamicTableId && (
                    <div className="pt-1">
                      <CollapsibleSectionHeader
                        title="Configuración avanzada"
                        isOpen={isSqlAdvancedOpen}
                        onToggle={() => setIsSqlAdvancedOpen(!isSqlAdvancedOpen)}
                        flush
                      />
                      <AnimatePresence initial={false}>
                        {isSqlAdvancedOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-2 pb-[var(--spacing-s)] pt-0">
                              <label className="label font-medium text-fg-tertiary">Prompt SQL</label>
                              <textarea
                                value={data.sqlPrompt || ''}
                                onChange={(e) => handleInputChange('sqlPrompt', e.target.value)}
                                placeholder="Escribe aquí las instrucciones SQL personalizadas..."
                                className={`${formFieldBase} min-h-[100px] resize-none`}
                              />
                              <p className="caption text-fg-quaternary">
                                Define reglas específicas para las consultas SQL de esta tabla.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </PanelSection>
            </motion.div>
          )}

          {isAgent && activeTab === 'tools' && (
            <motion.div
              key="tools"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <PanelSection title="Integraciones">
                <div className="flex flex-col gap-[var(--spacing-s)]">
                  <Button
                    type="button"
                    onClick={() => setIsToolModalOpen(true)}
                    variant="Primary"
                    size="m"
                    className="w-full"
                    iconLeft={<Plus className="size-4" />}
                  >
                    Añadir Integración
                  </Button>

                  <div className="flex flex-col gap-3">
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
                      <p className="label font-normal italic text-fg-quaternary">No hay integraciones seleccionadas.</p>
                    )}
                  </div>
                </div>
              </PanelSection>

              <PanelSection title="HTTP Request">
                <div className="flex flex-col gap-[var(--spacing-s)]">
                  <Button
                    type="button"
                    onClick={() => setIsAddingHttpTool(true)}
                    variant="Primary"
                    size="m"
                    className="w-full"
                    iconLeft={<Plus className="size-4" />}
                  >
                    Añadir Petición HTTP
                  </Button>

                  <div className="flex flex-col gap-3">
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
                      <p className="label font-normal italic text-fg-quaternary">
                        No hay peticiones HTTP configuradas.
                      </p>
                    )}
                  </div>
                </div>
              </PanelSection>

              <PanelSection title="Código">
                <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-m)] border border-dashed border-border-tertiary bg-bg-secondary p-6 text-center opacity-60 grayscale">
                  <div className="rounded-xl bg-bg-tertiary p-3">
                    <Code className="size-6 text-fg-quaternary" />
                  </div>
                  <div>
                    <p className="label font-medium text-fg-quaternary">Próximamente</p>
                    <p className="caption text-fg-quaternary">Ejecuta scripts personalizados en el flujo.</p>
                  </div>
                </div>
              </PanelSection>
            </motion.div>
          )}

          {isEnd && (
            <motion.div key="end" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <PanelSection title="Etiqueta de Finalización">
                <input
                  type="text"
                  value={data.label || ''}
                  onChange={(e) => handleInputChange('label', e.target.value)}
                  className={formFieldBase}
                  placeholder="Ej: Resuelto, Escalado..."
                />
              </PanelSection>
            </motion.div>
          )}

          {isEdge && (
            <motion.div key="edge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <PanelSection title="Nombre">
                <input
                  type="text"
                  value={data.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={formFieldBase}
                  placeholder="Ej: Transferir a Soporte"
                />
              </PanelSection>
              <PanelSection title={data.isTimeout ? 'Tiempo sin respuesta' : 'Condición'}>
                {data.isTimeout ? (
                  <div className="flex flex-col gap-3">
                    <p className="label font-normal italic text-fg-quaternary">
                      Define cuánto tiempo debe pasar sin respuesta del usuario para que se active esta rama.
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="number"
                        value={data.timeoutValue || 10}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 0;
                          const unit = data.timeoutUnit || 'min';
                          onUpdate({ ...data, timeoutValue: val, condition: `Sin respuesta (${val} ${unit})` });
                        }}
                        className={`${formFieldBase} w-20`}
                        min={1}
                      />
                      <select
                        value={data.timeoutUnit || 'min'}
                        onChange={(e) => {
                          const unit = e.target.value;
                          const val = data.timeoutValue || 10;
                          onUpdate({ ...data, timeoutUnit: unit, condition: `Sin respuesta (${val} ${unit})` });
                        }}
                        className={formFieldBase}
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
                    className={`${formFieldBase} resize-none`}
                    placeholder="Ej: El usuario está molesto..."
                  />
                )}
              </PanelSection>
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
    </div>
  );
};
