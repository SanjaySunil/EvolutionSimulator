interface IResult {
  x: number;
  y: number;
}

export function to_radians(angle): number {
  return (Math.PI / 180) * angle;
}

export function rotate_point(cx: number, cy: number, angle: number, px: number, py: number): IResult {
  const radians = to_radians(angle);
  const sin = Math.sin(radians);
  const cos = Math.cos(radians);
  const x = cos * (px - cx) + sin * (py - cy) + cx;
  const y = cos * (py - cy) - sin * (px - cx) + cy;

  return {
    x: Math.round(x),
    y: Math.round(y),
  };
}

export function vector_to_angle(v): number {
  const firstAngle = Math.atan2(0, 0);
  const secondAngle = Math.atan2(v.y, v.x);

  const angle = secondAngle - firstAngle;

  return (angle * 180) / Math.PI;
}
