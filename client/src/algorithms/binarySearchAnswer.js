export function binarySearchAnswer(
  piles,
  hours
) {
  const steps = [];

  let left = 1;
  let right = Math.max(...piles);

  let answer = right;

  const canFinish = (speed) => {
    let requiredHours = 0;

    for (const pile of piles) {
      requiredHours += Math.ceil(
        pile / speed
      );
    }

    return requiredHours <= hours;
  };

  while (left <= right) {
    const mid =
      Math.floor((left + right) / 2);

    let requiredHours = 0;

    for (const pile of piles) {
      requiredHours += Math.ceil(
        pile / mid
      );
    }

    const possible =
      requiredHours <= hours;

    steps.push({
      type: "check",
      left,
      mid,
      right,
      answer,
      speed: mid,
      requiredHours,
      allowedHours: hours,
      possible,
      piles: [...piles],
    });

    if (possible) {
      answer = mid;

      steps.push({
        type: "possible",
        left,
        mid,
        right,
        answer: mid,
        speed: mid,
        requiredHours,
        allowedHours: hours,
        piles: [...piles],
      });

      right = mid - 1;
    } else {
      steps.push({
        type: "impossible",
        left,
        mid,
        right,
        answer,
        speed: mid,
        requiredHours,
        allowedHours: hours,
        piles: [...piles],
      });

      left = mid + 1;
    }
  }

  steps.push({
    type: "found",
    left,
    mid: answer,
    right,
    answer,
    speed: answer,
    piles: [...piles],
    allowedHours: hours,
  });

  return {
    steps,
    answer,
  };
}