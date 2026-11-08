import { User, SetupConfig } from './types';

export const INITIAL_SETUP: SetupConfig = {
  completed: true, // Default to true for dev/preview; setup wizard accessible at /setup
  clusterName: 'mst-cluster-fra-01',
  adminEmail: 'admin@mastrion.local',
  primarySiliconHost: 'http://127.0.0.1:11434',
  defaultLocalModel: 'deepseek-r1:1.5b',
  auditKeyConfigured: true,
  telemetryMode: 'airgapped',
  installedAt: '2026-11-06T09:30:00Z',
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    email: 'admin@mastrion.local',
    name: 'Platform Administrator',
    role: 'PLATFORM_ADMIN',
    costCenter: 'CC-4421-PLATFORM',
    mfaEnabled: true,
    status: 'active',
    lastLogin: '2026-11-08T13:40:00Z',
    apiKeyMasked: 'mst_sec_••••••••••••94f2',
  },
  {
    id: 'usr-auditor-1',
    email: 'compliance@mastrion.local',
    name: 'Chief Compliance Officer',
    role: 'COMPLIANCE_AUDITOR',
    costCenter: 'CC-4422-COMPLIANCE',
    mfaEnabled: true,
    status: 'active',
    lastLogin: '2026-11-08T11:15:00Z',
    apiKeyMasked: 'mst_sec_••••••••••••331b',
  },
  {
    id: 'usr-finops-1',
    email: 'cfo@mastrion.local',
    name: 'FinOps Controller',
    role: 'FINOPS_LEAD',
    costCenter: 'CC-4423-FINOPS',
    mfaEnabled: true,
    status: 'active',
    lastLogin: '2026-11-07T18:00:00Z',
    apiKeyMasked: 'mst_sec_••••••••••••a77c',
  },
  {
    id: 'usr-dev-1',
    email: 'engineer@mastrion.local',
    name: 'Senior Platform Engineer',
    role: 'DEVELOPER',
    costCenter: 'CC-4421-PLATFORM',
    mfaEnabled: false,
    status: 'active',
    lastLogin: '2026-11-08T12:05:00Z',
    apiKeyMasked: 'mst_sec_••••••••••••8819',
  },
];
