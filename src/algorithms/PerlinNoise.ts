// Function to generate a permutation of the numbers 0-255.
function generate_permutation(): number[] {
  // Create an empty array to store the permutation.
  const permutation: number[] = [];

  // Creates a permutation of the numbers 0-255.
  for (let i = 0; i < 512; i++) {
    permutation.push(Math.floor(Math.random() * 255));
  }

  // Return the permutation.
  return permutation;
}

// Function to fade the value t.
function fade(t: number): number {
  return Math.pow(t, 3) * (t * (t * 6 - 15) + 10);
}

// Function to linearly interpolate between a and b.
function lerp(t: number, a: number, b: number): number {
  return a + t * (b - a);
}

// Function to calculate the gradient using the hash.
function grad(hash: number, x: number): number {
  const h = hash & 15;
  const grad = 1 + (h & 7);
  if ((h & 8) !== 0) {
    return -grad * x;
  }
  return grad * x;
}

function noise(permutation, x: number): number {
  const X = Math.floor(x) & 255;
  x -= Math.floor(x);
  const u = fade(x);
  return lerp(u, grad(permutation[X], x), grad(permutation[X + 1], x - 1));
}

export default function generate_noise(width, height, threshold, scale) {
  const permutation = generate_permutation();
  const noise_map: number[][] = [];

  for (let x = 0; x < width; x++) {
    noise_map.push([]);
    for (let y = 0; y < height; y++) {
      const sample_x = x / scale;
      const sample_y = y / scale;

      const value = (noise(permutation, sample_x) + 1) / 2;

      noise_map[x].push(value > threshold ? 1 : 0);
    }
  }
}
