import React, { useState, useRef } from 'react';
import { X, Search, Upload, FileText, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KnowledgeBaseDoc } from '../types';

interface FileSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (files: KnowledgeBaseDoc[]) => void;
  selectedFiles: KnowledgeBaseDoc[];
}

const INITIAL_MOCK_FILES: KnowledgeBaseDoc[] = [
  { name: 'FAQ COMPLETA.docx', size: '336.71 KB', type: 'DOCX', updatedAt: 'Mar 31 3:40 PM' },
  { name: 'CATALOGO DIV DESIGN.pdf', size: '8.25 MB', type: 'PDF', updatedAt: 'Mar 31 3:15 PM' },
  { name: 'DivDesign_Produtos_e_servicos_concorrentes_e_cases_de_sucesso.docx', size: '192.78 KB', type: 'DOCX', updatedAt: 'Mar 31 3:20 PM' },
  { name: 'DivDesign_Produtos_e_servicos_concorrentes_e_cases_de_sucesso (1).docx', size: '192.78 KB', type: 'DOCX', updatedAt: 'Mar 31 3:22 PM' },
  { name: 'Guia Estratégico de Perguntas & Respostas – Umani Portas Hospitalares.docx', size: '17.47 KB', type: 'DOCX', updatedAt: 'Mar 31 2:08 PM' },
];

export const FileSelectionModal: React.FC<FileSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedFiles,
}) => {
  const [search, setSearch] = useState('');
  const [files, setFiles] = useState<KnowledgeBaseDoc[]>(INITIAL_MOCK_FILES);
  const [tempSelected, setTempSelected] = useState<KnowledgeBaseDoc[]>(selectedFiles);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const toggleFile = (file: KnowledgeBaseDoc) => {
    const isSelected = tempSelected.some(f => f.name === file.name);
    if (isSelected) {
      setTempSelected(tempSelected.filter(f => f.name !== file.name));
    } else {
      setTempSelected([...tempSelected, file]);
    }
  };

  const handleConfirm = () => {
    onSelect(tempSelected);
    onClose();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newDoc: KnowledgeBaseDoc = {
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
      updatedAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
    };

    setFiles(prev => [newDoc, ...prev]);
    setTempSelected(prev => [newDoc, ...prev]);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="file-modal-wrapper"
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
            className="bg-bg-primary w-full max-w-4xl min-h-[450px] max-h-[90vh] rounded-3xl flex flex-col overflow-hidden border border-border-tertiary shadow-2xl relative z-10"
          >
          <div className="px-8 py-6 border-b border-border-tertiary space-y-4 shrink-0 bg-bg-primary">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="h2 text-fg-primary">Seleccionar archivos</h2>
                <p className="caption text-fg-tertiary">
                  Elige los archivos del gestor de recursos que alimentarán a este agente o carga un archivo nuevo.
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-bg-tertiary rounded-xl transition-all">
                <X className="w-6 h-6 text-fg-tertiary" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-tertiary" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar archivos..."
                  className="w-full bg-bg-secondary border border-border-tertiary rounded-xl pl-10 pr-4 py-2.5 caption text-fg-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
              <button 
                onClick={handleUploadClick}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white label font-bold rounded-xl hover:bg-bg-interactive-primary-hovered transition-all shadow-lg shadow-primary/10"
              >
                <Upload className="w-4 h-4" />
                Cargar archivo
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="border border-border-tertiary rounded-2xl overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-bg-secondary border-b border-border-tertiary">
                    <th className="p-4 w-12">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-border-tertiary text-primary focus:ring-primary/20"
                        checked={tempSelected.length === filteredFiles.length && filteredFiles.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTempSelected(filteredFiles);
                          } else {
                            setTempSelected([]);
                          }
                        }}
                      />
                    </th>
                    <th className="p-4 label font-bold text-fg-tertiary uppercase tracking-wider">Nombre</th>
                    <th className="p-4 label font-bold text-fg-tertiary uppercase tracking-wider">Tipo</th>
                    <th className="p-4 label font-bold text-fg-tertiary uppercase tracking-wider">Tamaño</th>
                    <th className="p-4 label font-bold text-fg-tertiary uppercase tracking-wider">Actualizado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file, idx) => {
                    const isSelected = tempSelected.some(f => f.name === file.name);
                    return (
                      <tr 
                        key={idx} 
                        className={`border-b border-border-tertiary hover:bg-bg-secondary/50 transition-all cursor-pointer ${isSelected ? 'bg-primary/5' : ''}`}
                        onClick={() => toggleFile(file)}
                      >
                        <td className="p-4">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-border-tertiary text-primary focus:ring-primary/20"
                            checked={isSelected}
                            readOnly
                          />
                        </td>
                        <td className="p-4 max-w-[300px]">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-fg-tertiary shrink-0" />
                            <span className="label font-bold text-fg-primary truncate" title={file.name}>{file.name}</span>
                          </div>
                        </td>
                        <td className="p-4 label text-fg-tertiary">{file.type}</td>
                        <td className="p-4 label text-fg-tertiary">{file.size}</td>
                        <td className="p-4 label text-fg-tertiary">{file.updatedAt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-4">
                <p className="label text-fg-tertiary">Registros por página</p>
                <select className="bg-bg-secondary border border-border-tertiary rounded-lg px-2 py-1 label">
                  <option>9</option>
                  <option>20</option>
                  <option>50</option>
                </select>
              </div>
              <div className="flex items-center gap-6">
                <p className="label text-fg-tertiary">1 - {filteredFiles.length} de {files.length} items</p>
                <div className="flex items-center gap-2">
                  <button className="p-1 hover:bg-bg-tertiary rounded-lg disabled:opacity-30" disabled><ChevronLeft className="w-5 h-5" /></button>
                  <button className="p-1 hover:bg-bg-tertiary rounded-lg disabled:opacity-30" disabled><ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 border-t border-border-tertiary bg-bg-secondary/30 flex justify-end gap-3 shrink-0">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 label font-bold text-fg-tertiary hover:bg-bg-tertiary rounded-xl transition-all"
            >
              Cerrar
            </button>
            <button 
              onClick={handleConfirm}
              className="px-8 py-2.5 bg-primary text-white label font-bold rounded-xl hover:bg-bg-interactive-primary-hovered transition-all flex items-center gap-2 shadow-lg shadow-primary/10"
            >
              <Check className="w-4 h-4" />
              Guardar selección
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
};
