// Normalise weight to a float between -5 and 5.
export default function normalise_weight(weight): number {
  // Weight range = -32768 to 32767.
  // Dividing by 6553.6 scales the weight between -5 and 5.
  return weight / 6553.6;
}
