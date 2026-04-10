import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, ChevronLeft, ChevronRight, Link2, Check, ArrowLeft, Wrench, Mail, Github, Calendar, FileText, LayoutGrid, Globe } from 'lucide-react';
import { Toolkit, Tool } from '../types';

import { HttpRequestModal } from './HttpRequestModal';

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="tool-modal-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4"
        >
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            key="modal"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-bg-primary w-full max-w-lg min-h-[450px] max-h-[80vh] rounded-3xl flex flex-col overflow-hidden border border-border-tertiary shadow-2xl relative z-10"
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
                      <button
                        key={toolkit.id}
                        onClick={() => handleToolkitSelect(toolkit)}
                        className="w-full flex items-center gap-4 p-4 border border-border-tertiary rounded-2xl hover:bg-bg-secondary transition-all text-left group"
                      >
                        <div className="p-2 bg-bg-tertiary rounded-xl group-hover:bg-bg-primary transition-all">
                          {getIcon(toolkit.icon)}
                        </div>
                        <div>
                          <p className="label font-bold text-fg-primary">{toolkit.name}</p>
                          <p className="caption text-fg-tertiary">{toolkit.description}</p>
                        </div>
                      </button>
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
                  <button onClick={handleBack} className="flex items-center gap-2 text-primary label font-bold hover:underline">
                    <ArrowLeft className="w-4 h-4" />
                    Volver a herramientas
                  </button>
                  
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
                      <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white label font-bold rounded-xl hover:bg-bg-interactive-primary-hovered transition-all shadow-lg">
                        <Link2 className="w-4 h-4" />
                        Conectar
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="caption text-fg-tertiary">Después de conectarte en la nueva pestaña, haz clic en "Verificar de nuevo" o vuelve a abrir esta integración para actualizar el estado.</p>
                    <button className="px-6 py-2.5 border border-border-tertiary rounded-xl label font-bold text-fg-primary hover:bg-bg-secondary transition-all">
                      Verificar de nuevo
                    </button>
                  </div>
                </div>
              )}

              {step === 'SELECT_TOOLS' && selectedToolkit && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-primary label font-bold">
                    <button onClick={handleBack} className="hover:underline flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      Volver
                    </button>
                    <span className="text-fg-tertiary font-normal">|</span>
                    <span className="text-fg-tertiary font-normal">{selectedToolkit.name}</span>
                  </div>

                  <div className="space-y-3">
                    {filteredTools.length > 0 ? (
                      filteredTools.map((tool) => {
                        const isSelected = tempSelected.some(t => t.id === tool.id);
                        return (
                          <button
                            key={tool.id}
                            onClick={() => toggleTool(tool)}
                            className={`w-full p-4 border rounded-2xl transition-all text-left flex gap-4 ${
                              isSelected 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border-tertiary hover:bg-bg-secondary'
                            }`}
                          >
                            <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${
                              isSelected ? 'bg-primary border-primary' : 'border-border-tertiary bg-white'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div className="space-y-1">
                              <p className="label font-bold text-fg-primary">{tool.name}</p>
                              <p className="caption text-fg-tertiary line-clamp-2">{tool.description}</p>
                            </div>
                          </button>
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
              <button 
                onClick={handleBack}
                className={`px-6 py-2.5 label font-bold text-fg-tertiary hover:bg-bg-tertiary rounded-xl transition-all ${
                  step === 'SELECT_TOOLKIT' ? 'hidden' : ''
                }`}
              >
                Atrás
              </button>
              <button 
                onClick={() => {
                  if (step === 'SELECT_TOOLS') {
                    onSave(tempSelected);
                  }
                  onClose();
                }}
                className="px-8 py-2.5 bg-primary text-white label font-bold rounded-xl hover:bg-bg-interactive-primary-hovered transition-all shadow-lg"
              >
                {step === 'SELECT_TOOLS' ? `Añadir ${tempSelected.length} herramienta${tempSelected.length !== 1 ? 's' : ''}` : 'Cerrar'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
