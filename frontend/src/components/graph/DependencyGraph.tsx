import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';
import { GraphData } from '../../types';

interface DependencyGraphProps {
  data: GraphData;
  height?: number;
  onNodeClick?: (node: any) => void;
}

export default function DependencyGraph({
  data,
  height = 500,
  onNodeClick,
}: DependencyGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height });
  const navigate = useNavigate();

  useEffect(() => {
    function updateDimensions() {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: height || containerRef.current.clientHeight || 500,
        });
      }
    }

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height]);

  const handleNodeClick = (node: any) => {
    if (onNodeClick) {
      onNodeClick(node);
    } else if (node.id) {
      navigate(`/modules/${node.id}`);
    }
  };

  const getNodeColor = (node: any) => {
    const crit = (node.criticality || 'low').toLowerCase();
    if (crit === 'high' || crit === 'critical') return '#F43F5E'; // Rose
    if (crit === 'medium') return '#F59E0B'; // Amber
    return '#10B981'; // Emerald
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden bg-[#0A0E17] border border-slate-800 shadow-inner flex items-center justify-center"
      style={{ height }}
    >
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={{
          nodes: data.nodes.map((n) => ({ ...n })),
          links: data.links.map((l) => ({ ...l })),
        }}
        nodeLabel={(node: any) => `
          <div style="background:#151D2C; padding:8px 12px; border-radius:8px; border:1px solid #334155; font-family:sans-serif; color:#F8FAFC; box-shadow:0 10px 15px -3px rgba(0,0,0,0.5);">
            <div style="font-weight:bold; font-size:13px; color:#A5B4FC;">${node.name}</div>
            <div style="font-size:11px; color:#94A3B8; margin-top:2px;">Criticality: <span style="text-transform:uppercase; font-weight:bold;">${node.criticality || 'low'}</span></div>
            ${node.owner ? `<div style="font-size:11px; color:#CBD5E1; margin-top:2px;">Owner: ${node.owner}</div>` : ''}
          </div>
        `}
        nodeColor={getNodeColor}
        nodeRelSize={6}
        linkColor={() => 'rgba(99, 102, 241, 0.35)'}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.15}
        onNodeClick={handleNodeClick}
        backgroundColor="#0A0E17"
        cooldownTicks={100}
      />

      {/* Graph Legend Overlay */}
      <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 flex items-center gap-4 z-10 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30" />
          <span>High Criticality</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/30" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
          <span>Low</span>
        </div>
      </div>
    </div>
  );
}
