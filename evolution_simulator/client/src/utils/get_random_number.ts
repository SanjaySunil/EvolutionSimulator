// Generate a random number between min inclusive and max inclusive.
export default function get_random_number(min, max): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
