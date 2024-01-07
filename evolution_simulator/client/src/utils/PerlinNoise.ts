/** Need to create own implementation. */
export default class PerlinNoise {
  private permutation: number[];

  constructor() {
    this.permutation = PerlinNoise.generatePermutation();
  }

  private static generatePermutation(): number[] {
    const permutation: number[] = new Array(512);
    const permutationSource: number[] = Array.from({ length: 256 }, (_, i) => i);

    for (let i = 0; i < 256; i++) {
      const randomIndex = Math.floor(Math.random() * (256 - i)) + i;
      [permutationSource[i], permutationSource[randomIndex]] = [permutationSource[randomIndex], permutationSource[i]];
    }

    for (let i = 0; i < 256; i++) {
      permutation[i] = permutation[i + 256] = permutationSource[i];
    }

    return permutation;
  }

  private static fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private static lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  private static grad(hash: number, x: number, y: number): number {
    const h = hash & 7; // Convert low 3 bits of hash code
    const u = h < 4 ? x : y; // into 8 simple gradient directions,
    const v = h < 4 ? y : x; // and compute the dot product with (x,y).
    return (h & 1 ? -u : u) + (h & 2 ? -2 * v : 2 * v);
  }

  public noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const u = PerlinNoise.fade(xf);
    const v = PerlinNoise.fade(yf);

    const aa = this.permutation[X] + Y;
    const ab = this.permutation[X + 1] + Y;
    const ba = this.permutation[X] + Y + 1;
    const bb = this.permutation[X + 1] + Y + 1;

    const gradAA = PerlinNoise.grad(this.permutation[aa], xf, yf);
    const gradAB = PerlinNoise.grad(this.permutation[ab], xf - 1, yf);
    const gradBA = PerlinNoise.grad(this.permutation[ba], xf, yf - 1);
    const gradBB = PerlinNoise.grad(this.permutation[bb], xf - 1, yf - 1);

    const lerpX1 = PerlinNoise.lerp(gradAA, gradAB, u);
    const lerpX2 = PerlinNoise.lerp(gradBA, gradBB, u);

    return PerlinNoise.lerp(lerpX1, lerpX2, v) / 2 + 0.5;
  }
}
