/** Coordinate type. */
export type Coordinate = {
  x: number;
  y: number;
};

/** Converts an angle to radians. */
export function to_radians(angle): number {
  return (Math.PI / 180) * angle;
}

/** Calculates the Euclidean distance between two coordinates. */
export function euclidean_distance(first_coord: Coordinate, second_coord: Coordinate): number {
  return Math.sqrt(Math.pow(second_coord.y - first_coord.y, 2) + Math.pow(second_coord.x - first_coord.x, 2));
}

/** Rotates a point about a pivot by a specified angle. */
export function rotate_point(point: Coordinate, pivot: Coordinate, angle: number): Coordinate {
  if (typeof point.x == "number" && typeof point.y == "number") {
    const radians = to_radians(angle);
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const nx = Math.round(cos * (point.x - pivot.x) + sin * (point.y - pivot.y) + pivot.x);
    const ny = Math.round(cos * (point.y - pivot.y) - sin * (point.x - pivot.x) + pivot.y);
    return { x: nx, y: ny };
  } else {
    throw Error("Cannot rotate point as Coordinateinates are not of type number.");
  }
}

/** Performs addition of two vectors. */
export function add_vector(first_coord, second_coord): Coordinate {
  return { x: first_coord.x + second_coord.x, y: first_coord.y + second_coord.y };
}

/** Creates a coordinate object, treating as a Vector. */
export const make_vector = (x: number, y: number): Coordinate => {
  return { x: x, y: y };
};

export function to_angle(point: Coordinate): number {
  const firstAngle = Math.atan2(1, 0);
  const secondAngle = Math.atan2(point.y, point.x);

  const angle = secondAngle - firstAngle;

  return Math.abs((angle * 180) / Math.PI);
}
