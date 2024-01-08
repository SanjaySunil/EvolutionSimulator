import { Coordinate } from "../models/types/Coordinate";
import { make_vector, rotate_point } from "../utils/geometry";

export default class Directions {
  // Define static vectors representing different directions
  public static IDLE = make_vector(0, 0); // No movement vector
  public static NORTH = make_vector(0, 1); // Vector pointing north
  public static EAST = make_vector(1, 0); // Vector pointing east
  public static SOUTH = make_vector(0, -1); // Vector pointing south
  public static WEST = make_vector(-1, 0); // Vector pointing west
  public static NORTH_EAST = make_vector(1, 1); // Vector pointing northeast
  public static NORTH_WEST = make_vector(-1, 1); // Vector pointing northwest
  public static SOUTH_EAST = make_vector(-1, 1); // Vector pointing southeast
  public static SOUTH_WEST = make_vector(-1, -1); // Vector pointing southwest

  // Calculate the forward direction based on the given angle
  public static forward(angle): Coordinate {
    return rotate_point(this.NORTH, make_vector(0, 0), angle); // Rotate North vector by the given angle
  }

  // Calculate the backward direction based on the given angle
  public static backward(angle): Coordinate {
    return rotate_point(this.SOUTH, make_vector(0, 0), angle); // Rotate South vector by the given angle
  }

  // Calculate the left direction based on the given angle
  public static left(angle): Coordinate {
    return rotate_point(this.NORTH, make_vector(0, 0), angle - Math.PI / 2); // Rotate Left vector by 90 degrees from North
  }

  // Calculate the right direction based on the given angle
  public static right(angle): Coordinate {
    return rotate_point(this.NORTH, make_vector(0, 0), angle + Math.PI / 2); // Rotate Right vector by 90 degrees from North
  }
}

// Define angles for each cardinal direction
export const Angles = {
  NORTH: 0, // Angle for facing North
  EAST: 90, // Angle for facing East
  SOUTH: 180, // Angle for facing South
  WEST: 270, // Angle for facing West
};
