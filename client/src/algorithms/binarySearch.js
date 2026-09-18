export function binarySearch(array, target) {
  const steps = [];

  let left = 0;
  let right = array.length - 1;

  const createSnapshot = (
    l,
    m,
    r,
    extra = {}
  ) => ({
    left: l,
    mid: m,
    right: r,
    array: [...array],
    ...extra,
  });

  steps.push({
    type: "start",
    ...createSnapshot(
      left,
      Math.floor((left + right) / 2),
      right
    ),
  });

  while (left <= right) {
    const mid =
      Math.floor((left + right) / 2);

    steps.push({
      type: "check",
      ...createSnapshot(
        left,
        mid,
        right,
        {
          value: array[mid],
          target,
        }
      ),
    });

    if (array[mid] === target) {
      steps.push({
        type: "found",
        ...createSnapshot(
          left,
          mid,
          right,
          {
            value: array[mid],
            target,
            index: mid,
          }
        ),
      });

      return {
        steps,
        found: true,
        index: mid,
      };
    }

    if (array[mid] < target) {
      steps.push({
        type: "move-right",
        ...createSnapshot(
          left,
          mid,
          right,
          {
            value: array[mid],
            target,
            eliminated: [
              left,
              mid,
            ],
          }
        ),
      });

      left = mid + 1;
    } else {
      steps.push({
        type: "move-left",
        ...createSnapshot(
          left,
          mid,
          right,
          {
            value: array[mid],
            target,
            eliminated: [
              mid,
              right,
            ],
          }
        ),
      });

      right = mid - 1;
    }

    if (left <= right) {
      const nextMid =
        Math.floor((left + right) / 2);

      steps.push({
        type: "new-range",
        ...createSnapshot(
          left,
          nextMid,
          right
        ),
      });
    }
  }

  steps.push({
    type: "not-found",
    left,
    right,
    mid: null,
    array: [...array],
    target,
  });

  return {
    steps,
    found: false,
    index: -1,
  };
}