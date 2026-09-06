'use client';

import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';

const RELATION_STYLE: Record<string, { stroke: string; dash?: string; width: number }> = {
  // Direct influence is the strong claim, so it gets the solid heavy line.
  direct: { stroke: '#71717a', width: 1.6 },
  sample: { stroke: '#38bdf8', dash: '6 3', width: 1.3 },
  regional: { stroke: '#a78bfa', dash: '2 3', width: 1.1 },
};

export function InfluenceEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const relation = (data as { relation?: string } | undefined)?.relation ?? 'direct';
  const style = RELATION_STYLE[relation] ?? RELATION_STYLE.direct;

  return (
    <BaseEdge
      id={id}
      path={path}
      markerEnd={markerEnd}
      style={{
        stroke: style.stroke,
        strokeWidth: style.width,
        strokeDasharray: style.dash,
      }}
    />
  );
}
