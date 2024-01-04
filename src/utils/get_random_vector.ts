import { Coordinate as Vector, make_vector } from "../math/Coordinate";
import get_random_number from "./get_random_number";

/** Generates a random vector between minimum and maximum inclusive. */
export default function get_random_vector(min_x, min_y, max_x, max_y): Vector {
  const rand_x = get_random_number(min_x, max_x);
  const rand_y = get_random_number(min_y, max_y);
  return make_vector(rand_x, rand_y);
}
