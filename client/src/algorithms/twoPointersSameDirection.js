export function twoPointersSameDirection(array) {
  const steps = [];

  const values = [...array];

  let write = 0;
  let read = 0;

  steps.push({
    type: "start",
    array: [...values],
    read,
    write,
  });

  while (read < values.length) {
    steps.push({
      type: "check",
      array: [...values],
      read,
      write,
      value: values[read],
    });

    if (values[read] !== 0) {
      if (read !== write) {
        steps.push({
          type: "move",
          array: [...values],
          read,
          write,
          value: values[read],
          from: read,
          to: write,
        });

        [values[write], values[read]] = [
          values[read],
          values[write],
        ];
      }

      write++;

      steps.push({
        type: "advance-write",
        array: [...values],
        read,
        write,
      });
    } else {
      steps.push({
        type: "skip",
        array: [...values],
        read,
        write,
        value: values[read],
      });
    }

    read++;

    if (read < values.length) {
      steps.push({
        type: "advance-read",
        array: [...values],
        read,
        write,
      });
    }
  }

  steps.push({
    type: "complete",
    array: [...values],
    read: values.length,
    write,
  });

  return {
    steps,
    result: values,
  };
}