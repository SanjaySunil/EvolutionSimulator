import { make_vector } from "../utils/geometry";

/** Constant vectors for each cardinal direction. */
export const Directions = {
  // No movement vector
  IDLE: make_vector(0, 0),
  // Vector pointing north
  NORTH: make_vector(0, 1),
  // Vector pointing east
  EAST: make_vector(1, 0),
  // Vector pointing south
  SOUTH: make_vector(0, -1),
  // Vector pointing west
  WEST: make_vector(-1, 0),
  // Vector pointing northeast
  NORTH_EAST: make_vector(1, 1),
  // Vector pointing northwest
  NORTH_WEST: make_vector(-1, 1),
  // Vector pointing southeast
  SOUTH_EAST: make_vector(-1, 1),
  // Vector pointing southwest
  SOUTH_WEST: make_vector(-1, -1),
};

/** Constant angles for each cardinal direction. */
export const Angles = {
  // Angle for facing North
  NORTH: 0,
  // Angle for facing East
  EAST: 90,
  // Angle for facing South
  SOUTH: 180,
  // Angle for facing West
  WEST: 270,
};
