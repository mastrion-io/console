# Mastrion Enterprise Console (`mastrion-io/console`)

Operational control plane and observability cockpit for the **Mastrion Sovereign AI Runtime Fabric**.

## Architecture & Capabilities

1. **Mission Control Header**: Cluster switching (`cluster-fra-01`, `cluster-ber-02`), namespace filtering, and zero-trust airgap toggle (`MASTRION_REMOTE_TELEMETRY=false`).
2. **Sub-2.4ms PII Socket Redaction**: Live latency tracking (`p50 < 1.8ms`, `p99 < 2.4ms`) and immutable HMAC-SHA256 audit ledger matching EU AI Act Article 12 and BaFin GWG standards.
3. **Radix-Tree Prefix Cache FinOps**: Visual breakdown of deduplicated system prompts, AST schemas, and GPU VRAM defragmentation metrics.
4. **Dedicated Telemetry Egress Tunnel**: Outbound-only TLS pinned heartbeat to `telemetry.mastrion.eu:8443` with zero inbound ports and customer airgap kill-switch.

## Getting Started

### Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the Mission Control console.

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
Multi-arch standalone image (<100MB):
```bash
docker build -t mastrion-console:latest .
docker run -p 3000:3000 mastrion-console:latest
```
Or via `docker-compose`:
```bash
docker-compose up -d
```
