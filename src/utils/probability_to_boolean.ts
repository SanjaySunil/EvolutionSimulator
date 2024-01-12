/**
 * Converts a probability factor to a boolean value.
 * @param factor - The probability factor.
 * @returns - A boolean value.
 */
export default function probability_to_boolean(factor: number): boolean {
  return Math.random() < factor;
}
