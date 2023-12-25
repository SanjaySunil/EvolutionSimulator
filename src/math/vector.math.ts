import { to_radians } from "./geometry.math";

export default class Vector {
  public x: number;
  public y: number;
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    return this;
  }
  public add(v: Vector): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }
  public subtract(v: Vector): this {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }
  public copy(v: Vector): this {
    this.x = v.x;
    this.y = v.y;
    return this;
  }
  public clear(): this {
    this.x = 0;
    this.y = 0;
    return this;
  }
  public equal(v: Vector): boolean {
    return this.x == v.x && this.y == v.y;
  }
  public rotate_around(cx: number, cy: number, angle: number): this {
    if (typeof this.x == "number" && typeof this.y == "number") {
      const radians = to_radians(angle);
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      const nx = Math.round(cos * (this.x - cx) + sin * (this.y - cy) + cx);
      const ny = Math.round(cos * (this.y - cy) - sin * (this.x - cx) + cy);
      this.x = nx;
      this.y = ny;
      return this;
    } else {
      throw Error("Cannot rotate point as coordinates are not of type number.");
    }
  }
  public to_mag(): number {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  public to_angle(): number {
    const firstAngle = Math.atan2(1, 0);
    const secondAngle = Math.atan2(this.y, this.x);

    const angle = secondAngle - firstAngle;

    return Math.abs((angle * 180) / Math.PI);
  }
}
