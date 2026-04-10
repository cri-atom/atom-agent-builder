import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './Button';

interface FieldCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (field: any) => void;
}

export const FieldCreationModal: React.FC<FieldCreationModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dataType, setDataType] = useState('Texto');
  const [length, setLength] = useState('');

  const handleCreate = () => {
    if (!name || !description) return;
    onCreate({
      id: Math.random().toString(36).substr(2, 9),
      label: name,
      description: description,
      dataType: dataType.toLowerCase(),
      type: 'required',
    });
    onClose();
    setName('');
    setDescription('');
    setDataType('Texto');
    setLength('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden p-8"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="h2 text-fg-primary font-bold">Crear nuevo campo de información</h2>
              <button onClick={onClose} className="p-2 hover:bg-bg-secondary rounded-xl transition-all">
                <X className="w-6 h-6 text-fg-tertiary" />
              </button>
            </div>
            <p className="caption text-fg-tertiary mb-8">
              En este campo se guardará el dato proporcionado por el cliente. Agrega una descripción para facilitar su recolección.
            </p>

            <div className="space-y-6">
              {/* Field Name */}
              <div className="relative">
                <div className="absolute -top-2.5 left-3 bg-white px-1 z-10">
                  <label className="label-small text-fg-tertiary uppercase">Nombre del campo*</label>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-border-tertiary rounded-xl px-4 py-3 label text-fg-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all bg-white"
                  placeholder="Ej: email_usuario"
                />
              </div>

              {/* Field Description */}
              <div className="relative">
                <div className="absolute -top-2.5 left-3 bg-white px-1 z-10">
                  <label className="label-small text-fg-tertiary uppercase">Descripción del campo*</label>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-border-tertiary rounded-xl px-4 py-3 label text-fg-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none h-24 bg-white"
                  placeholder="Describe la información del campo y da un ejemplo *"
                />
                <div className="flex justify-between mt-1 px-1">
                  <span className="text-[10px] text-fg-tertiary">Ejemplo: Este campo almacena la marca de vehículo que le interesa al cliente. Ej. Toyota.</span>
                  <span className="text-[10px] text-fg-tertiary">{description.length}/200</span>
                </div>
              </div>

              {/* Data Type & Length */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute -top-2.5 left-3 bg-white px-1 z-10">
                    <label className="label-small text-fg-tertiary uppercase">Tipo de dato*</label>
                  </div>
                  <div className="relative">
                    <select
                      value={dataType}
                      onChange={(e) => setDataType(e.target.value)}
                      className="w-full border border-border-tertiary rounded-xl px-4 py-3 label text-fg-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none bg-white"
                    >
                      <option>Texto</option>
                      <option>Número</option>
                      <option>Email</option>
                      <option>Fecha</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-tertiary pointer-events-none" />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-2.5 left-3 bg-white px-1 z-10">
                    <label className="label-small text-fg-tertiary uppercase">Longitud*</label>
                  </div>
                  <input
                    type="text"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full border border-border-tertiary rounded-xl px-4 py-3 label text-fg-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all bg-white"
                    placeholder="Longitud*"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 mt-10">
              <Button type="button" variant="Tertiary" size="s" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant="Primary"
                size="s"
                onClick={handleCreate}
                disabled={!name || !description}
              >
                Crear
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
