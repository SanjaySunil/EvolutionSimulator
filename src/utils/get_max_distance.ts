export function max_distance(size, x_coord, y_coord): number {
  let max_distance = 0;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const distance = Math.sqrt((i - x_coord) ** 2 + (j - y_coord) ** 2);
      max_distance = Math.max(max_distance, distance);
    }
  }

  return max_distance;
}
