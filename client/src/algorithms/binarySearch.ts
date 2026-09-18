export type BinarySearchSnapshot = {
  left: number;
  mid: number | null;
  right: number;
  array: number[];
  value?: number;
  target?: number;
  index?: number;
  eliminated?: [number, number];
};

export type BinarySearchStep =
  | ({
      type: "start";
    } & BinarySearchSnapshot)
  | ({
      type: "check";
    } & BinarySearchSnapshot)
  | ({
      type: "found";
    } & BinarySearchSnapshot)
  | ({
      type: "move-right";
    } & BinarySearchSnapshot)
  | ({
      type: "move-left";
    } & BinarySearchSnapshot)
  | ({
      type: "new-range";
    } & BinarySearchSnapshot)
  | {
      type: "not-found";
      left: number;
      right: number;
      mid: null;
      array: number[];
      target: number;
    };

export type BinarySearchResult = {
  steps: BinarySearchStep[];
  found: boolean;
  index: number;
};

export function binarySearch(
  array: number[],
  target: number,
): BinarySearchResult {
  const steps: BinarySearchStep[] = [];

  let left = 0;
  let right = array.length - 1;

  const createSnapshot = (
    l: number,
    m: number | null,
    r: number,
    extra: Partial<BinarySearchSnapshot> = {},
  ): BinarySearchSnapshot => ({
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
      right,
    ),
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    steps.push({
      type: "check",
      ...createSnapshot(
        left,
        mid,
        right,
        {
          value: array[mid],
          target,
        },
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
          },
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
            eliminated: [left, mid],
          },
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
            eliminated: [mid, right],
          },
        ),
      });

      right = mid - 1;
    }

    if (left <= right) {
      const nextMid = Math.floor(
        (left + right) / 2,
      );

      steps.push({
        type: "new-range",
        ...createSnapshot(
          left,
          nextMid,
          right,
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