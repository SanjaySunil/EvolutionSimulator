/**
 * Generates a random number between min inclusive and max inclusive.
 * @param min - The minimum number.
 * @param max - The maximum number.
 * @returns - A random number between min and max.
 */
export default function get_random_number(min, max): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
