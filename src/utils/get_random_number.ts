// export default function get_random_number(max: number) {
//   /** Increment max by 1 to generate a number inclusive with max. */
//   return Math.floor(Math.random() * (max + 1));
// }

export default function get_random_number(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}
