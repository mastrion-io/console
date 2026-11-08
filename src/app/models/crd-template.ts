export const DEFAULT_CRD_YAML = `apiVersion: networking.mastrion.io/v1alpha1
kind: AIEgressPolicy
metadata:
  name: corporate-sovereign-policy
  namespace: mastrion-system
  labels:
    app.kubernetes.io/managed-by: mastrion
    mastrion.io/tier: enterprise
spec:
  target: waypoint-ambient-socket
  isolation: hybrid-governed-cloud
  piiShield:
    enforce: true
    entities:
      - IBAN
      - Email
      - CreditCard
      - GermanTaxID
      - APIToken
    action: MaskAndLogHash
  finOps:
    radixCache: true
    costCenter: "CC-4421-PLATFORM"
    budgetGateDailyEur: 250.00
  compliance:
    standards:
      - "EU-AI-Act-Article-12"
      - "EU-AI-Act-Article-14"
      - "GDPR-Article-9"
      - "BaFin-VAIT-Cloud"
    auditSink: "s3://mastrion-audit-ledger-eu/compliance/"
  routeTable:
    - match:
        task:
          - code-completion
          - internal-refactor
          - unit-test-generation
      action: routeToDeepSeekLocal
      backend: "deepseek-coder:6.7b@server-3.local:11434"
      costImpact: "EUR 0.00"
      budgetGate: bypass
    - match:
        containsPII: true
      action: forceScrubThenLocalDeepSeek
      backend: "deepseek-r1:1.5b@server-3.local:11434"
      costImpact: "EUR 0.00"
      budgetGate: enforce
    - match:
        userRole: compliance-auditor
      action: auditMirrorAndAllowCloud
      backend: "governed-egress-tunnel"
      costImpact: "metered"
      budgetGate: enforce
`;
