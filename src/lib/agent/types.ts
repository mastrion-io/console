export type AgentRole = 'user' | 'assistant';

export type ToolCallStatus = 'pending' | 'running' | 'success' | 'error';

export type ToolKind = 'read' | 'write';

export interface ToolArgumentEntry {
  key: string;
  value: string;
}

export interface ToolCallCard {
  kind: 'tool_call';
  id: string;
  toolName: string;
  toolKind: ToolKind;
  arguments: ToolArgumentEntry[];
  durationMs: number;
  status: ToolCallStatus;
}

export type ToolResultColumnType = 'text' | 'number' | 'mono';

export interface ToolResultColumn {
  key: string;
  label: string;
  type: ToolResultColumnType;
}

export type ToolResultRow = Record<string, string | number>;

export interface ToolResultCard {
  kind: 'tool_result';
  id: string;
  toolName: string;
  summary: string;
  columns: ToolResultColumn[];
  rows: ToolResultRow[];
  truncated: boolean;
}

export interface ConfirmationCard {
  kind: 'confirmation';
  id: string;
  toolName: string;
  humanSentence: string;
  arguments: ToolArgumentEntry[];
  status: 'awaiting' | 'confirmed' | 'cancelled';
}

export interface AssistantProse {
  kind: 'prose';
  id: string;
  text: string;
}

export type TranscriptItem =
  | AssistantProse
  | ToolCallCard
  | ToolResultCard
  | ConfirmationCard;

export interface AgentMessage {
  id: string;
  role: AgentRole;
  seq: number;
  items: TranscriptItem[];
}

export interface StreamFrame {
  seq: number;
  messageId: string;
  item: TranscriptItem;
}

export type StreamState = 'idle' | 'streaming' | 'interrupted' | 'complete';

export interface AgentContextChip {
  id: string;
  label: string;
  value: string;
}

export interface SuggestedQuestion {
  id: string;
  text: string;
}
