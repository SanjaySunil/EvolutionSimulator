import { Coordinate } from "../types/Coordinate";
import { make_vector, rotate_point } from "../utils/geometry";

/**
 * This class is a collection of static vectors representing different directions. It also
 * contains methods to calculate the forward, backward, left and right directions based on
 * the given angle.
 */
export default class Directions {
  // No movement vector
  public static IDLE = make_vector(0, 0);
  // Vector pointing north
  public static NORTH = make_vector(0, 1);
  // Vector pointing east
  public static EAST = make_vector(1, 0);
  // Vector pointing south
  public static SOUTH = make_vector(0, -1);
  // Vector pointing west
  public static WEST = make_vector(-1, 0);
  // Vector pointing northeast
  public static NORTH_EAST = make_vector(1, 1);
  // Vector pointing northwest
  public static NORTH_WEST = make_vector(-1, 1);
  // Vector pointing southeast
  public static SOUTH_EAST = make_vector(-1, 1);
  // Vector pointing southwest
  public static SOUTH_WEST = make_vector(-1, -1);

  /**
   * Calculates the forward direction based on the given angle.
   * @param angle - The angle to calculate the forward direction from .
   * @returns The forward direction based on the given angle.
   */
  public static forward(angle): Coordinate {
    // Rotate North vector by the given angle
    return rotate_point(this.NORTH, make_vector(0, 0), angle);
  }

  /**
   * Calculates the backward direction based on the given angle.
   * @param angle - The angle to calculate the backward direction from.
   * @returns The backward direction based on the given angle.
   */
  public static backward(angle): Coordinate {
    // Rotate South vector by the given angle
    return rotate_point(this.SOUTH, make_vector(0, 0), angle);
  }

  /**
   * Calculates the left direction based on the given angle.
   * @param angle - The angle to calculate the left direction from.
   * @returns The left direction based on the given angle.
   */
  public static left(angle): Coordinate {
    // Rotate Left vector by 90 degrees from North
    return rotate_point(this.NORTH, make_vector(0, 0), angle - Math.PI / 2);
  }

  /**
   * Calculates the right direction based on the given angle.
   * @param angle - The angle to calculate the right direction from.
   * @returns The right direction based on the given angle.
   */
  public static right(angle): Coordinate {
    // Rotate Right vector by 90 degrees from North
    return rotate_point(this.NORTH, make_vector(0, 0), angle + Math.PI / 2);
  }
}

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
