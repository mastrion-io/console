export interface LocalModelSpec {
  id: string;
  name: string;
  family: string;
  parameterSize: string;
  quantization: string;
  contextLength: number;
  sizeBytes: number;
  status: 'installed' | 'available' | 'pulling';
  sovereign: boolean;
  pullProgressPercent?: number;
}

export interface FrontierProviderConfig {
  id: 'deepseek-cloud' | 'openai' | 'anthropic' | 'gemini' | 'bedrock' | 'groq';
  name: string;
  enabled: boolean;
  apiKeyMasked?: string;
  baseUrl?: string;
  defaultModel: string;
  availableModels: string[];
  maxCostCapDailyEur: number;
  piiScrubbingMandatory: boolean;
  zeroDataRetentionCertified: boolean;
  updatedAt: string;
}

export interface RoutingRule {
  id: string;
  name: string;
  description: string;
  matchPattern: string; // e.g. "code-completion", "pii-detected", "general-reasoning", "cost-center:cc-customer-ops"
  action: 'LOCAL_ONLY' | 'FRONTIER_WITH_SCRUB' | 'BUDGET_CIRCUIT_BREAKER' | 'AIRGAP_BLOCK';
  primaryTarget: string; // model id or provider id
  fallbackTarget: string;
  budgetCapDailyEur?: number;
  piiEnforcement: 'STRICT_SCRUB' | 'ALLOW_LOCAL' | 'BLOCK';
  enabled: boolean;
  priority: number;
}

export interface LLMAdminState {
  localModels: LocalModelSpec[];
  frontierProviders: FrontierProviderConfig[];
  routingRules: RoutingRule[];
  defaultLocalModel: string;
  defaultFrontierModel: string;
}
