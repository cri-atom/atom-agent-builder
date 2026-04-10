import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, ChevronLeft, ChevronRight, Link2, Check, ArrowLeft, Wrench, Mail, Github, Calendar, FileText, LayoutGrid, Globe } from 'lucide-react';
import { Toolkit, Tool } from '../types';

import { Button } from './Button';

interface ToolSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tools: Tool[]) => void;
  selectedTools: Tool[];
}

const MOCK_TOOLKITS: Toolkit[] = [
  { id: 'gmail', name: 'Gmail', icon: 'gmail', description: 'gmail', connected: true },
  { id: 'integracion', name: 'Integración', icon: 'integracion', description: 'integracion', connected: false },
  { id: 'github', name: 'GitHub', icon: 'github', description: 'github', connected: false },
  { id: 'googlecalendar', name: 'Google Calendar', icon: 'googlecalendar', description: 'googlecalendar', connected: false },
  { id: 'notion', name: 'Notion', icon: 'notion', description: 'notion', connected: false },
  { id: 'googlesheets', name: 'Google Sheets', icon: 'googlesheets', description: 'googlesheets', connected: false },
];

const MOCK_TOOLS: Tool[] = [
  { id: 'gmail-1', name: 'Modify email labels', description: 'Adds and/or removes specified Gmail labels for a message; ensure `message_id` and all `label_ids` are valid (use `listLabels` for custom label IDs).', toolkitId: 'gmail', toolkitName: 'gmail' },
  { id: 'gmail-2', name: 'Batch delete Gmail messages', description: 'Tool to permanently delete multiple Gmail messages in bulk, bypassing Trash with no recovery possible. Use when you need to efficiently remove large numbers of emails (e.g., retention...', toolkitId: 'gmail', toolkitName: 'gmail' },
  { id: 'gmail-3', name: 'Batch modify Gmail messages', description: 'Modify labels on multiple Gmail messages in one efficient API call. Supports up to 1,000 messages per request for bulk operations like archiving, marking as read/unread, or applying custom labels. High-...', toolkitId: 'gmail', toolkitName: 'gmail' },
  { id: 'gmail-4', name: 'Create email draft', description: 'Creates a new draft message in the user\'s mailbox.', toolkitId: 'gmail', toolkitName: 'gmail' },
];

type ModalStep = 'SELECT_TOOLKIT' | 'CONNECT_TOOLKIT' | 'SELECT_TOOLS';

export const ToolSelectionModal: React.FC<ToolSelectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedTools
}) => {
  const [step, setStep] = useState<ModalStep>('SELECT_TOOLKIT');
  const [selectedToolkit, setSelectedToolkit] = useState<Toolkit | null>(null);
  const [search, setSearch] = useState('');
  const [tempSelected, setTempSelected] = useState<Tool[]>(selectedTools);

  const filteredToolkits = MOCK_TOOLKITS.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTools = MOCK_TOOLS.filter(t => 
    t.toolkitId === selectedToolkit?.id &&
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToolkitSelect = (toolkit: Toolkit) => {
    setSelectedToolkit(toolkit);
    if (toolkit.connected) {
      setStep('SELECT_TOOLS');
    } else {
      setStep('CONNECT_TOOLKIT');
    }
    setSearch('');
  };

  const handleBack = () => {
    if (step === 'SELECT_TOOLS' || step === 'CONNECT_TOOLKIT') {
      setStep('SELECT_TOOLKIT');
      setSelectedToolkit(null);
      setSearch('');
    }
  };

  const toggleTool = (tool: Tool) => {
    if (tempSelected.some(t => t.id === tool.id)) {
      setTempSelected(tempSelected.filter(t => t.id !== tool.id));
    } else {
      setTempSelected([...tempSelected, tool]);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'gmail': return <Mail className="w-8 h-8 text-[#EA4335]" />;
      case 'github': return <Github className="w-8 h-8 text-[#181717]" />;
      case 'googlecalendar': return <Calendar className="w-8 h-8 text-[#4285F4]" />;
      case 'googlesheets': return <FileText className="w-8 h-8 text-[#34A853]" />;
      case 'notion': return <FileText className="w-8 h-8 text-black" />;
      default: return <LayoutGrid className="w-8 h-8 text-fg-tertiary" />;
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="tool-modal-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="z-[150] flex max-w-none flex-row items-center justify-center p-4 box-border"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            minWidth: '100vw',
            maxWidth: '100vw',
            height: '100dvh',
            minHeight: '100dvh',
            boxSizing: 'border-box',
          }}
        >
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <div
            key="modal"
            role="dialog"
            aria-modal="true"
            className="bg-bg-primary relative z-10 box-border flex max-w-lg shrink-0 flex-col overflow-hidden rounded-3xl border border-border-tertiary shadow-2xl min-h-[450px] max-h-[80vh]"
            style={{
              width: 'min(calc(100vw - 2rem), 32rem)',
              maxWidth: '32rem',
              flexShrink: 0,
            }}
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-border-tertiary space-y-4 shrink-0 bg-bg-primary">
              <div className="flex items-center justify-between">
                <h2 className="h2 text-fg-primary">
                  {step === 'SELECT_TOOLKIT' && 'Seleccionar herramienta'}
                  {(step === 'CONNECT_TOOLKIT' || step === 'SELECT_TOOLS') && selectedToolkit?.name}
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-bg-tertiary rounded-xl transition-all">
                  <X className="w-6 h-6 text-fg-tertiary" />
                </button>
              </div>

              {(step === 'SELECT_TOOLKIT' || step === 'SELECT_TOOLS') && (
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-tertiary group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full bg-bg-secondary border border-border-tertiary rounded-2xl pl-11 pr-4 py-3 caption text-fg-primary focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {step === 'SELECT_TOOLKIT' && (
                <div className="space-y-3">
                  {filteredToolkits.length > 0 ? (
                    filteredToolkits.map((toolkit) => (
                      <Button
                        key={toolkit.id}
                        type="button"
                        variant="Secondary"
                        size="l"
                        onClick={() => handleToolkitSelect(toolkit)}
                        className="group w-full !h-auto !min-h-0 justify-start gap-4 rounded-2xl border-border-tertiary p-4 text-left font-normal shadow-none hover:bg-bg-secondary"
                        iconLeft={
                          <div className="rounded-xl bg-bg-tertiary p-2 transition-all group-hover:bg-bg-primary">
                            {getIcon(toolkit.icon)}
                          </div>
                        }
                      >
                        <div>
                          <p className="label font-bold text-fg-primary">{toolkit.name}</p>
                          <p className="caption text-fg-tertiary">{toolkit.description}</p>
                        </div>
                      </Button>
                    ))
                  ) : (
                    <div className="text-center py-12 space-y-3">
                      <div className="w-12 h-12 bg-bg-secondary rounded-2xl flex items-center justify-center mx-auto">
                        <Search className="w-6 h-6 text-fg-tertiary" />
                      </div>
                      <p className="label text-fg-tertiary">No se encontraron herramientas para "{search}"</p>
                    </div>
                  )}
                </div>
              )}

              {step === 'CONNECT_TOOLKIT' && selectedToolkit && (
                <div className="space-y-8">
                  <Button
                    type="button"
                    variant="Tertiary"
                    size="s"
                    onClick={handleBack}
                    className="border-0 p-0 text-primary shadow-none label font-bold hover:underline"
                    iconLeft={<ArrowLeft className="w-4 h-4" />}
                  >
                    Volver a herramientas
                  </Button>
                  
                  <div className="p-6 border border-border-tertiary rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-bg-tertiary rounded-xl">
                      {getIcon(selectedToolkit.icon)}
                    </div>
                    <div>
                      <p className="label font-bold text-fg-primary">{selectedToolkit.name}</p>
                      <p className="caption text-fg-tertiary">{selectedToolkit.description}</p>
                    </div>
                  </div>

                  <div className="p-6 border border-border-tertiary rounded-2xl space-y-6">
                    <p className="label text-fg-secondary">No conectado — conéctate para usar herramientas de esta integración</p>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="Primary"
                        size="m"
                        iconLeft={<Link2 className="w-4 h-4" />}
                      >
                        Conectar
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="caption text-fg-tertiary">Después de conectarte en la nueva pestaña, haz clic en "Verificar de nuevo" o vuelve a abrir esta integración para actualizar el estado.</p>
                    <Button type="button" variant="Secondary" size="m">
                      Verificar de nuevo
                    </Button>
                  </div>
                </div>
              )}

              {step === 'SELECT_TOOLS' && selectedToolkit && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-primary label font-bold">
                    <Button
                      type="button"
                      variant="Tertiary"
                      size="s"
                      onClick={handleBack}
                      className="border-0 p-0 text-primary shadow-none hover:underline"
                      iconLeft={<ArrowLeft className="w-4 h-4" />}
                    >
                      Volver
                    </Button>
                    <span className="text-fg-tertiary font-normal">|</span>
                    <span className="text-fg-tertiary font-normal">{selectedToolkit.name}</span>
                  </div>

                  <div className="space-y-3">
                    {filteredTools.length > 0 ? (
                      filteredTools.map((tool) => {
                        const isSelected = tempSelected.some(t => t.id === tool.id);
                        return (
                          <Button
                            key={tool.id}
                            type="button"
                            variant="Secondary"
                            size="l"
                            onClick={() => toggleTool(tool)}
                            className={`w-full !h-auto !min-h-0 justify-start gap-4 rounded-2xl p-4 text-left font-normal shadow-none ${
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border-tertiary hover:bg-bg-secondary'
                            }`}
                          >
                            <div
                              className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                                isSelected ? 'border-primary bg-primary' : 'border-border-tertiary bg-white'
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <div className="space-y-1 text-left">
                              <p className="label font-bold text-fg-primary">{tool.name}</p>
                              <p className="caption line-clamp-2 text-fg-tertiary">{tool.description}</p>
                            </div>
                          </Button>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 space-y-3">
                        <div className="w-12 h-12 bg-bg-secondary rounded-2xl flex items-center justify-center mx-auto">
                          <Search className="w-6 h-6 text-fg-tertiary" />
                        </div>
                        <p className="label text-fg-tertiary">No se encontraron herramientas para "{search}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-border-tertiary bg-bg-secondary/30 flex justify-end items-center gap-3 shrink-0">
              {step !== 'SELECT_TOOLKIT' && (
                <Button
                  type="button"
                  variant="Tertiary"
                  size="m"
                  onClick={handleBack}
                >
                  Atrás
                </Button>
              )}
              <Button
                type="button"
                variant="Primary"
                size="m"
                onClick={() => {
                  if (step === 'SELECT_TOOLS') {
                    onSave(tempSelected);
                  }
                  onClose();
                }}
              >
                {step === 'SELECT_TOOLS'
                  ? `Añadir ${tempSelected.length} herramienta${tempSelected.length !== 1 ? 's' : ''}`
                  : 'Cerrar'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
