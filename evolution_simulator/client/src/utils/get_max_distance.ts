export function max_distance(size, targetX, targetY) {
  let maxDistance = 0;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const distance = Math.sqrt((i - targetX) ** 2 + (j - targetY) ** 2);
      maxDistance = Math.max(maxDistance, distance);
    }
  }

  return maxDistance;
}
