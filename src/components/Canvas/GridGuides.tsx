import React from 'react';
import type { GuideLine } from '../../utils/snapGuides';

interface GridGuidesProps {
  guides: GuideLine[];
  canvasWidth: number;
  canvasHeight: number;
}

export const GridGuides: React.FC<GridGuidesProps> = ({ guides, canvasWidth, canvasHeight }) => {
  if (guides.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[8888]">
      {guides.map((guide, idx) => {
        if (guide.type === 'v') {
          return (
            <div
              key={`v-guide-${idx}`}
              className="absolute border-l border-dashed border-rose-500"
              style={{
                left: `${guide.pos}px`,
                top: 0,
                bottom: 0,
                width: '1px',
                height: `${canvasHeight}px`,
              }}
            />
          );
        } else {
          return (
            <div
              key={`h-guide-${idx}`}
              className="absolute border-t border-dashed border-rose-500"
              style={{
                top: `${guide.pos}px`,
                left: 0,
                right: 0,
                height: '1px',
                width: `${canvasWidth}px`,
              }}
            />
          );
        }
      })}
    </div>
  );
};
