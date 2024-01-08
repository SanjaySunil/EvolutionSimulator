// Returns the weight as a float.
export default function weight_as_float(weight): number {
  // Weight range = -32768 to 32767.
  // Dividing by 6553.6 scales the weight between -5 and 5.
  return weight / 6553.6;
}
