import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, ChevronDown, Info, Play, Settings2 } from 'lucide-react';
import { Tool } from '../types';
import { Button } from './Button';

interface HttpRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tool: Tool) => void;
  initialData?: Tool;
}

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button 
    onClick={() => onChange(!checked)}
    className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${checked ? 'bg-primary' : 'bg-bg-quaternary'}`}
  >
    <motion.div 
      animate={{ x: checked ? 20 : 2 }}
      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
    />
  </button>
);

const AdvancedToggle = ({ title, description, checked, onChange, hasInfo }: any) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-border-tertiary shadow-sm">
    <div className="space-y-1 flex-1 pr-4">
      <div className="flex items-center gap-1.5">
        <p className="h4 text-fg-primary">{title}</p>
        {hasInfo && <Info className="w-3.5 h-3.5 text-fg-tertiary" />}
      </div>
      <p className="caption text-fg-tertiary">{description}</p>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

export const HttpRequestModal: React.FC<HttpRequestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [name, setName] = useState('Petición HTTP #1');
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [hasBody, setHasBody] = useState(false);
  const [hasHeaders, setHasHeaders] = useState(false);
  const [hasAuth, setHasAuth] = useState(false);
  const [saveResponse, setSaveResponse] = useState(false);
  const [handleResponseCodes, setHandleResponseCodes] = useState(false);
  const [apiTimeout, setApiTimeout] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || 'Petición HTTP #1');
      setMethod(initialData.method || 'GET');
      setUrl(initialData.url || '');
      setHasBody(initialData.hasBody || false);
      setHasHeaders(initialData.hasHeaders || false);
      setHasAuth(initialData.hasAuth || false);
      setSaveResponse(initialData.saveResponse || false);
      setHandleResponseCodes(initialData.handleResponseCodes || false);
      setApiTimeout(initialData.apiTimeout || false);
    }
  }, [initialData]);

  const handleSave = () => {
    const tool: Tool = {
      id: initialData?.id || `http-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: `Petición HTTP ${method} a ${url}`,
      toolkitId: 'http',
      toolkitName: 'HTTP Request',
      method,
      url,
      hasBody,
      hasHeaders,
      hasAuth,
      saveResponse,
      handleResponseCodes,
      apiTimeout
    };
    onSave(tool);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-bg-primary w-full max-w-lg rounded-3xl flex flex-col overflow-hidden border border-border-tertiary shadow-2xl max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-border-tertiary flex items-center justify-between bg-bg-primary shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-[#34A853]/10 px-2 py-1 rounded-md">
                  <span className="text-[#34A853] font-bold text-[10px] tracking-wider uppercase">HTTP</span>
                </div>
                <h2 className="h2 text-fg-primary">{name}</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-bg-tertiary rounded-xl transition-all">
                <X className="w-6 h-6 text-fg-tertiary" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <p className="body text-fg-secondary">
                Configura una petición HTTP para conectar con sistemas externos.
              </p>

              {/* Info Section */}
              <div className="border border-border-tertiary rounded-2xl overflow-hidden">
                <Button
                  type="button"
                  variant="Tertiary"
                  size="l"
                  onClick={() => setIsInfoOpen(!isInfoOpen)}
                  className="w-full !min-h-0 justify-between rounded-none border-0 bg-secondary-blue/30 px-5 py-4 text-left font-normal text-fg-status-info hover:bg-secondary-blue/50"
                  iconLeft={<Info className="w-5 h-5 shrink-0 text-fg-status-info" />}
                  iconRight={
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 text-fg-status-info transition-transform ${isInfoOpen ? 'rotate-180' : ''}`}
                    />
                  }
                >
                  <span className="h4 flex-1 text-left font-semibold text-fg-status-info">Conoce la petición HTTP</span>
                </Button>
                <AnimatePresence>
                  {isInfoOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 bg-white caption text-fg-tertiary border-t border-border-tertiary">
                        Las peticiones HTTP te permiten enviar y recibir datos de servicios externos a través de su API. Puedes configurar el método, la URL, los encabezados y el cuerpo de la petición.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Basic Config */}
              <div className="space-y-6">
                <h3 className="h3 text-fg-primary">Configuración básica</h3>
                
                <div className="space-y-2">
                  <label className="label text-fg-tertiary">Método de la petición*</label>
                  <div className="relative">
                    <select 
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="w-full bg-bg-secondary border border-border-tertiary rounded-2xl px-4 py-3.5 caption text-fg-primary appearance-none focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-fg-tertiary pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="label text-fg-tertiary">URL del servicio y parámetros*</label>
                  <div className="relative group">
                    <input 
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://api.ejemplo.com/v1/recurso"
                      className="w-full bg-bg-secondary border border-border-tertiary rounded-2xl pl-4 pr-12 py-3.5 caption text-fg-primary focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-bg-tertiary rounded-lg">
                      <Globe className="w-4 h-4 text-fg-tertiary" />
                    </div>
                  </div>
                  <p className="footnote text-fg-tertiary">Dirección web donde enviar la petición</p>
                </div>

                <Button
                  type="button"
                  variant="Primary"
                  size="l"
                  disabled
                  className="w-full"
                  iconLeft={<Play className="w-4 h-4 fill-current" />}
                >
                  Probar petición
                </Button>
              </div>

              {/* Toggles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-bg-secondary rounded-2xl border border-border-tertiary">
                  <div className="space-y-1 pr-4">
                    <p className="h4 text-fg-primary">Cuerpo de la petición</p>
                    <p className="caption text-fg-tertiary">Especifica los datos que se enviarán en el cuerpo de la petición HTTP, en formato JSON.</p>
                  </div>
                  <Toggle checked={hasBody} onChange={setHasBody} />
                </div>

                <div className="flex items-center justify-between p-5 bg-bg-secondary rounded-2xl border border-border-tertiary">
                  <div className="space-y-1 pr-4">
                    <p className="h4 text-fg-primary">Encabezados</p>
                    <p className="caption text-fg-tertiary">Agrega los encabezados necesarios para ejecutar la petición.</p>
                  </div>
                  <Toggle checked={hasHeaders} onChange={setHasHeaders} />
                </div>
              </div>

              {/* Advanced Config */}
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="Tertiary"
                  size="m"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="w-full !min-h-0 justify-between rounded-none border-0 py-2 font-normal shadow-none"
                  iconRight={
                    <ChevronDown
                      className={`w-6 h-6 shrink-0 text-fg-tertiary transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`}
                    />
                  }
                >
                  <span className="h3 text-fg-primary">Configuraciones avanzadas</span>
                </Button>

                <AnimatePresence>
                  {isAdvancedOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <AdvancedToggle 
                        title="Autorización"
                        description="Configura el tipo de autorización que requiere la petición HTTP, como OAuth 2.0 o Basic Auth."
                        checked={hasAuth}
                        onChange={setHasAuth}
                      />
                      <AdvancedToggle 
                        title="Guardar respuesta"
                        description="Guarda los valores de la respuesta HTTP en campos de información de Atom."
                        checked={saveResponse}
                        onChange={setSaveResponse}
                      />
                      <AdvancedToggle 
                        title="Manejo de códigos de respuesta"
                        description="Gestiona el éxito o error de la petición según el código de respuesta HTTP."
                        checked={handleResponseCodes}
                        onChange={setHandleResponseCodes}
                        hasInfo
                      />
                      <AdvancedToggle 
                        title="Tiempo de espera de API"
                        description="Define el tiempo máximo en segundos que se esperará para obtener una respuesta del API."
                        checked={apiTimeout}
                        onChange={setApiTimeout}
                        hasInfo
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-border-tertiary bg-bg-secondary/30 flex justify-end gap-3 shrink-0">
              <Button variant="Tertiary" onClick={onClose}>Cancelar</Button>
              <Button variant="Primary" onClick={handleSave}>Guardar configuración</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
