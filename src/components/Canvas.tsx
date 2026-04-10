import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Save, Play, MessageSquare, Trash2, Copy, ZoomIn, ZoomOut, Maximize, 
  ArrowLeft, AlertCircle, Bot, History, Rocket, Smartphone, MoreHorizontal, X, Globe 
} from 'lucide-react';
import { StartNode, AgentNode, EndNode } from './CustomNodes';
import { CustomEdge } from './CustomEdge';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { FlowProvider } from '../context/FlowContext';
import { Button } from './Button';
import { ChatSimulator } from './ChatSimulator';
import { GlobalConfigPanel } from './GlobalConfigPanel';
import { GlobalConfig } from '../types';

const nodeTypes = {
  start: StartNode,
  agent: AgentNode,
  end: EndNode,
};

const edgeTypes = {
  llm_condition: CustomEdge,
};

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
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync nodes and edges from parent
  useEffect(() => {
    setNodes((nds) => {
      return initialNodes.map((inNode) => {
        const existingNode = nds.find((n) => n.id === inNode.id);
        return {
          ...(existingNode || {}),
          ...inNode
        };
      });
    });

    setEdges((eds) => {
      return initialEdges.map((inEdge) => {
        const existingEdge = eds.find((e) => e.id === inEdge.id);
        return {
          ...(existingEdge || {}),
          ...inEdge
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
      const sourceNode = nodesRef.current.find(n => n.id === params.source);
      const isFirstEdge = sourceNode?.type === 'start';
      
      if (isFirstEdge) {
        const hasExistingEdge = edges.some(e => e.source === params.source);
        if (hasExistingEdge) return; // Only one branch from start
        
        const targetNode = nodesRef.current.find(n => n.id === params.target);
        if (targetNode?.type !== 'agent') return; // Only to an agent
      }

      const newEdge = {
        ...params,
        type: 'llm_condition',
        data: { condition: '', name: '', isFirstEdge },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#A1A1AA' },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onNodesDelete = useCallback((deleted: Node[]) => {
    onSelectElement(null);
  }, [onSelectElement]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    onSelectElement(node);
  }, [onSelectElement]);

  const onEdgeClick = useCallback((_: any, edge: Edge) => {
    onSelectElement(edge);
  }, [onSelectElement]);

  const onPaneClick = useCallback(() => {
    onSelectElement(null);
  }, [onSelectElement]);

  // Auto-save with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      onSave(nodes, edges);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [nodes, edges, onSave]);

  // Mock validity for now
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isChatSimulatorOpen, setIsChatSimulatorOpen] = useState(false);
  const [isGlobalConfigOpen, setIsGlobalConfigOpen] = useState(true);

  const handlePublish = async () => {
    setIsPublishing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPublishing(false);
    setIsMenuOpen(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    onSave(nodes, edges);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setIsMenuOpen(false);
  };

  return (
    <FlowProvider onAddNode={onAddNode} onDeleteNode={onDeleteElement} onDuplicateNode={onDuplicateNode} edges={edges}>
      <div className="flex-1 relative bg-[#F8F9FA] h-full overflow-hidden flex">
        <GlobalConfigPanel
          config={globalConfig}
          onUpdate={onUpdateGlobalConfig}
          isOpen={isGlobalConfigOpen}
          onToggle={() => setIsGlobalConfigOpen(!isGlobalConfigOpen)}
        />
        <div className="flex-1 relative h-full overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-10 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Button 
            variant="Tertiary" 
            size="s" 
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="h-6 w-[1px] bg-gray-200 mx-2" />
          <div className="w-8 h-8 bg-[#FF6B00] rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="h-6 w-[1px] bg-gray-200 mx-2" />
          <input
            type="text"
            value={flowName}
            onChange={(e) => onNameChange(e.target.value)}
            className="text-lg font-bold text-[#1A1A1A] bg-transparent border-none focus:ring-0 p-0 w-auto min-w-[200px]"
            placeholder="Nombre del flujo"
          />
        </div>
        <div className="flex items-center gap-3">
          {/* Top Publish button removed as requested */}
        </div>
      </div>

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
      >
        <Controls showInteractive={false} className="!bg-bg-primary !border-border-tertiary !rounded-xl overflow-hidden" />
        
        <Panel position="bottom-right" className="mb-6 mr-6 flex flex-col items-end gap-4">
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex flex-col gap-3 items-center mb-2"
              >
                <Button 
                  variant="Tertiary" 
                  size="m" 
                  className="rounded-full w-12 h-12 bg-[#4A4A4A] text-white hover:bg-[#333333] shadow-lg p-0"
                  title="Historial de versiones"
                >
                  <History className="w-5 h-5" />
                </Button>
                <Button 
                  variant="Tertiary" 
                  size="m" 
                  loading={isPublishing}
                  onClick={handlePublish}
                  className="rounded-full w-12 h-12 bg-[#4A4A4A] text-white hover:bg-[#333333] shadow-lg p-0"
                  title="Publicar"
                >
                  <Rocket className="w-5 h-5" />
                </Button>
                <Button 
                  variant="Tertiary" 
                  size="m" 
                  loading={isSaving}
                  className="rounded-full w-12 h-12 bg-[#4A4A4A] text-white hover:bg-[#333333] shadow-lg p-0"
                  title="Guardar"
                  onClick={handleSave}
                >
                  <Save className="w-5 h-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3">
            <Button 
              variant="Tertiary" 
              size="m" 
              className="rounded-full w-12 h-12 bg-[#D4D4D8] text-[#52525C] hover:bg-[#E4E4E7] shadow-lg p-0"
            >
              <AlertCircle className="w-6 h-6" />
            </Button>
            <Button 
              variant="Tertiary" 
              size="m" 
              className={`rounded-full w-12 h-12 shadow-lg p-0 transition-all ${
                isChatSimulatorOpen ? 'bg-primary text-white' : 'bg-[#4A4A4A] text-white hover:bg-[#333333]'
              }`}
              title="Simular chat"
              onClick={() => setIsChatSimulatorOpen(!isChatSimulatorOpen)}
            >
              <Smartphone className="w-6 h-6" />
            </Button>
            <Button 
              variant="Primary" 
              size="xl" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-full w-14 h-14 shadow-xl shadow-primary/20 hover:scale-105 p-0 flex items-center justify-center"
            >
              <MoreHorizontal className="w-8 h-8" />
            </Button>
            <Button 
              variant="Tertiary" 
              size="m" 
              className="rounded-full w-12 h-12 bg-[#4A4A4A] text-white hover:bg-[#333333] shadow-lg p-0"
              onClick={onBack}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </Panel>
      </ReactFlow>

      <ChatSimulator 
        isOpen={isChatSimulatorOpen} 
        onClose={() => setIsChatSimulatorOpen(false)}
        agentName={flowName || 'Agente'}
      />
        </div>
      </div>
    </FlowProvider>
  );
};
