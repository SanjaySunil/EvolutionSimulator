import { Coordinate, make_vector, rotate_point } from "../math/Coordinate";

export default class Directions {
  public static IDLE = make_vector(0, 0);
  public static NORTH = make_vector(0, 1);
  public static EAST = make_vector(1, 0);
  public static SOUTH = make_vector(0, -1);
  public static WEST = make_vector(-1, 0);
  public static NORTH_EAST = make_vector(1, 1);
  public static NORTH_WEST = make_vector(-1, 1);
  public static SOUTH_EAST = make_vector(-1, 1);
  public static SOUTH_WEST = make_vector(-1, -1);

  public static forward(angle): Coordinate {
    return rotate_point(this.NORTH, make_vector(0, 0), angle);
  }

  public static backward(angle): Coordinate {
    return rotate_point(this.SOUTH, make_vector(0, 0), angle);
  }

  public static left(angle): Coordinate {
    return rotate_point(this.NORTH, make_vector(0, 0), angle - Math.PI / 2);
  }

  public static right(angle): Coordinate {
    return rotate_point(this.NORTH, make_vector(0, 0), angle + Math.PI / 2);
  }
}

export const Angles = {
  NORTH: 0,
  EAST: 90,
  SOUTH: 180,
  WEST: 270,
};
