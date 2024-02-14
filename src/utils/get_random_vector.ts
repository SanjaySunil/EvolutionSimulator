import { Coordinate } from "../types/Coordinate";
import { make_vector } from "./geometry";
import get_random_number from "./get_random_number";

/**
 * Generates a random vector between minimum and maximum inclusive.
 * @param min_x - The minimum x-coordinate.
 * @param min_y - The minimum y-coordinate.
 * @param max_x - The maximum x-coordinate.
 * @param max_y -  The maximum y-coordinate.
 * @returns - A random vector between minimum and maximum inclusive.
 */
export default function get_random_vector(min_x, min_y, max_x, max_y): Coordinate {
  const random_x = get_random_number(min_x, max_x);
  const random_y = get_random_number(min_y, max_y);
  return make_vector(random_x, random_y);
}
