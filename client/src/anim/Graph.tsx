import { motion } from "framer-motion";

function Graph({ graph, step, start, target }) {
  if (!graph) return null;

  const nodes = Object.keys(graph);

  const width = 820;
  const height = 520;

  const centerX = width / 2;
  const centerY = height / 2;

  const radius =
    nodes.length <= 2
      ? 150
      : Math.min(200, 100 + nodes.length * 18);

  const positions = {};

  nodes.forEach((node, index) => {
    const angle =
      (index / nodes.length) * Math.PI * 2 - Math.PI / 2;

    positions[node] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  /*
   * Convert the undirected graph into unique visual edges.
   */
  const edges = [];
  const seen = new Set();

  nodes.forEach((from) => {
    (graph[from] || []).forEach((edge) => {
      const key = [from, edge.node].sort().join("|");

      if (!seen.has(key)) {
        seen.add(key);

        edges.push({
          from,
          to: edge.node,
          weight: edge.weight,
        });
      }
    });
  });

  const visited = new Set(step?.visited || []);

  const isFinalPath = step?.type === "path";

  const currentNode =
    step?.type === "visit" ? step.node : null;

  const activeFrom =
    step?.type === "explore" || step?.type === "relax"
      ? step.from
      : null;

  const activeTo =
    step?.type === "explore" || step?.type === "relax"
      ? step.to
      : null;

  const path = isFinalPath ? step.path || [] : [];

  const isPathNode = (node) => path.includes(node);

  const isPathEdge = (from, to) => {
    for (let i = 0; i < path.length - 1; i++) {
      if (
        (path[i] === from && path[i + 1] === to) ||
        (path[i] === to && path[i + 1] === from)
      ) {
        return true;
      }
    }

    return false;
  };

  /*
   * IMPORTANT:
   * On the final path screen we don't want previously visited
   * nodes like B to remain green.
   *
   * Final state:
   *   shortest-path node -> purple
   *   target -> pink
   *   everything else -> blue
   *
   * During the algorithm:
   *   current -> yellow
   *   visited -> green
   *   target -> pink
   *   unvisited -> blue
   */
  const getNodeState = (node) => {
    if (isFinalPath) {
      if (node === target) return "target";
      if (isPathNode(node)) return "path";
      return "default";
    }

    if (node === currentNode) {
      return "current";
    }

    if (node === target) {
      return "target";
    }

    if (visited.has(node)) {
      return "visited";
    }

    return "default";
  };

  return (
    <svg
      className="graph"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Normal edge arrow */}
        <marker
          id="arrow-default"
          markerWidth="9"
          markerHeight="9"
          refX="8"
          refY="4.5"
          orient="auto"
        >
          <path
            d="M0,0 L9,4.5 L0,9"
            className="arrow-default"
          />
        </marker>

        {/* Active edge arrow */}
        <marker
          id="arrow-active"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="5"
          orient="auto"
        >
          <path
            d="M0,0 L10,5 L0,10"
            className="arrow-active"
          />
        </marker>

        {/* Final shortest path arrow */}
        <marker
          id="arrow-path"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="5"
          orient="auto"
        >
          <path
            d="M0,0 L10,5 L0,10"
            className="arrow-path"
          />
        </marker>
      </defs>

      {/* ================= EDGES ================= */}

      {edges.map((edge) => {
        const from = positions[edge.from];
        const to = positions[edge.to];

        if (!from || !to) return null;

        const active =
          (edge.from === activeFrom &&
            edge.to === activeTo) ||
          (edge.from === activeTo &&
            edge.to === activeFrom);

        const pathEdge = isPathEdge(
          edge.from,
          edge.to
        );

        const dx = to.x - from.x;
        const dy = to.y - from.y;

        const distance = Math.sqrt(
          dx * dx + dy * dy
        );

        const nodeOffset = 36;

        const startX =
          from.x + (dx / distance) * nodeOffset;

        const startY =
          from.y + (dy / distance) * nodeOffset;

        const endX =
          to.x - (dx / distance) * nodeOffset;

        const endY =
          to.y - (dy / distance) * nodeOffset;

        let edgeClass = "graph-edge";

        if (pathEdge) {
          edgeClass += " path-edge";
        } else if (active) {
          edgeClass += " active-edge";
        }

        return (
          <g key={`${edge.from}-${edge.to}`}>
            {/* Glow behind active/path edge */}
            {(active || pathEdge) && (
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                className={
                  pathEdge
                    ? "edge-glow edge-glow-path"
                    : "edge-glow edge-glow-active"
                }
              />
            )}

            <motion.line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              className={edgeClass}
              markerEnd={
                pathEdge
                  ? "url(#arrow-path)"
                  : active
                  ? "url(#arrow-active)"
                  : "url(#arrow-default)"
              }
              animate={{
                opacity:
                  active || pathEdge ? 1 : 0.65,
              }}
              transition={{
                duration: 0.25,
              }}
            />

            {/* Weight */}
            <motion.g
              animate={{
                scale: active || pathEdge ? 1.15 : 1,
              }}
              transition={{
                duration: 0.2,
              }}
              style={{
                transformOrigin: `${
                  (from.x + to.x) / 2
                }px ${
                  (from.y + to.y) / 2
                }px`,
              }}
            >
              <rect
                x={(from.x + to.x) / 2 - 18}
                y={(from.y + to.y) / 2 - 14}
                width="36"
                height="28"
                rx="8"
                className={
                  pathEdge
                    ? "cost-box cost-path"
                    : active
                    ? "cost-box cost-active"
                    : "cost-box"
                }
              />

              <text
                x={(from.x + to.x) / 2}
                y={(from.y + to.y) / 2 + 5}
                textAnchor="middle"
                className="cost-text"
              >
                {edge.weight}
              </text>
            </motion.g>
          </g>
        );
      })}

      {/* ================= NODES ================= */}

      {nodes.map((node) => {
        const position = positions[node];

        const state = getNodeState(node);

        const isStart = node === start;
        const isTarget = node === target;

        const isCurrent =
          !isFinalPath && node === currentNode;

        const distance =
          step?.distances?.[node];

        return (
          <motion.g
            key={node}
            animate={{
              scale:
                isCurrent ||
                state === "path" ||
                isTarget
                  ? 1.08
                  : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 22,
            }}
            style={{
              transformOrigin: `${position.x}px ${position.y}px`,
            }}
          >
            {/* Current-node pulse */}
            {isCurrent && (
              <motion.rect
                x={position.x - 42}
                y={position.y - 42}
                width="84"
                height="84"
                rx="16"
                className="node-pulse"
                initial={{
                  opacity: 0.1,
                }}
                animate={{
                  opacity: [0.1, 0.4, 0.1],
                }}
                transition={{
                  duration: 1.3,
                  repeat: Infinity,
                }}
              />
            )}

            {/* Final path glow */}
            {state === "path" && (
              <rect
                x={position.x - 39}
                y={position.y - 39}
                width="78"
                height="78"
                rx="15"
                className="node-path-glow"
              />
            )}

            {/* Node */}
            <rect
              x={position.x - 32}
              y={position.y - 32}
              width="64"
              height="64"
              rx="12"
              className={`node node-${state}`}
            />

            {/* Node label */}
            <text
              x={position.x}
              y={position.y + 7}
              textAnchor="middle"
              className="node-label"
            >
              {node}
            </text>

            {/* Distance */}
            {step?.distances && (
              <g>
                <rect
                  x={position.x - 25}
                  y={position.y + 43}
                  width="50"
                  height="24"
                  rx="7"
                  className={`distance-box distance-${state}`}
                />

                <text
                  x={position.x}
                  y={position.y + 60}
                  textAnchor="middle"
                  className="distance-text"
                >
                  {distance === Infinity
                    ? "∞"
                    : distance}
                </text>
              </g>
            )}

            {/* START */}
            {isStart && (
              <text
                x={position.x}
                y={position.y - 45}
                textAnchor="middle"
                className="start-label"
              >
                START
              </text>
            )}

            {/* TARGET */}
            {isTarget && (
              <text
                x={position.x}
                y={position.y + 91}
                textAnchor="middle"
                className="target-label"
              >
                TARGET
              </text>
            )}

            {/* CURRENT */}
            {isCurrent && (
              <text
                x={position.x}
                y={position.y + 92}
                textAnchor="middle"
                className="current-label"
              >
                CURRENT
              </text>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}

export default Graph;