import React, { memo } from 'react';
import { getBezierPath, EdgeProps, EdgeLabelRenderer } from 'reactflow';
import { Tag } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CustomEdge = memo(({
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
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const showLabel = !data?.isFirstEdge;

  return (
    <>
      <path
        id={id}
        style={style}
        className={cn(
          "react-flow__edge-path",
          selected ? "stroke-primary stroke-[2px]" : "stroke-border-secondary stroke-[2px]"
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
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer shadow-md",
              selected 
                ? "bg-primary text-white border-primary" 
                : "bg-white border-border-tertiary text-fg-tertiary hover:border-primary/50"
            )}
          >
            <Tag className="w-3 h-3" />
            <span className="label font-bold whitespace-nowrap text-[11px]">
              {data?.name || data?.condition || 'Condición'}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
