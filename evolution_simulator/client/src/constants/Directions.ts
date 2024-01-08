import { Coordinate } from "../models/types/Coordinate";
import { make_vector, rotate_point } from "../utils/geometry";

export default class Directions {
  // Define static vectors representing different directions
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

  // Calculate the forward direction based on the given angle
  public static forward(angle): Coordinate {
    // Rotate North vector by the given angle
    return rotate_point(this.NORTH, make_vector(0, 0), angle); 
  }

  // Calculate the backward direction based on the given angle
  public static backward(angle): Coordinate {
    // Rotate South vector by the given angle
    return rotate_point(this.SOUTH, make_vector(0, 0), angle); 
  }

  // Calculate the left direction based on the given angle
  public static left(angle): Coordinate {
    // Rotate Left vector by 90 degrees from North
    return rotate_point(this.NORTH, make_vector(0, 0), angle - Math.PI / 2); 
  }

  // Calculate the right direction based on the given angle
  public static right(angle): Coordinate {
    // Rotate Right vector by 90 degrees from North
    return rotate_point(this.NORTH, make_vector(0, 0), angle + Math.PI / 2); 
  }
}

// Define angles for each cardinal direction
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
