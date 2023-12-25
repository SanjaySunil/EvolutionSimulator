import { Directions } from "../constants/Directions";

export default function to_direction(v): string {
  const d = Object.keys(Directions);
  for (const key of d) {
    if (Directions[key].equal(v)) {
      return key;
    }
  }
  return `${v.x} ${v.y}`;
}
