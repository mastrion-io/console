export type Role = 'PLATFORM_ADMIN' | 'COMPLIANCE_AUDITOR' | 'FINOPS_LEAD' | 'DEVELOPER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  costCenter: string;
  mfaEnabled: boolean;
  status: 'active' | 'invited' | 'suspended';
  lastLogin: string;
  apiKeyMasked?: string;
}

export interface SetupConfig {
  completed: boolean;
  clusterName: string;
  adminEmail: string;
  primarySiliconHost: string;
  defaultLocalModel: string;
  auditKeyConfigured: boolean;
  telemetryMode: 'airgapped' | 'federated';
  installedAt?: string;
}
