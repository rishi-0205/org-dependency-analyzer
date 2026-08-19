import { useRef, useEffect, useState, useMemo, forwardRef, useImperativeHandle, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceCollide, forceManyBody, forceCenter, forceX, forceY } from 'd3-force';
import { GraphData, GraphNode } from '../../types';

// ==========================================
// STRICT WARM PALETTE BORDER CONSTANTS
// ==========================================
const COLOR_INK        = '#1C1912';  // Person / Headings
const COLOR_AMBER      = '#F4A62C';  // Skill / Medium Risk Module
const COLOR_ROSE       = '#E15B43';  // High Risk Module
const COLOR_GREEN      = '#7FA65A';  // Low Risk / Healthy Module
const COLOR_TAUPE      = '#B8A78D';  // Team
const COLOR_TERRACOTTA = '#D9724A';  // Project
const COLOR_MUTED      = '#A39A8B';  // Secondary text / Edge neutrals
const BG_CREAM         = '#FDF5E7';  // Container fill matching canvas bg

interface DependencyGraphProps {
  data: GraphData;
  height?: number;
  width?: number;
  selectedNodeId?: string | null;
  searchQuery?: string;
  showDirectionality?: boolean;
  onNodeClick?: (node: GraphNode) => void;
  onCanvasClick?: () => void;
}

export interface DependencyGraphHandle {
  centerAt: (x: number, y: number, duration?: number) => void;
  zoom: (k: number, duration?: number) => void;
  zoomToFit: (duration?: number) => void;
}

const DependencyGraph = forwardRef<DependencyGraphHandle, DependencyGraphProps>(
  (
    {
      data,
      selectedNodeId = null,
      searchQuery = '',
      showDirectionality = true,
      onNodeClick,
      onCanvasClick,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const fgRef = useRef<any>(undefined);
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const isDraggingRef = useRef(false);
    const [isSettled, setIsSettled] = useState(false);
    const hasInitialSettledRef = useRef(false);
    const isInitialFitDoneRef = useRef(false);
    const prevNodeIdsKeyRef = useRef<string>('');

    // Global persistent coordinates cache so hidden/reappearing nodes never lose position or jump to center
    const globalPosMapRef = useRef(new Map<string, { x: number; y: number; fx?: number; fy?: number }>());

    // Stable internal graph data that updates nodes while preserving positions
    const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });

    useEffect(() => {
      const currentKey = `${data.nodes.map((n) => n.id).sort().join(',')}|${data.links.length}`;
      if (currentKey !== prevNodeIdsKeyRef.current) {
        prevNodeIdsKeyRef.current = currentKey;

        setGraphData(() => {
          const nextNodes = data.nodes.map((n, idx) => {
            const cached = globalPosMapRef.current.get(n.id);
            if (cached && cached.x !== undefined && cached.y !== undefined) {
              return {
                ...n,
                x: cached.x,
                y: cached.y,
                fx: hasInitialSettledRef.current ? cached.x : cached.fx,
                fy: hasInitialSettledRef.current ? cached.y : cached.fy,
              };
            }

            // If node was never seen before, place it on perimeter circle so it never spawns in center
            const angle = (idx / Math.max(1, data.nodes.length)) * 2 * Math.PI;
            const spawnX = Math.cos(angle) * 340;
            const spawnY = Math.sin(angle) * 340;
            const pos = {
              x: spawnX,
              y: spawnY,
              fx: hasInitialSettledRef.current ? spawnX : undefined,
              fy: hasInitialSettledRef.current ? spawnY : undefined,
            };
            globalPosMapRef.current.set(n.id, pos);
            return { ...n, ...pos };
          });

          const nextLinks = data.links.map((l) => ({ ...l }));
          return { nodes: nextNodes, links: nextLinks };
        });
      }
    }, [data]);

    useImperativeHandle(ref, () => ({
      centerAt: (x: number, y: number, duration = 400) => {
        if (fgRef.current) fgRef.current.centerAt(x, y, duration);
      },
      zoom: (k: number, duration = 400) => {
        if (fgRef.current) fgRef.current.zoom(k, duration);
      },
      zoomToFit: (duration = 400) => {
        if (fgRef.current) fgRef.current.zoomToFit(duration, 100);
      },
    }));

    useEffect(() => {
      function updateDimensions() {
        if (containerRef.current) {
          setDimensions({
            width: containerRef.current.clientWidth || window.innerWidth,
            height: containerRef.current.clientHeight || window.innerHeight,
          });
        }
      }
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Neighbor Highlight Calculation
    const { neighborNodeIds, activeLinkIds } = useMemo(() => {
      const neighborSet = new Set<string>();
      const linkSet = new Set<string>();

      if (selectedNodeId) {
        neighborSet.add(selectedNodeId);

        graphData.links.forEach((l) => {
          const src = typeof l.source === 'object' ? l.source.id : l.source;
          const tgt = typeof l.target === 'object' ? l.target.id : l.target;

          if (src === selectedNodeId) {
            neighborSet.add(tgt);
            linkSet.add(`${src}->${tgt}`);
            linkSet.add(`${tgt}->${src}`);
          } else if (tgt === selectedNodeId) {
            neighborSet.add(src);
            linkSet.add(`${src}->${tgt}`);
            linkSet.add(`${tgt}->${src}`);
          }
        });
      }

      return { neighborNodeIds: neighborSet, activeLinkIds: linkSet };
    }, [selectedNodeId, graphData.links]);

    // Search query matches (Strictly Case-Insensitive across all node metadata)
    const matchingNodeIds = useMemo(() => {
      const clean = searchQuery.trim().toLowerCase();
      if (!clean) return new Set<string>();
      const matchSet = new Set<string>();

      graphData.nodes.forEach((n) => {
        const fieldsToSearch = [
          n.name,
          n.id,
          n.role,
          n.type,
          n.team,
          n.category,
          n.seniority,
          n.status,
          n.criticality,
          n.description,
        ];

        const isDirectMatch = fieldsToSearch.some(
          (val) => typeof val === 'string' && val.toLowerCase().includes(clean)
        );

        if (isDirectMatch) {
          matchSet.add(n.id);
        }
      });
      return matchSet;
    }, [searchQuery, graphData.nodes]);

    // Get border color strictly per node type and criticality
    const getNodeBorderColor = useCallback((node: GraphNode): string => {
      switch (node.type) {
        case 'person':
          return COLOR_INK;
        case 'skill':
          return COLOR_AMBER;
        case 'team':
          return COLOR_TAUPE;
        case 'project':
          return COLOR_TERRACOTTA;
        case 'module': {
          const crit = (node.criticality || 'low').toLowerCase();
          if (crit === 'high' || crit === 'critical') return COLOR_ROSE;
          if (crit === 'medium') return COLOR_AMBER;
          return COLOR_GREEN;
        }
        default:
          return COLOR_INK;
      }
    }, []);

    // Extract subtitle / metric per node type
    const getNodeSubtitle = (node: GraphNode): string => {
      switch (node.type) {
        case 'person':
          return node.role || node.seniority || 'Engineer';
        case 'module':
          return `${(node.criticality || 'medium').toUpperCase()} · ${node.downstream_count || 0} blast`;
        case 'skill':
          return node.category || `${node.people_with_skill?.length || 0} engineers`;
        case 'team':
          return `${node.member_count || 0} members · ${node.spof_count || 0} SPoF`;
        case 'project':
          return node.status || 'Active';
        default:
          return '';
      }
    };

    // Text Measurement & Container Dimensions in World Units
    const measureNodeContainer = (node: any, ctx: CanvasRenderingContext2D) => {
      ctx.font = 'bold 11px sans-serif';
      const titleWidth = ctx.measureText(node.name).width;

      const subText = getNodeSubtitle(node);
      ctx.font = '9px sans-serif';
      const subWidth = subText ? ctx.measureText(subText).width : 0;

      const contentWidth = Math.max(titleWidth, subWidth);
      const paddingX = 14;
      const paddingY = 8;

      const width = Math.max(70, contentWidth + paddingX * 2);
      const height = (subText ? 24 : 14) + paddingY * 2;

      node.__w = width;
      node.__h = height;
      node.__r = Math.sqrt(width * width + height * height) / 2 + 10;

      return { width, height, subText };
    };

    // Geometric Container Shapes per Node Type
    const drawContainerPath = (
      ctx: CanvasRenderingContext2D,
      type: string,
      x: number,
      y: number,
      halfW: number,
      halfH: number,
      offset: number = 0
    ) => {
      const hw = halfW + offset;
      const hh = halfH + offset;
      const w = hw * 2;
      const h = hh * 2;

      ctx.beginPath();
      switch (type) {
        case 'person':
          // Full Pill / Capsule Shape
          ctx.roundRect(x - hw, y - hh, w, h, hh);
          break;

        case 'module':
          // Rounded Rectangle (Crisp 6px radius)
          ctx.roundRect(x - hw, y - hh, w, h, 6);
          break;

        case 'skill': {
          // Chamfered / Diamond-Cut Container
          const b = Math.min(8 + offset, hh - 2);
          ctx.moveTo(x - hw + b, y - hh);
          ctx.lineTo(x + hw - b, y - hh);
          ctx.lineTo(x + hw, y - hh + b);
          ctx.lineTo(x + hw, y + hh - b);
          ctx.lineTo(x + hw - b, y + hh);
          ctx.lineTo(x - hw + b, y + hh);
          ctx.lineTo(x - hw, y + hh - b);
          ctx.lineTo(x - hw, y - hh + b);
          ctx.closePath();
          break;
        }

        case 'team': {
          // Hexagon Container
          const p = Math.min(12 + offset, hw / 3);
          ctx.moveTo(x - hw + p, y - hh);
          ctx.lineTo(x + hw - p, y - hh);
          ctx.lineTo(x + hw, y);
          ctx.lineTo(x + hw - p, y + hh);
          ctx.lineTo(x - hw + p, y + hh);
          ctx.lineTo(x - hw, y);
          ctx.closePath();
          break;
        }

        case 'project': {
          // Chevron Tag Container
          const n = Math.min(10 + offset, hw / 3);
          ctx.moveTo(x - hw, y - hh);
          ctx.lineTo(x + hw - n, y - hh);
          ctx.lineTo(x + hw, y);
          ctx.lineTo(x + hw - n, y + hh);
          ctx.lineTo(x - hw, y + hh);
          ctx.closePath();
          break;
        }

        default:
          ctx.roundRect(x - hw, y - hh, w, h, 6);
          break;
      }
    };

    // Custom Canvas Node Container Drawing
    const drawNode = (node: any, ctx: CanvasRenderingContext2D) => {
      const isSelected = selectedNodeId === node.id;
      const isNeighbor = neighborNodeIds.has(node.id);
      const isSearchMatch = matchingNodeIds.has(node.id);

      let opacity = 1.0;
      if (selectedNodeId && !isNeighbor) {
        opacity = 0.12;
      } else if (searchQuery.trim() && !isSearchMatch && !selectedNodeId) {
        opacity = 0.2;
      }

      ctx.save();
      ctx.globalAlpha = opacity;

      const x = node.x || 0;
      const y = node.y || 0;
      const borderColor = getNodeBorderColor(node);

      const { width, height, subText } = measureNodeContainer(node, ctx);
      const halfW = width / 2;
      const halfH = height / 2;

      // Highlight Glow Ring
      if (isSelected || isSearchMatch) {
        drawContainerPath(ctx, node.type, x, y, halfW, halfH, 4);
        ctx.fillStyle = isSelected ? 'rgba(244, 166, 44, 0.35)' : 'rgba(28, 25, 18, 0.18)';
        ctx.fill();
      }

      // Draw Shape Container
      drawContainerPath(ctx, node.type, x, y, halfW, halfH, 0);
      ctx.fillStyle = BG_CREAM;
      ctx.fill();
      ctx.lineWidth = isSelected ? 2.5 : 1.8;
      ctx.strokeStyle = borderColor;
      ctx.stroke();

      // Render Title (Bold Ink)
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = COLOR_INK;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(node.name, x, y - halfH + 7);

      // Render Subtitle / Metric (Muted text)
      if (subText) {
        ctx.font = '9px sans-serif';
        ctx.fillStyle = COLOR_MUTED;
        ctx.fillText(subText, x, y - halfH + 21);
      }

      ctx.restore();
    };

    // Hit-testing matching the exact geometric container shape
    const pointerAreaPaint = (node: any, color: string, ctx: CanvasRenderingContext2D) => {
      const x = node.x || 0;
      const y = node.y || 0;
      const w = node.__w || 80;
      const h = node.__h || 38;
      drawContainerPath(ctx, node.type, x, y, w / 2, h / 2, 0);
      ctx.fillStyle = color;
      ctx.fill();
    };

    // Configure Forces, Generous Spacing & Centering Containment
    useEffect(() => {
      if (!fgRef.current || hasInitialSettledRef.current) return;

      // Strong repulsion to create expansive breathing room, with distanceMax to prevent infinite drift
      fgRef.current.d3Force('charge', forceManyBody().strength(-1200).distanceMax(700));

      // Generous collision buffer between all container cards
      fgRef.current.d3Force(
        'collide',
        forceCollide((n: any) => (n.__r || 45) + 38).iterations(4)
      );

      // Centering and gravity forces to hold unlinked and peripheral nodes neatly in place
      fgRef.current.d3Force('center', forceCenter(0, 0));
      fgRef.current.d3Force('x', forceX(0).strength(0.065));
      fgRef.current.d3Force('y', forceY(0).strength(0.065));

      // Expansive link distances
      const linkForce = fgRef.current.d3Force('link');
      if (linkForce) {
        linkForce.distance((link: any) => {
          if (link.relationship === 'owns') return 175;
          if (link.relationship === 'depends_on') return 195;
          if (link.relationship === 'contributes_to') return 155;
          if (link.relationship === 'has_skill') return 145;
          return 135;
        });
      }
    }, [graphData]);

    // Handle Engine Stop (Settle and freeze node coordinates without pausing the canvas animation loop)
    const handleEngineStop = () => {
      hasInitialSettledRef.current = true;
      setIsSettled(true);

      graphData.nodes.forEach((node: any) => {
        node.fx = node.x;
        node.fy = node.y;
        globalPosMapRef.current.set(node.id, {
          x: node.x,
          y: node.y,
          fx: node.x,
          fy: node.y,
        });
      });

      if (!isInitialFitDoneRef.current && fgRef.current) {
        isInitialFitDoneRef.current = true;
        fgRef.current.zoomToFit(500, 100);
      }
    };

    // Handle Drag (Fluid motion of all other nodes and live edge realignment)
    const handleNodeDrag = (node: any) => {
      isDraggingRef.current = true;
      node.fx = node.x;
      node.fy = node.y;

      // Unpin all other nodes so they dynamically part out of the way and rearrange in real time
      graphData.nodes.forEach((other: any) => {
        if (other.id !== node.id) {
          other.fx = undefined;
          other.fy = undefined;
        }
      });

      if (fgRef.current) {
        fgRef.current.d3ReheatSimulation();
      }
    };

    // Handle Drag End (Pin dropped node, allow gentle relaxation of surrounding nodes, then freeze)
    const handleNodeDragEnd = (node: any) => {
      node.fx = node.x;
      node.fy = node.y;

      globalPosMapRef.current.set(node.id, {
        x: node.x,
        y: node.y,
        fx: node.x,
        fy: node.y,
      });

      if (fgRef.current) {
        fgRef.current.d3ReheatSimulation();
      }

      setTimeout(() => {
        isDraggingRef.current = false;
      }, 100);
    };

    // Edge Styling
    const getLinkColor = (link: any): string => {
      const rel = link.relationship;
      switch (rel) {
        case 'owns':
          return COLOR_INK;
        case 'depends_on':
          return COLOR_ROSE;
        case 'has_skill':
          return COLOR_AMBER;
        case 'contributes_to':
          return COLOR_GREEN;
        case 'member_of':
          return COLOR_TAUPE;
        case 'part_of':
        default:
          return COLOR_MUTED;
      }
    };

    // Custom Link Drawing with Container Boundary Clipping & Arrowhead Placement
    const drawLink = (link: any, ctx: CanvasRenderingContext2D) => {
      const source = link.source;
      const target = link.target;
      if (!source || !target || source.x === undefined || target.x === undefined) return;

      const srcId = typeof source === 'object' ? source.id : source;
      const tgtId = typeof target === 'object' ? target.id : target;
      const isActive = activeLinkIds.has(`${srcId}->${tgtId}`);

      let opacity = 1.0;
      if (selectedNodeId) {
        if (!isActive) {
          opacity = 0.12;
        }
      } else if (searchQuery.trim()) {
        const isSearchRelated = matchingNodeIds.has(srcId) || matchingNodeIds.has(tgtId);
        if (!isSearchRelated) {
          opacity = 0.1;
        }
      }

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) return;

      const theta = Math.atan2(dy, dx);
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);
      const absCos = Math.abs(cos) || 0.0001;
      const absSin = Math.abs(sin) || 0.0001;

      // Calculate distance from center to border for source and target
      const sHW = source.__w ? source.__w / 2 : 40;
      const sHH = source.__h ? source.__h / 2 : 19;
      const tHW = target.__w ? target.__w / 2 : 40;
      const tHH = target.__h ? target.__h / 2 : 19;

      const sRadius = Math.min(sHW / absCos, sHH / absSin);
      const tRadius = Math.min(tHW / absCos, tHH / absSin);

      // If nodes are too close, don't draw overlapping line
      if (dist <= sRadius + tRadius) return;

      const startX = source.x + sRadius * cos;
      const startY = source.y + sRadius * sin;
      const endX = target.x - tRadius * cos;
      const endY = target.y - tRadius * sin;

      const linkColor = getLinkColor(link);

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = linkColor;
      ctx.fillStyle = linkColor;

      // Set line width
      let lineWidth = 1.2;
      if (link.relationship === 'depends_on') lineWidth = 2.2;
      else if (link.relationship === 'contributes_to') {
        lineWidth = Math.max(1.2, Math.min(4.5, (link.commits || 10) / 12));
      } else if (link.relationship === 'owns') lineWidth = 1.6;
      ctx.lineWidth = lineWidth;

      // Line dash styles
      if (link.relationship === 'has_skill' || link.relationship === 'member_of') {
        ctx.setLineDash([4, 3]);
      } else if (link.relationship === 'part_of') {
        ctx.setLineDash([2, 2]);
      } else {
        ctx.setLineDash([]);
      }

      // Draw clipped edge line from source perimeter to target perimeter
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Draw directional arrowhead right at the target border if enabled
      if (showDirectionality) {
        ctx.setLineDash([]);
        const arrowLength = 7;
        const arrowWidth = 4.5;

        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowLength * cos + arrowWidth * sin,
          endY - arrowLength * sin - arrowWidth * cos
        );
        ctx.lineTo(
          endX - arrowLength * cos - arrowWidth * sin,
          endY - arrowLength * sin + arrowWidth * cos
        );
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    };

    return (
      <div
        ref={containerRef}
        className={`w-full h-full bg-[#FDF5E7] flex items-center justify-center ${
          isSettled ? 'cursor-grab active:cursor-grabbing' : 'cursor-default pointer-events-none'
        }`}
      >
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeCanvasObject={drawNode}
          nodePointerAreaPaint={pointerAreaPaint}
          linkCanvasObjectMode={() => 'replace'}
          linkCanvasObject={drawLink}
          onNodeClick={(node: any) => {
            if (!isSettled || isDraggingRef.current) return;
            if (onNodeClick) onNodeClick(node as GraphNode);
          }}
          onBackgroundClick={() => {
            if (!isSettled || isDraggingRef.current) return;
            if (onCanvasClick) onCanvasClick();
          }}
          onNodeDrag={handleNodeDrag}
          onNodeDragEnd={handleNodeDragEnd}
          onEngineStop={handleEngineStop}
          backgroundColor={BG_CREAM}
          cooldownTicks={120}
          d3AlphaDecay={0.028}
          d3VelocityDecay={0.35}
          warmupTicks={30}
          enableZoomInteraction={isSettled}
          enablePanInteraction={isSettled}
          enableNodeDrag={isSettled}
          enablePointerInteraction={isSettled}
        />
      </div>
    );
  }
);

DependencyGraph.displayName = 'DependencyGraph';

export default DependencyGraph;
