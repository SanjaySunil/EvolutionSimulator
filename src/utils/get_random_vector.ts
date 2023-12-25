import Vector from "../math/vector.math";
import get_random_number from "./get_random_number";

export default function get_random_vector(min_x, min_y, max_x, max_y): Vector {
  const rand_x = get_random_number(min_x, max_x);
  const rand_y = get_random_number(min_y, max_y);
  return new Vector(rand_x, rand_y);
}
