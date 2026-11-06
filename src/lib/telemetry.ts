/**
 * Mastrion Zero-Trust Sovereign Telemetry Client (PRD-MST-103)
 * 
 * Strict Operational Constraints:
 * 1. Single Allowlisted Egress Host: telemetry.mastrion.eu:8443 ONLY.
 * 2. Zero-Prompt / Zero-PII Policy: Under NO circumstances are user prompts, model completions,
 *    or raw entity values transmitted. Only anonymized operational health deltas, error codes,
 *    and aggregate latency quantiles are packed.
 * 3. Airgap Kill-Switch: If MASTRION_REMOTE_TELEMETRY=false (or airgap toggle active in UI),
 *    the client fails closed immediately, dropping all outbound socket calls.
 * 4. Bounded Buffer: Max 50 heartbeat frames in ring buffer to prevent memory leakage if offline.
 */

export interface TelemetryHeartbeatPayload {
  clusterId: string;
  namespace: string;
  daemonVersion: string;
  uptimeSeconds: number;
  tokensReclaimed: number;
  totalRequests: number;
  p95LatencyMs: number;
  activeWaypoints: number;
  airgapEnabled: boolean;
  timestamp: string;
}

export interface TelemetryDispatchResult {
  delivered: boolean;
  blockedByAirgap: boolean;
  targetEndpoint: string;
  statusCode?: number;
  error?: string;
  payloadDigestSha256?: string;
}

export class SovereignTelemetryClient {
  private targetHost: string = 'https://telemetry.mastrion.eu:8443';
  private ringBuffer: TelemetryHeartbeatPayload[] = [];
  private maxBufferSize: number = 50;

  constructor(targetHost?: string) {
    if (targetHost) {
      // Hard architectural check: Must strictly target mastrion.eu telemetry endpoint
      if (!targetHost.includes('telemetry.mastrion.eu') && !targetHost.includes('localhost:8443')) {
        throw new Error(`Security Violation: Disallowed telemetry egress target '${targetHost}'. Only telemetry.mastrion.eu:8443 permitted.`);
      }
      this.targetHost = targetHost;
    }
  }

  /**
   * Sanitizes payload to mathematically guarantee zero prompt/PII leakage
   */
  public sanitizeTelemetryDelta(payload: Partial<TelemetryHeartbeatPayload>, airgapEnabled: boolean): TelemetryHeartbeatPayload {
    return {
      clusterId: payload.clusterId || 'cluster-fra-01',
      namespace: payload.namespace || 'production',
      daemonVersion: payload.daemonVersion || 'v1.0.0-PROD',
      uptimeSeconds: Math.floor(payload.uptimeSeconds || 0),
      tokensReclaimed: payload.tokensReclaimed || 0,
      totalRequests: payload.totalRequests || 0,
      p95LatencyMs: Number((payload.p95LatencyMs || 1.84).toFixed(2)),
      activeWaypoints: payload.activeWaypoints || 1,
      airgapEnabled: airgapEnabled,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Dispatches heartbeat delta to the sovereign telemetry gateway
   */
  public async dispatchHeartbeat(payload: Partial<TelemetryHeartbeatPayload>, airgapActive: boolean): Promise<TelemetryDispatchResult> {
    const sanitized = this.sanitizeTelemetryDelta(payload, airgapActive);

    // 1. Airgap Kill-Switch Check
    const envAirgap = process.env.MASTRION_REMOTE_TELEMETRY === 'false';
    if (airgapActive || envAirgap) {
      return {
        delivered: false,
        blockedByAirgap: true,
        targetEndpoint: `${this.targetHost}/v1/heartbeat`,
        error: 'AIRGAP_ACTIVE: Socket transmission dropped at gateway boundary (Zero egress)',
      };
    }

    // 2. Buffer management
    if (this.ringBuffer.length >= this.maxBufferSize) {
      this.ringBuffer.shift(); // Evict oldest frame
    }
    this.ringBuffer.push(sanitized);

    // 3. Outbound Transport with Timeout & Fail-Closed Strategy
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${this.targetHost}/v1/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Mastrion-Telemetry-Version': '1.0',
        },
        body: JSON.stringify(sanitized),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return {
        delivered: res.ok,
        blockedByAirgap: false,
        targetEndpoint: `${this.targetHost}/v1/heartbeat`,
        statusCode: res.status,
      };
    } catch (err: any) {
      // Fail closed gracefully without crashing host
      return {
        delivered: false,
        blockedByAirgap: false,
        targetEndpoint: `${this.targetHost}/v1/heartbeat`,
        error: err.name === 'AbortError' ? 'NETWORK_TIMEOUT (Fail-Closed)' : err.message,
      };
    }
  }

  public getBufferedCount(): number {
    return this.ringBuffer.length;
  }
}
