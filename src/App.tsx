/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import './lib/animations';
import { Node, Edge, MarkerType } from 'reactflow';
import { DashboardLayout } from './components/DashboardLayout';
import { Dashboard } from './components/Dashboard';
import { Settings } from 'lucide-react';
import { Canvas } from './components/Canvas';
import { ConfigPanel } from './components/ConfigPanel';
import { PromptEditorModal } from './components/PromptEditorModal';
import { Flow, GlobalConfig } from './types';
import { AnimatePresence } from 'motion/react';

const INITIAL_FLOWS: Flow[] = [
  {
    id: '1',
    name: 'Lis da Div Design',
    nodeCount: 4,
    lastEdited: '01/04/26, 09:45 a. m.',
    lastModifiedBy: 'Maria Pereira',
    voice: 'Español (MX)',
    status: 'publicado',
    channel: 'WhatsApp',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 250, y: 0 },
        data: { label: 'Inicio' },
      },
      {
        id: 'agent-1',
        type: 'agent',
        position: { x: 250, y: 150 },
        data: { 
          label: 'Automotriz', 
          instructions: 'Eres "Stella", la asistente virtual oficial de Stellantis...', 
          llm: 'gemini-pro',
          tools: [],
          knowledgeBase: [],
          saveFields: []
        },
      },
      {
        id: 'agent-2',
        type: 'agent',
        position: { x: 50, y: 350 },
        data: { 
          label: 'Inventario', 
          instructions: 'Eres el agente de inventario de Stellantis...', 
          llm: 'gemini-pro',
          tools: [],
          knowledgeBase: [],
          saveFields: []
        },
      },
      {
        id: 'agent-3',
        type: 'agent',
        position: { x: 450, y: 350 },
        data: { 
          label: 'Agendar', 
          instructions: 'Eres el agente de agendamiento de pruebas de manejo...', 
          llm: 'gemini-pro',
          tools: ['Calendly'],
          knowledgeBase: [],
          saveFields: []
        },
      },
    ],
    edges: [
      { 
        id: 'e1-2', 
        source: 'start-1', 
        target: 'agent-1', 
        markerEnd: { type: MarkerType.ArrowClosed, color: '#A1A1AA' } 
      },
      { 
        id: 'e2-3', 
        source: 'agent-1', 
        target: 'agent-2', 
        type: 'llm_condition', 
        data: { condition: 'Inventario' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#A1A1AA' } 
      },
      { 
        id: 'e2-4', 
        source: 'agent-1', 
        target: 'agent-3', 
        type: 'llm_condition', 
        data: { condition: 'Agendamiento' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#A1A1AA' } 
      },
    ],
  },
  {
    id: '2',
    name: 'FB Lis da Div Design',
    nodeCount: 3,
    lastEdited: '31/03/26, 03:41 p. m.',
    lastModifiedBy: 'Maria Pereira',
    voice: 'Español (MX)',
    status: 'publicado',
    channel: 'Messenger',
    nodes: [],
    edges: [],
  },
  {
    id: '3',
    name: 'IG Lis da Div Design',
    nodeCount: 3,
    lastEdited: '31/03/26, 03:34 p. m.',
    lastModifiedBy: 'Maria Pereira',
    voice: 'Español (MX)',
    status: 'borrador',
    channel: 'Instagram',
    nodes: [],
    edges: [],
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeModule, setActiveModule] = useState('campanas');
  const [flows, setFlows] = useState<Flow[]>(INITIAL_FLOWS);
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [isPromptEditorOpen, setIsPromptEditorOpen] = useState(false);
  const [isGlobalConfigOpen, setIsGlobalConfigOpen] = useState(false);

  const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
    generalInstructions: '',
    timezone: 'Argentina - Buenos Aires',
    stagesVenta: [],
    stagesServicio: [],
    tags: [],
    pipelineType: 'venta',
    saveFields: [],
  };

  const currentFlow = useMemo(() =>
    flows.find(f => f.id === currentFlowId),
    [flows, currentFlowId]
  );

  const isCanvasEditorView = useMemo(
    () =>
      (activeModule === 'agentes' || activeModule === 'campanas') &&
      activeTab === 'agents' &&
      !!currentFlow,
    [activeModule, activeTab, currentFlow]
  );

  const handleNewAgent = useCallback(() => {
    const newId = Math.random().toString(36).substr(2, 9);
    const agentId = `agent-${Math.random().toString(36).substr(2, 9)}`;
    const timeoutEndId = `end-${Math.random().toString(36).substr(2, 9)}`;
    
    const newFlow: Flow = {
      id: newId,
      name: 'Nuevo Agente',
      nodeCount: 3,
      lastEdited: 'ahora',
      nodes: [
        {
          id: 'start-1',
          type: 'start',
          position: { x: 250, y: 0 },
          data: { label: 'Inicio' },
        },
        {
          id: agentId,
          type: 'agent',
          position: { x: 250, y: 150 },
          data: { 
            label: 'Nuevo Agente',
            instructions: '', 
            tools: [], 
            knowledgeBase: [], 
            saveFields: [] 
          },
        },
        {
          id: timeoutEndId,
          type: 'end',
          position: { x: 450, y: 300 },
          data: { label: 'Fin por inactividad' },
        },
      ],
      edges: [
        { 
          id: `e-start-1-${agentId}`, 
          source: 'start-1', 
          target: agentId, 
          markerEnd: { type: MarkerType.ArrowClosed, color: '#A1A1AA' } 
        },
        { 
          id: `e-${agentId}-${timeoutEndId}`, 
          source: agentId, 
          target: timeoutEndId, 
          type: 'llm_condition',
          data: { 
            condition: 'Sin respuesta (10 min)', 
            name: 'Sin respuesta',
            isTimeout: true,
            timeoutValue: 10,
            timeoutUnit: 'min'
          },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#A1A1AA' } 
        },
      ],
    };
    setFlows(prev => [newFlow, ...prev]);
    setCurrentFlowId(newId);
    setSelectedElement(null);
    setActiveTab('agents');
  }, []);

  const handleOpenAgent = useCallback((id: string) => {
    setCurrentFlowId(id);
    setSelectedElement(null);
    setActiveTab('agents');
  }, []);

  const handleDeleteAgent = useCallback((id: string) => {
    setFlows(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleDuplicateAgent = useCallback((id: string) => {
    const flowToDuplicate = flows.find(f => f.id === id);
    if (flowToDuplicate) {
      const newFlow = {
        ...flowToDuplicate,
        id: Math.random().toString(36).substr(2, 9),
        name: `${flowToDuplicate.name} (Copia)`,
        lastEdited: 'ahora',
      };
      setFlows(prev => [newFlow, ...prev]);
    }
  }, [flows]);

  const handleSaveFlow = useCallback((nodes: Node[], edges: Edge[]) => {
    if (!currentFlowId) return;
    setFlows(prev => prev.map(f => 
      f.id === currentFlowId 
        ? { ...f, nodes, edges, nodeCount: nodes.length, lastEdited: 'ahora' } 
        : f
    ));
  }, [currentFlowId]);

  const handleUpdateElement = useCallback((data: any) => {
    if (!currentFlowId || !selectedElement) return;
    
    const isNode = 'position' in selectedElement;
    setFlows(prev => prev.map(f => {
      if (f.id !== currentFlowId) return f;
      if (isNode) {
        return {
          ...f,
          nodes: f.nodes.map(n => n.id === selectedElement.id ? { ...n, data } : n)
        };
      } else {
        return {
          ...f,
          edges: f.edges.map(e => e.id === selectedElement.id ? { ...e, data } : e)
        };
      }
    }));
    setSelectedElement(prev => prev ? { ...prev, data } : null);
  }, [currentFlowId, selectedElement]);

  const handleUpdateGlobalConfig = useCallback((config: GlobalConfig) => {
    if (!currentFlowId) return;
    setFlows(prev => prev.map(f => 
      f.id === currentFlowId ? { ...f, globalConfig: config } : f
    ));
  }, [currentFlowId]);

  const handleNameChange = useCallback((name: string) => {
    if (!currentFlowId) return;
    setFlows(prev => prev.map(f => 
      f.id === currentFlowId ? { ...f, name } : f
    ));
  }, [currentFlowId]);

  const handleDeleteElement = useCallback((id: string, type: 'node' | 'edge') => {
    if (!currentFlowId) return;
    setFlows(prev => prev.map(f => {
      if (f.id !== currentFlowId) return f;
      if (type === 'node') {
        const nodeToDelete = f.nodes.find(n => n.id === id);
        if (nodeToDelete?.type === 'start') return f; // Prevent deleting start node

        return {
          ...f,
          nodes: f.nodes.filter(n => n.id !== id),
          edges: f.edges.filter(e => e.source !== id && e.target !== id),
        };
      } else {
        return {
          ...f,
          edges: f.edges.filter(e => e.id !== id),
        };
      }
    }));
    setSelectedElement(null);
  }, [currentFlowId]);

  const handleDuplicateElement = useCallback((id: string) => {
    if (!currentFlowId) return;
    setFlows(prev => prev.map(f => {
      if (f.id !== currentFlowId) return f;
      const nodeToDuplicate = f.nodes.find(n => n.id === id);
      if (!nodeToDuplicate || nodeToDuplicate.type === 'start') return f; // Prevent duplicating start node

      const newNodeId = `${nodeToDuplicate.type}-${Math.random().toString(36).substr(2, 9)}`;
      const newNode = {
        ...nodeToDuplicate,
        id: newNodeId,
        position: {
          x: nodeToDuplicate.position.x + 50,
          y: nodeToDuplicate.position.y + 50,
        },
        selected: true
      };

      // Deselect other nodes
      const updatedNodes = f.nodes.map(n => ({ ...n, selected: false }));
      
      setSelectedElement(newNode);

      return {
        ...f,
        nodes: [...updatedNodes, newNode],
        nodeCount: f.nodes.length + 1,
        lastEdited: 'ahora'
      };
    }));
  }, [currentFlowId]);

  const handleAddNode = useCallback((type: 'agent' | 'end', sourceId: string) => {
    if (!currentFlowId) return;
    const newNodeId = `${type}-${Math.random().toString(36).substr(2, 9)}`;
    
    setFlows(prev => prev.map(f => {
      if (f.id !== currentFlowId) return f;
      const sourceNode = f.nodes.find(n => n.id === sourceId);
      if (!sourceNode) return f;

      // Start node can only have one branch to an agent
      if (sourceNode.type === 'start') {
        const hasExistingEdge = f.edges.some(e => e.source === sourceId);
        if (hasExistingEdge || type !== 'agent') return f;
      }

      const newNode: Node = {
        id: newNodeId,
        type,
        position: { x: sourceNode.position.x, y: sourceNode.position.y + 150 },
        data: { 
          label: type === 'agent' ? 'Nuevo Agente' : 'Fin',
          instructions: '', 
          tools: [], 
          knowledgeBase: [], 
          saveFields: [] 
        },
      };

      const isFirstEdge = sourceNode.type === 'start';
      const newEdge = {
        id: `e-${sourceId}-${newNodeId}`,
        source: sourceId,
        target: newNodeId,
        type: 'llm_condition',
        data: { condition: '', name: '', isFirstEdge },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#A1A1AA' },
      };

      let additionalNodes: Node[] = [];
      let additionalEdges: Edge[] = [];

      if (type === 'agent') {
        const timeoutEndId = `end-${Math.random().toString(36).substr(2, 9)}`;
        const timeoutEndNode: Node = {
          id: timeoutEndId,
          type: 'end',
          position: { x: newNode.position.x + 200, y: newNode.position.y + 150 },
          data: { label: 'Fin por inactividad' },
        };
        
        const timeoutEdge = {
          id: `e-${newNodeId}-${timeoutEndId}`,
          source: newNodeId,
          target: timeoutEndId,
          type: 'llm_condition',
          data: { 
            condition: 'Sin respuesta (10 min)', 
            name: 'Sin respuesta',
            isTimeout: true,
            timeoutValue: 10,
            timeoutUnit: 'min'
          },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#A1A1AA' },
        };
        
        additionalNodes = [timeoutEndNode];
        additionalEdges = [timeoutEdge];
      }

      return {
        ...f,
        nodes: [...f.nodes, newNode, ...additionalNodes],
        edges: [...f.edges, newEdge, ...additionalEdges],
        nodeCount: f.nodes.length + 1 + additionalNodes.length,
        lastEdited: 'ahora'
      };
    }));
  }, [currentFlowId]);

  return (
    <DashboardLayout 
      activeModule={activeModule} 
      onModuleChange={setActiveModule}
      isCompact={activeTab === 'agents'}
      hideSidebar={isCanvasEditorView}
      hideTopBar={isCanvasEditorView}
    >
      {activeModule === 'agentes' || activeModule === 'campanas' ? (
        <div className="h-full flex overflow-hidden relative">
          <main className="flex-1 flex overflow-hidden relative">
            {activeTab === 'dashboard' ? (
              <Dashboard
                flows={flows}
                onNewAgent={handleNewAgent}
                onOpenAgent={handleOpenAgent}
                onDeleteAgent={handleDeleteAgent}
                onDuplicateAgent={handleDuplicateAgent}
              />
            ) : currentFlow ? (
              <>
                <Canvas
                  key={currentFlow.id}
                  initialNodes={currentFlow.nodes}
                  initialEdges={currentFlow.edges}
                  onSave={handleSaveFlow}
                  onSelectElement={setSelectedElement}
                  onDeleteElement={handleDeleteElement}
                  onDuplicateNode={handleDuplicateElement}
                  onAddNode={handleAddNode}
                  flowName={currentFlow.name}
                  onNameChange={handleNameChange}
                  onBack={() => setActiveTab('dashboard')}
                  globalConfig={currentFlow.globalConfig || DEFAULT_GLOBAL_CONFIG}
                  onUpdateGlobalConfig={handleUpdateGlobalConfig}
                  rightInspectorOpen={!!selectedElement}
                />
                <AnimatePresence>
                  {selectedElement && (
                    <ConfigPanel
                      selectedElement={selectedElement}
                      onUpdate={handleUpdateElement}
                      onDelete={() => handleDeleteElement(selectedElement.id, 'position' in selectedElement ? 'node' : 'edge')}
                      onDuplicate={() => handleDuplicateElement(selectedElement.id)}
                      onClose={() => setSelectedElement(null)}
                      onOpenPromptEditor={() => setIsPromptEditorOpen(true)}
                    />
                  )}
                </AnimatePresence>

                <PromptEditorModal
                  isOpen={isPromptEditorOpen}
                  onClose={() => setIsPromptEditorOpen(false)}
                  nodeId={selectedElement?.id || ''}
                  data={selectedElement?.data || {}}
                  onUpdate={handleUpdateElement}
                  edges={currentFlow.edges}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="body text-fg-tertiary">Selecciona un agente para comenzar</p>
              </div>
            )}
          </main>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Módulo en Desarrollo</h2>
            <p className="text-gray-500">Estamos trabajando para traerte esta funcionalidad muy pronto.</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
