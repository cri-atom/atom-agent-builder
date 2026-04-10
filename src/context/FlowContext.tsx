import React, { createContext, useContext } from 'react';
import { Edge } from 'reactflow';

interface FlowContextType {
  onAddNode: (type: 'agent' | 'end', sourceId: string) => void;
  onDeleteNode: (id: string, type: 'node' | 'edge') => void;
  onDuplicateNode: (id: string) => void;
  edges: Edge[];
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export const FlowProvider: React.FC<{ 
  children: React.ReactNode; 
  onAddNode: (type: 'agent' | 'end', sourceId: string) => void;
  onDeleteNode: (id: string, type: 'node' | 'edge') => void;
  onDuplicateNode: (id: string) => void;
  edges: Edge[];
}> = ({ children, onAddNode, onDeleteNode, onDuplicateNode, edges }) => {
  return (
    <FlowContext.Provider value={{ onAddNode, onDeleteNode, onDuplicateNode, edges }}>
      {children}
    </FlowContext.Provider>
  );
};

export const useFlowContext = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlowContext must be used within a FlowProvider');
  }
  return context;
};
