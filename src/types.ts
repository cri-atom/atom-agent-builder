export type NodeType = 'start' | 'agent' | 'end';

export interface Toolkit {
  id: string;
  name: string;
  icon: string;
  description: string;
  connected: boolean;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  toolkitId: string;
  toolkitName: string;
  // HTTP Request specific fields
  method?: string;
  url?: string;
  hasBody?: boolean;
  hasHeaders?: boolean;
  hasAuth?: boolean;
  saveResponse?: boolean;
  handleResponseCodes?: boolean;
  apiTimeout?: boolean;
}

export interface ResponseFormat {
  id: string;
  name: string;
  enabled: boolean;
  condition: string;
}

export interface AgentNodeData {
  label: string;
  instructions: string;
  llm: string;
  tools: Tool[];
  knowledgeBase: KnowledgeBaseDoc[];
  knowledgeBaseEnabled?: boolean;
  dynamicTableId?: string;
  saveFields: SaveField[];
  responseFormats?: ResponseFormat[];
  error?: string;
}

export interface KnowledgeBaseDoc {
  name: string;
  size: string;
  type?: string;
  updatedAt?: string;
}

export interface SaveField {
  id: string;
  label: string;
  description: string;
  type: 'required' | 'optional' | 'passive';
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'email';
}

export interface EndNodeData {
  label: string;
}

export interface LLMEdgeData {
  condition: string;
  name?: string;
  description?: string;
  isTimeout?: boolean;
  timeoutValue?: number;
  timeoutUnit?: 'min' | 'h';
}

export interface GlobalStage {
  id: string;
  name: string;
  type: 'Awareness' | 'Lead' | 'MQL' | 'SQL' | 'Opportunity' | 'Customer' | 'None' | '-';
  condition: string;
}

export interface GlobalTag {
  id: string;
  name: string;
  condition: string;
}

export interface GlobalConfig {
  generalInstructions: string;
  timezone: string;
  stagesVenta: GlobalStage[];
  stagesServicio: GlobalStage[];
  tags: GlobalTag[];
  pipelineType: 'venta' | 'servicio';
  saveFields: SaveField[];
}

export interface Flow {
  id: string;
  name: string;
  nodeCount: number;
  lastEdited: string;
  lastModifiedBy?: string;
  voice?: string;
  status?: 'publicado' | 'borrador' | 'activo' | 'inactivo';
  channel?: string;
  nodes: any[];
  edges: any[];
  globalConfig?: GlobalConfig;
}
