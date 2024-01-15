/**
 * Generates a grid of obstructions.
 * @param width - The width of the grid.
 * @param height - The height of the grid.
 * @param threshold - The threshold for making a cell a wall.
 * @returns - A grid of 0s and 1s.
 */
export default function generate_obstructions(width: number, height: number, threshold): number[][] {
  const obstructions: number[][] = [];

  for (let i = 0; i < width; i++) {
    obstructions[i] = [];
    for (let j = 0; j < height; j++) {
      obstructions[i][j] = Math.random() > threshold ? 1 : 0;
    }
  }

  return obstructions;
}
