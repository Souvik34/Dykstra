export function dijkstra(graph, start, target) {
  const distances = {};
  const previous = {};
  const visited = new Set();
  const steps = [];

  // Initialize distances
  for (const node of Object.keys(graph)) {
    distances[node] = Infinity;
    previous[node] = null;
  }

  distances[start] = 0;

  // Helper to create a snapshot of current distances
  const getDistanceSnapshot = () => ({ ...distances });

  // Priority queue
  const priorityQueue = [{ node: start, distance: 0 }];

  while (priorityQueue.length > 0) {
    // Get node with smallest distance
    priorityQueue.sort((a, b) => a.distance - b.distance);

    const current = priorityQueue.shift();
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

      const newDistance = distances[currentNode] + weight;

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
  const path = [];

  if (distances[target] !== Infinity) {
    let current = target;

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