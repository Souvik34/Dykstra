function Legend() {
  return (
    <div className="legend">
      <div className="legend-title">
        LEGEND
      </div>

      <div className="legend-section">
        <div className="legend-item">
          <span className="legend-dot legend-blue" />
          <span>Unvisited node</span>
        </div>

        <div className="legend-item">
          <span className="legend-dot legend-yellow" />
          <span>Current node</span>
        </div>

        <div className="legend-item">
          <span className="legend-dot legend-green" />
          <span>Visited / Finalized</span>
        </div>

        <div className="legend-item">
          <span className="legend-dot legend-pink" />
          <span>Target node</span>
        </div>

        <div className="legend-item">
          <span className="legend-dot legend-purple" />
          <span>Shortest path</span>
        </div>
      </div>

      <div className="legend-divider" />

      <div className="legend-section edge-legend">
        <div className="legend-item">
          <span className="legend-line legend-line-normal" />
          <span>Normal edge</span>
        </div>

        <div className="legend-item">
          <span className="legend-line legend-line-active" />
          <span>Edge being checked</span>
        </div>

        <div className="legend-item">
          <span className="legend-line legend-line-path" />
          <span>Shortest path edge</span>
        </div>
      </div>

      <div className="legend-divider" />

      <div className="legend-distance">
        <div className="legend-distance-title">
          NODE VALUE
        </div>

        <div className="legend-distance-content">
          <span className="legend-value-box">
            X
          </span>

          <span>
            Current shortest distance
            <br />
            from start
          </span>
        </div>
      </div>
    </div>
  );
}

export default Legend;