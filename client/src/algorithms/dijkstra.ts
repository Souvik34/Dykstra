export type DijkstraEdge = {
  node: string;
  weight: number;
};

export type DijkstraGraph = Record<string, DijkstraEdge[]>;

type PriorityQueueItem = {
  node: string;
  distance: number;
};

export type DijkstraStep =
  | {
      type: "visit";
      node: string;
      distances: Record<string, number>;
      visited: string[];
    }
  | {
      type: "explore";
      from: string;
      to: string;
      weight: number;
      distances: Record<string, number>;
      visited: string[];
    }
  | {
      type: "relax";
      from: string;
      to: string;
      weight: number;
      distance: number;
      distances: Record<string, number>;
      previous: Record<string, string | null>;
      visited: string[];
    }
  | {
      type: "path";
      path: string[];
      distance: number;
      distances: Record<string, number>;
      visited: string[];
    };

export type DijkstraResult = {
  steps: DijkstraStep[];
  distances: Record<string, number>;
  previous: Record<string, string | null>;
  path: string[];
};

export function dijkstra(
  graph: DijkstraGraph,
  start: string,
  target: string,
): DijkstraResult {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();
  const steps: DijkstraStep[] = [];

  // Initialize distances
  for (const node of Object.keys(graph)) {
    distances[node] = Infinity;
    previous[node] = null;
  }

  distances[start] = 0;

  // Helper to create a snapshot of current distances
  const getDistanceSnapshot = () => ({
    ...distances,
  });

  // Priority queue
  const priorityQueue: PriorityQueueItem[] = [
    {
      node: start,
      distance: 0,
    },
  ];

  while (priorityQueue.length > 0) {
    // Get node with smallest distance
    priorityQueue.sort(
      (a, b) => a.distance - b.distance,
    );

    const current = priorityQueue.shift();

    // TypeScript knows shift() can return undefined
    if (!current) {
      break;
    }

    const currentNode = current.node;

    // Skip if already visited
    if (visited.has(currentNode)) {
      continue;
    }

    visited.add(currentNode);

    // Record visiting step
    steps.push({
      type: "visit",
      node: currentNode,
      distances: getDistanceSnapshot(),
      visited: [...visited],
    });

    // Stop once target is reached
    if (currentNode === target) {
      break;
    }

    // Explore neighbors
    for (const edge of graph[currentNode] || []) {
      const neighbor = edge.node;
      const weight = edge.weight;

      // Record edge being examined
      steps.push({
        type: "explore",
        from: currentNode,
        to: neighbor,
        weight,
        distances: getDistanceSnapshot(),
        visited: [...visited],
      });

      if (visited.has(neighbor)) {
        continue;
      }

      const newDistance =
        distances[currentNode] + weight;

      // Relax edge
      if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance;
        previous[neighbor] = currentNode;

        priorityQueue.push({
          node: neighbor,
          distance: newDistance,
        });

        steps.push({
          type: "relax",
          from: currentNode,
          to: neighbor,
          weight,
          distance: newDistance,
          distances: getDistanceSnapshot(),
          previous: { ...previous },
          visited: [...visited],
        });
      }
    }
  }

  // Build shortest path
  const path: string[] = [];

  if (distances[target] !== Infinity) {
    let current: string | null = target;

    while (current !== null) {
      path.unshift(current);
      current = previous[current];
    }
  }

  // Record final path
  if (path.length > 0) {
    steps.push({
      type: "path",
      path,
      distance: distances[target],
      distances: getDistanceSnapshot(),
      visited: [...visited],
    });
  }

  return {
    steps,
    distances,
    previous,
    path,
  };
}