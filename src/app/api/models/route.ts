import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_ADMIN_STATE } from '@/lib/models/initial-state';
import { LocalModelSpec } from '@/lib/models/types';

// In-memory store for model management simulation & daemon sync
let currentModels: LocalModelSpec[] = [...INITIAL_ADMIN_STATE.localModels];

export async function GET() {
  // Attempt to probe local Ollama instance on host
  try {
    const res = await fetch('http://127.0.0.1:11434/api/tags', {
      signal: AbortSignal.timeout(1000),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.models)) {
        const liveOllamaNames = new Set(data.models.map((m: any) => m.name));
        currentModels = currentModels.map((m) => ({
          ...m,
          status: liveOllamaNames.has(m.id) ? 'installed' : m.status,
        }));
      }
    }
  } catch {
    // Fall back to stored state if Ollama is unreachable
  }

  return NextResponse.json({
    models: currentModels,
    defaultModel: INITIAL_ADMIN_STATE.defaultLocalModel,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, modelId } = body;

    if (!modelId) {
      return NextResponse.json({ error: 'Missing modelId' }, { status: 400 });
    }

    if (action === 'install' || action === 'pull') {
      const idx = currentModels.findIndex((m) => m.id === modelId);
      if (idx !== -1) {
        currentModels[idx] = {
          ...currentModels[idx],
          status: 'installed',
        };
      } else {
        currentModels.push({
          id: modelId,
          name: modelId,
          family: 'custom',
          parameterSize: 'Custom',
          quantization: 'GGUF',
          contextLength: 32768,
          sizeBytes: 4000000000,
          status: 'installed',
          sovereign: true,
        });
      }
      return NextResponse.json({ success: true, model: currentModels.find((m) => m.id === modelId) });
    }

    if (action === 'delete') {
      const idx = currentModels.findIndex((m) => m.id === modelId);
      if (idx !== -1) {
        currentModels[idx] = {
          ...currentModels[idx],
          status: 'available',
        };
      }
      return NextResponse.json({ success: true, message: `Model ${modelId} offloaded` });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
