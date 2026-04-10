import React, { useCallback, useState, useEffect, useRef } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  MarkerType,
  useReactFlow,
  useStore,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Save,
  ArrowLeft,
  AlertCircle,
  Bot,
  History,
  Rocket,
  Smartphone,
  MoreHorizontal,
  X,
  Search,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { StartNode, AgentNode, EndNode } from './CustomNodes';
import { CustomEdge } from './CustomEdge';
import { motion, AnimatePresence } from 'motion/react';
import { FlowProvider } from '../context/FlowContext';
import { Button } from './Button';
import { ChatSimulator } from './ChatSimulator';
import { GlobalConfigPanel } from './GlobalConfigPanel';
import { SmartSuggestions } from './SmartSuggestions';
import { GlobalConfig } from '../types';
import { getFlowSuggestions } from '../services/geminiService';
import {
  CANVAS_CHROME_BOTTOM,
  CANVAS_CHROME_TOP,
  CANVAS_PANEL_WIDTH_PX,
} from '../lib/canvasChrome';

const nodeTypes = {
  start: StartNode,
  agent: AgentNode,
  end: EndNode,
};

const edgeTypes = {
  llm_condition: CustomEdge,
};

const barElevatedShadow =
  'shadow-[0px_6px_14px_0px_color-mix(in_srgb,var(--color-fg-primary)_8%,transparent)]';

interface CanvasProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  onSave: (nodes: Node[], edges: Edge[]) => void;
  onSelectElement: (element: any) => void;
  onDeleteElement: (id: string, type: 'node' | 'edge') => void;
  onDuplicateNode: (id: string) => void;
  onAddNode: (type: 'agent' | 'end', sourceId: string) => void;
  flowName: string;
  onNameChange: (name: string) => void;
  onBack: () => void;
  globalConfig: GlobalConfig;
  onUpdateGlobalConfig: (config: GlobalConfig) => void;
  /** Inspector derecho (ConfigPanel) abierto: reserva padding horizontal al grafo */
  rightInspectorOpen?: boolean;
}

function FlowBottomToolbar({
  isMenuOpen,
  setIsMenuOpen,
}: {
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const zoom = useStore((s) => s.transform[2]);
  const zoomPct = Math.round(zoom * 100);

  const toolIconBtn =
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-s)] text-fg-secondary hover:bg-bg-secondary';

  return (
    <div className="pointer-events-none absolute bottom-[var(--spacing-s)] left-1/2 z-[5] flex -translate-x-1/2">
      <div
        className={`pointer-events-auto flex h-10 items-center gap-[var(--spacing-xs)] rounded-[var(--radius-s)] border border-border-tertiary bg-bg-primary px-[var(--spacing-s)] ${barElevatedShadow}`}
      >
        <div className="flex items-center gap-0 border-r border-border-tertiary pr-[var(--spacing-xs)]">
          <button type="button" className={toolIconBtn} title="Deshacer" disabled aria-disabled>
            <Undo2 className="h-4 w-4 opacity-40" />
          </button>
          <button type="button" className={toolIconBtn} title="Rehacer" disabled aria-disabled>
            <Redo2 className="h-4 w-4 opacity-40" />
          </button>
        </div>
        <div className="flex items-center gap-[var(--spacing-s)]">
          <button type="button" className={toolIconBtn} title="Alejar" onClick={() => zoomOut()}>
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="caption min-w-[2.5rem] text-center text-fg-tertiary tabular-nums">
            {zoomPct}%
          </span>
          <button type="button" className={toolIconBtn} title="Acercar" onClick={() => zoomIn()}>
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={toolIconBtn}
            title="Ajustar vista"
            onClick={() => fitView({ padding: 0.2 })}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
        <div className="relative flex items-center border-l border-border-tertiary pl-[var(--spacing-xs)]">
          <button
            type="button"
            className={toolIconBtn}
            title="Más"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 flex-col gap-1 rounded-[var(--radius-s)] border border-border-tertiary bg-bg-primary p-2 shadow-lg"
              >
                <Button
                  variant="Tertiary"
                  size="s"
                  className="justify-start gap-2"
                  title="Historial de versiones"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <History className="h-4 w-4" />
                  <span className="caption">Historial</span>
                </Button>
                <Button
                  variant="Tertiary"
                  size="s"
                  className="justify-start gap-2"
                  title="Estado del flujo"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <AlertCircle className="h-4 w-4" />
                  <span className="caption">Estado</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export const Canvas: React.FC<CanvasProps> = ({
  initialNodes,
  initialEdges,
  onSave,
  onSelectElement,
  onDeleteElement,
  onDuplicateNode,
  onAddNode,
  flowName,
  onNameChange,
  onBack,
  globalConfig,
  onUpdateGlobalConfig,
  rightInspectorOpen = false,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes((nds) => {
      return initialNodes.map((inNode) => {
        const existingNode = nds.find((n) => n.id === inNode.id);
        return {
          ...(existingNode || {}),
          ...inNode,
        };
      });
    });

    setEdges((eds) => {
      return initialEdges.map((inEdge) => {
        const existingEdge = eds.find((e) => e.id === inEdge.id);
        return {
          ...(existingEdge || {}),
          ...inEdge,
        };
      });
    });
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const [isSaving, setIsSaving] = useState(false);

  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodesRef.current.find((n) => n.id === params.source);
      const isFirstEdge = sourceNode?.type === 'start';

      if (isFirstEdge) {
        const hasExistingEdge = edges.some((e) => e.source === params.source);
        if (hasExistingEdge) return;

        const targetNode = nodesRef.current.find((n) => n.id === params.target);
        if (targetNode?.type !== 'agent') return;
      }

      const newEdge = {
        ...params,
        type: 'llm_condition',
        data: { condition: '', name: '', isFirstEdge },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#A1A1AA' },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [edges, setEdges]
  );

  const onNodesDelete = useCallback(
    (_deleted: Node[]) => {
      onSelectElement(null);
    },
    [onSelectElement]
  );

  const onNodeClick = useCallback(
    (_: any, node: Node) => {
      onSelectElement(node);
    },
    [onSelectElement]
  );

  const onEdgeClick = useCallback(
    (_: any, edge: Edge) => {
      onSelectElement(edge);
    },
    [onSelectElement]
  );

  const onPaneClick = useCallback(() => {
    onSelectElement(null);
  }, [onSelectElement]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSave(nodes, edges);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [nodes, edges, onSave]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isChatSimulatorOpen, setIsChatSimulatorOpen] = useState(false);
  const [isGlobalConfigOpen, setIsGlobalConfigOpen] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const flowDesc = nodes.map((n) => n.data.label).join(', ');
      const newSuggestions = await getFlowSuggestions(flowDesc);
      setSuggestions(newSuggestions);
    };

    if (nodes.length > 0) {
      fetchSuggestions();
    }
  }, [nodes.length]);

  const handlePublish = async () => {
    setIsPublishing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsPublishing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    onSave(nodes, edges);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
  };

  const leftPad = isGlobalConfigOpen
    ? `calc(${CANVAS_PANEL_WIDTH_PX}px + var(--spacing-s) * 2)`
    : 'var(--spacing-s)';
  const rightPad = rightInspectorOpen
    ? `calc(${CANVAS_PANEL_WIDTH_PX}px + var(--spacing-s) * 2)`
    : 'var(--spacing-s)';

  return (
    <FlowProvider
      onAddNode={onAddNode}
      onDeleteNode={onDeleteElement}
      onDuplicateNode={onDuplicateNode}
      edges={edges}
    >
      <div className="relative h-full min-h-0 w-full flex-1 overflow-hidden bg-bg-secondary">
        <GlobalConfigPanel
          config={globalConfig}
          onUpdate={onUpdateGlobalConfig}
          isOpen={isGlobalConfigOpen}
          onToggle={() => setIsGlobalConfigOpen(!isGlobalConfigOpen)}
        />

        {/* Top-left actions (Figma Acciones_Izq) */}
        <div
          className={`absolute top-[var(--spacing-s)] left-[var(--spacing-s)] z-20 flex h-10 max-w-[min(100%,calc(100%-9rem))] items-center gap-[var(--spacing-xs)] rounded-[var(--radius-s)] bg-bg-primary px-[var(--spacing-xs)] py-0 ${barElevatedShadow}`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-s)] bg-primary">
            <Bot className="h-5 w-5 text-fg-inverse-primary" />
          </div>
          <Button variant="Tertiary" size="s" onClick={onBack} className="shrink-0 p-2">
            <ArrowLeft className="h-4 w-4 text-fg-secondary" />
          </Button>
          <input
            type="text"
            value={flowName}
            onChange={(e) => onNameChange(e.target.value)}
            className="min-w-0 flex-1 bg-transparent py-1 text-sm font-medium text-fg-primary placeholder:text-fg-tertiary focus:ring-0 focus:outline-none"
            placeholder="Nombre del flujo"
          />
          <Button
            variant="Tertiary"
            size="s"
            onClick={() => setIsSuggestionsOpen(!isSuggestionsOpen)}
            className={`shrink-0 p-2 ${isSuggestionsOpen ? 'text-primary' : 'text-fg-secondary'}`}
            title="Sugerencias IA"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Top-right actions (Figma Acciones_Der) */}
        <div
          className={`absolute top-[var(--spacing-s)] right-[var(--spacing-s)] z-20 flex h-10 items-center gap-[var(--spacing-xs)] rounded-[var(--radius-s)] bg-bg-primary px-[var(--spacing-xs)] py-0 ${barElevatedShadow}`}
        >
          <Button
            variant="Tertiary"
            size="s"
            loading={isSaving}
            onClick={handleSave}
            className="shrink-0 p-2"
            title="Guardar"
          >
            <Save className="h-4 w-4 text-fg-secondary" />
          </Button>
          <Button
            variant="Primary"
            size="s"
            loading={isPublishing}
            onClick={handlePublish}
            className="!min-h-0 shrink-0 gap-1 rounded-[var(--radius-s)] px-2 py-1"
            iconLeft={<Rocket className="h-4 w-4 shrink-0" />}
          >
            <span className="caption font-medium">Publicar</span>
          </Button>
          <Button
            variant="Tertiary"
            size="s"
            onClick={() => setIsChatSimulatorOpen(!isChatSimulatorOpen)}
            className={`!min-h-0 shrink-0 gap-1 rounded-[var(--radius-s)] px-2 py-1 ${
              isChatSimulatorOpen ? 'bg-primary/10 text-primary' : ''
            }`}
            iconLeft={<Smartphone className="h-4 w-4 shrink-0" />}
          >
            <span className="caption font-medium">Simular</span>
          </Button>
          <Button variant="Tertiary" size="s" onClick={onBack} className="shrink-0 p-2" title="Cerrar">
            <X className="h-4 w-4 text-fg-secondary" />
          </Button>
        </div>

        <div
          className="absolute inset-0 min-h-0"
          style={{
            paddingTop: CANVAS_CHROME_TOP,
            paddingBottom: CANVAS_CHROME_BOTTOM,
          }}
        >
          <div className="relative h-full min-h-0 w-full">
            <SmartSuggestions
              suggestions={suggestions}
              isOpen={isSuggestionsOpen}
              onAddNode={() => {
                onAddNode('agent', nodes[nodes.length - 1]?.id || 'start-1');
              }}
            />

            <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onNodesDelete={onNodesDelete}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            className="bg-bg-secondary"
            style={{
              paddingLeft: leftPad,
              paddingRight: rightPad,
            }}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={16} size={1} color="var(--color-border-tertiary, #d4d4d8)" />
            <FlowBottomToolbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
          </ReactFlow>
          </div>
        </div>

        <ChatSimulator
          isOpen={isChatSimulatorOpen}
          onClose={() => setIsChatSimulatorOpen(false)}
          agentName={flowName || 'Agente'}
        />
      </div>
    </FlowProvider>
  );
};
