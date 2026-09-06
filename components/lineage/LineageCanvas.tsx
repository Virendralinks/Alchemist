'use client';

import { useMemo, useState } from 'react';
import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { LineageArtist } from '@/lib/types/lineage';
import {
  ERA_ORDER,
  lineageArtistById,
  lineageArtists,
  lineageEdges,
} from '@/lib/mock/lineage-graph';
import { ArtistNode } from './ArtistNode';
import { InfluenceEdge } from './InfluenceEdge';
import { TechniqueDrawer } from './TechniqueDrawer';

const nodeTypes = { artistNode: ArtistNode };
const edgeTypes = { influence: InfluenceEdge };

const COLUMN_WIDTH = 210;
const ROW_HEIGHT = 190;

export function LineageCanvas() {
  const [selected, setSelected] = useState<LineageArtist | null>(null);

  // Era determines the row, so the graph reads chronologically top to bottom.
  const nodes = useMemo<Node[]>(() => {
    const perEra = new Map<string, number>();
    return lineageArtists.map((artist) => {
      const row = ERA_ORDER.indexOf(artist.era);
      const column = perEra.get(artist.era) ?? 0;
      perEra.set(artist.era, column + 1);
      return {
        id: artist.id,
        type: 'artistNode',
        position: { x: column * COLUMN_WIDTH, y: row * ROW_HEIGHT },
        data: artist as unknown as Record<string, unknown>,
      };
    });
  }, []);

  const edges = useMemo<Edge[]>(
    () =>
      lineageEdges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'influence',
        data: { relation: edge.relation },
      })),
    [],
  );

  const onNodeClick: NodeMouseHandler = (_event, node) => {
    setSelected(lineageArtistById.get(node.id) ?? null);
  };

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesConnectable={false}
      >
        <Background color="#27272a" gap={20} />
        <Controls showInteractive={false} className="!bg-zinc-900 !text-zinc-400" />
      </ReactFlow>

      <div className="pointer-events-none absolute right-3 top-3 rounded border border-zinc-800 bg-zinc-950/90 px-2 py-1.5">
        <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">
          Relation
        </p>
        <div className="mt-1 flex flex-col gap-0.5 font-mono text-[10px] text-zinc-500">
          <span>— direct influence</span>
          <span className="text-sky-400">-- sample lineage</span>
          <span className="text-violet-400">·· regional</span>
        </div>
      </div>

      <TechniqueDrawer artist={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
