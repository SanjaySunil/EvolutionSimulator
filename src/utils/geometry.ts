import { Coordinate } from "../types/Coordinate";

/**
 * Converts an angle to radians.
 * @param angle - The angle to convert to radians.
 * @returns The angle in radians.
 */
export function to_radians(angle): number {
  return (Math.PI / 180) * angle;
}

/**
 * Calculates the Euclidean distance between two coordinates.
 * @param first_coord - The first coordinate.
 * @param second_coord - The second coordinate.
 * @returns The Euclidean distance between the two coordinates.
 */
export function euclidean_distance(first_coord: Coordinate, second_coord: Coordinate): number {
  return Math.sqrt(Math.pow(second_coord.y - first_coord.y, 2) + Math.pow(second_coord.x - first_coord.x, 2));
}

/**
 * Rotates a point about a pivot by a specified angle.
 * @param point - The point to rotate.
 * @param pivot - The pivot to rotate the point about.
 * @param angle - The angle to rotate the point by.
 * @returns The rotated point.
 */
export function rotate_point(point: Coordinate, pivot: Coordinate, angle: number): Coordinate {
  if (typeof point.x == "number" && typeof point.y == "number") {
    // Convert the angle to radians.
    const radians = to_radians(angle);
    // Calculate the new x and y coordinates of the point after rotation.
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const nx = Math.round(cos * (point.x - pivot.x) + sin * (point.y - pivot.y) + pivot.x);
    const ny = Math.round(cos * (point.y - pivot.y) - sin * (point.x - pivot.x) + pivot.y);
    return { x: nx, y: ny };
  } else {
    // Throw an error if the coordinates are not of type number.
    throw Error("Cannot rotate point as coordinates are not of type number.");
  }
}

/**
 * Performs addition of two vectors.
 * @param first_coord
 * @param second_coord
 * @returns The sum of the two vectors.
 */
export function add_vector(first_coord, second_coord): Coordinate {
  return { x: first_coord.x + second_coord.x, y: first_coord.y + second_coord.y };
}

/**
 * Creates a coordinate object, treating as a vector.
 * @param x - The x-coordinate of the vector.
 * @param y - The y-coordinate of the vector.
 * @returns The coordinate object.
 */
export const make_vector = (x: number, y: number): Coordinate => {
  return { x: x, y: y };
};

/**
 * Converts a vector to an angle in degrees.
 * @param point - The point to convert to an angle.
 * @returns The angle in degrees.
 */
export function to_angle(point: Coordinate): number {
  const first_angle = Math.atan2(1, 0);
  const second_angle = Math.atan2(point.y, point.x);
  const angle = second_angle - first_angle;

  return Math.abs((angle * 180) / Math.PI);
}
