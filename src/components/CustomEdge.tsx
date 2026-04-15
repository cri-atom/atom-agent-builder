import React, { memo, useState } from 'react';
import { getBezierPath, EdgeProps, EdgeLabelRenderer } from 'reactflow';
import { GitBranch } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CustomEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
    selected,
  }: EdgeProps) => {
    const [labelHovered, setLabelHovered] = useState(false);
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    const showLabel = !data?.isFirstEdge;
    const title =
      data?.name && String(data.name).trim() ? String(data.name).trim() : 'Condición';
    const emphasized = selected || labelHovered;

    return (
      <>
        <path
          id={id}
          style={style}
          className={cn(
            'react-flow__edge-path',
            selected ? 'stroke-primary stroke-[2px]' : 'stroke-border-secondary stroke-[2px]'
          )}
          d={edgePath}
          markerEnd={markerEnd}
        />
        {showLabel && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all',
              }}
              onMouseEnter={() => setLabelHovered(true)}
              onMouseLeave={() => setLabelHovered(false)}
              className={cn(
                'flow-canvas-node__surface flow-canvas-edge-card flex flex-col',
                emphasized && 'flow-canvas-node__surface--emphasized'
              )}
            >
              <div className="flow-canvas-edge-card__header">
                <GitBranch className="h-4 w-4 shrink-0 text-fg-secondary" aria-hidden />
                <p className="flow-canvas-edge-card__label caption min-w-0 flex-1 font-medium text-fg-primary">
                  {title}
                </p>
              </div>
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  }
);
