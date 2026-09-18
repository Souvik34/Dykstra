import { useState } from "react";

function TwoPointersSameDirectionInput({
  onVisualize,
}) {
  const [array, setArray] = useState(
    "0, 1, 0, 3, 12"
  );

  const [error, setError] = useState("");

  const handleVisualize = () => {
    setError("");

    const values = array
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .map(Number);

    if (
      values.length < 2 ||
      values.some(
        (value) => !Number.isFinite(value)
      )
    ) {
      setError(
        "Enter a valid array with at least two numbers."
      );

      return;
    }

    onVisualize({
      pattern: "same-direction",
      example: "Move Zeroes",
      array: values,
    });
  };

  return (
    <section className="two-pointer-input">
      <div className="two-pointer-input-header">
        <div>
          <div className="two-pointer-breadcrumb">
            Two Pointers
          </div>

          <h1>Same Direction</h1>

          <p>
            Move two pointers in the same direction
            while each pointer has a different role.
          </p>
        </div>

        <div className="two-pointer-complexity">
          O(n)
        </div>
      </div>

      <div className="two-pointer-pattern-info">
        <div>
          <span className="two-pointer-label">
            Pattern
          </span>

          <strong>Same Direction</strong>
        </div>

        <div>
          <span className="two-pointer-label">
            Example Problem
          </span>

          <strong>Move Zeroes</strong>
        </div>
      </div>

      <div className="two-pointer-input-grid">
        <div className="two-pointer-field">
          <label>Array</label>

          <input
            value={array}
            onChange={(e) =>
              setArray(e.target.value)
            }
            placeholder="0, 1, 0, 3, 12"
          />
        </div>
      </div>

      {error && (
        <div className="two-pointer-error">
          {error}
        </div>
      )}

      <button
        className="visualize-button"
        onClick={handleVisualize}
        mt-2
      >
        Visualize Pattern
      </button>
    </section>
  );
}

export default TwoPointersSameDirectionInput;