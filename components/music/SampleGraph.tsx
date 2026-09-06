'use client';

import { useMemo } from 'react';
import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { SampleSource } from '@/lib/types/production';
import { SampleNode, type SampleNodeData } from '@/components/lineage/SampleNode';
import { InfluenceEdge } from '@/components/lineage/InfluenceEdge';

const nodeTypes = { sampleNode: SampleNode };
const edgeTypes = { influence: InfluenceEdge };

const COLUMN_WIDTH = 230;
const ROW_HEIGHT = 150;

/**
 * Samples can themselves sample, which is what makes this a graph rather than a
 * list. Depth is derived from `sampledFrom` so a flip-of-a-flip sits a row down.
 */
function depthOf(
  sample: SampleSource,
  byId: Map<string, SampleSource>,
  seen = new Set<string>(),
): number {
  if (seen.has(sample.id)) return 0; // cycle guard: bad data shouldn't hang the UI
  seen.add(sample.id);
  const parents = sample.sampledFrom ?? [];
  if (parents.length === 0) return 0;
  return (
    1 +
    Math.max(
      ...parents.map((id) => {
        const parent = byId.get(id);
        return parent ? depthOf(parent, byId, seen) : 0;
      }),
    )
  );
}

export function SampleGraph({
  samples,
  activeGenre,
}: {
  samples: SampleSource[];
  activeGenre: string | null;
}) {
  const { nodes, edges } = useMemo(() => {
    const byId = new Map(samples.map((s) => [s.id, s]));
    const rows = new Map<number, number>();

    const nodeList: Node[] = samples.map((sample) => {
      const depth = depthOf(sample, byId);
      const column = rows.get(depth) ?? 0;
      rows.set(depth, column + 1);

      const data: SampleNodeData = {
        sample,
        dimmed:
          activeGenre != null &&
          sample.genre.toLowerCase() !== activeGenre.toLowerCase(),
      };

      return {
        id: sample.id,
        type: 'sampleNode',
        position: { x: column * COLUMN_WIDTH, y: depth * ROW_HEIGHT },
        data: data as unknown as Record<string, unknown>,
      };
    });

    const edgeList: Edge[] = samples.flatMap((sample) =>
      (sample.sampledFrom ?? [])
        .filter((parentId) => byId.has(parentId))
        .map((parentId) => ({
          id: `${parentId}->${sample.id}`,
          source: parentId,
          target: sample.id,
          type: 'influence',
          data: { relation: 'sample' },
        })),
    );

    return { nodes: nodeList, edges: edgeList };
  }, [samples, activeGenre]);

  if (samples.length === 0) {
    return (
      <p className="font-sans text-xs text-zinc-600">
        No samples credited on this record.
      </p>
    );
  }

  return (
    <div className="h-64 rounded border border-zinc-800/50 bg-zinc-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
      >
        <Background color="#27272a" gap={16} />
        <Controls showInteractive={false} className="!bg-zinc-900 !text-zinc-400" />
      </ReactFlow>
    </div>
  );
}
