import { useState } from "react";
import { Plus, Trash2, Play } from "lucide-react";

const createEdge = () => ({
  id: crypto.randomUUID(),
  from: "",
  to: "",
  weight: "",
});

function GraphInput({ onVisualize }) {
  const [edges, setEdges] = useState([
    { id: "1", from: "A", to: "B", weight: "4" },
    { id: "2", from: "A", to: "C", weight: "2" },
    { id: "3", from: "B", to: "D", weight: "3" },
    { id: "4", from: "C", to: "D", weight: "1" },
    { id: "5", from: "D", to: "F", weight: "2" },
  ]);

  const [start, setStart] = useState("A");
  const [target, setTarget] = useState("F");
  const [error, setError] = useState("");

  const updateEdge = (id, field, value) => {
    setEdges((current) =>
      current.map((edge) =>
        edge.id === id
          ? { ...edge, [field]: value }
          : edge
      )
    );
  };

  const addEdge = () => {
    setEdges((current) => [...current, createEdge()]);
  };

  const removeEdge = (id) => {
    setEdges((current) =>
      current.filter((edge) => edge.id !== id)
    );
  };

  const handleVisualize = () => {
    try {
      const graph = {};

      if (!start.trim() || !target.trim()) {
        throw new Error("Please enter a start and target node.");
      }

      for (const edge of edges) {
        const from = edge.from.trim();
        const to = edge.to.trim();
        const weight = Number(edge.weight);

        if (!from || !to || edge.weight === "") {
          throw new Error(
            "Every edge needs a source, destination and cost."
          );
        }

        if (!Number.isFinite(weight) || weight < 0) {
          throw new Error(
            "Edge cost must be a non-negative number."
          );
        }

        if (from === to) {
          throw new Error(
            `A node cannot connect to itself: ${from}`
          );
        }

        if (!graph[from]) graph[from] = [];
        if (!graph[to]) graph[to] = [];

        graph[from].push({
          node: to,
          weight,
        });

        graph[to].push({
          node: from,
          weight,
        });
      }

      if (!graph[start.trim()]) {
        throw new Error(
          `Start node "${start}" does not exist in the graph.`
        );
      }

      if (!graph[target.trim()]) {
        throw new Error(
          `Target node "${target}" does not exist in the graph.`
        );
      }

      setError("");

      onVisualize(
        graph,
        start.trim(),
        target.trim()
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="input-card">
      <div className="input-heading">
        <div>
          <div className="eyebrow">GRAPH SETUP</div>

          <h1>Build your graph</h1>

          <p>
            Add connections between nodes and give each
            connection a cost.
          </p>
        </div>

        <div className="input-icon">
          DIJKSTRA
        </div>
      </div>

      <div className="edge-header">
        <span>Source</span>
        <span>Destination</span>
        <span>Cost</span>
        <span></span>
      </div>

      <div className="edge-list">
        {edges.map((edge, index) => (
          <div className="edge-row" key={edge.id}>
            <div className="edge-number">
              {index + 1}
            </div>

            <input
              value={edge.from}
              onChange={(e) =>
                updateEdge(
                  edge.id,
                  "from",
                  e.target.value.toUpperCase()
                )
              }
              placeholder="A"
              maxLength={3}
            />

            <div className="arrow-separator">
              →
            </div>

            <input
              value={edge.to}
              onChange={(e) =>
                updateEdge(
                  edge.id,
                  "to",
                  e.target.value.toUpperCase()
                )
              }
              placeholder="B"
              maxLength={3}
            />

            <input
              className="weight-input"
              type="number"
              min="0"
              value={edge.weight}
              onChange={(e) =>
                updateEdge(
                  edge.id,
                  "weight",
                  e.target.value
                )
              }
              placeholder="4"
            />

            <button
              className="icon-button delete-button"
              onClick={() => removeEdge(edge.id)}
              disabled={edges.length === 1}
              title="Remove edge"
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>

      <button
        className="add-edge-button"
        onClick={addEdge}
      >
        <Plus size={18} />
        Add connection
      </button>

      <div className="input-divider" />

      <div className="route-settings">
        <div className="route-field">
          <label>START NODE</label>

          <input
            value={start}
            onChange={(e) =>
              setStart(e.target.value.toUpperCase())
            }
            placeholder="A"
            maxLength={3}
          />
        </div>

        <div className="route-arrow">→</div>

        <div className="route-field">
          <label>TARGET NODE</label>

          <input
            value={target}
            onChange={(e) =>
              setTarget(e.target.value.toUpperCase())
            }
            placeholder="F"
            maxLength={3}
          />
        </div>

        <button
          className="visualize-button"
          onClick={handleVisualize}
        >
          <Play size={18} fill="currentColor" />
          Visualize
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}

export default GraphInput;