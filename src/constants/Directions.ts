import Vector from "../math/vector.math";

/** Direction Constants. */
class DirectionsConstants {
  public IDLE: Vector;
  public NORTH: Vector;
  public EAST: Vector;
  public SOUTH: Vector;
  public WEST: Vector;
  public NORTH_EAST: Vector;
  public NORTH_WEST: Vector;
  public SOUTH_EAST: Vector;
  public SOUTH_WEST: Vector;
  constructor() {
    this.IDLE = new Vector(0, 0);
    this.NORTH = new Vector(0, 1);
    this.EAST = new Vector(1, 0);
    this.SOUTH = new Vector(0, -1);
    this.WEST = new Vector(-1, 0);
    this.NORTH_EAST = new Vector(1, 1);
    this.NORTH_WEST = new Vector(-1, 1);
    this.SOUTH_EAST = new Vector(-1, 1);
    this.SOUTH_WEST = new Vector(-1, -1);
  }
  public forward(angle): Vector {
    return this.NORTH.rotate_around(0, 0, angle);
  }
  public backward(angle): Vector {
    return this.SOUTH.rotate_around(0, 0, angle);
  }
  public left(angle): Vector {
    return this.NORTH.rotate_around(0, 0, angle - Math.PI / 2);
  }
  public right(angle): Vector {
    return this.NORTH.rotate_around(0, 0, angle + Math.PI / 2);
  }
}

const Directions = new DirectionsConstants();

const Angles = {
  NORTH: 0,
  EAST: 90,
  SOUTH: 180,
  WEST: 270,
};

export { Directions, Angles };
