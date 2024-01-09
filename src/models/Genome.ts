import Gene from "./Gene";

export default class Genome {
  public data: Gene[] | null;
  public colour: string | null;

  // Builds a new genome from a given set of genes.
  constructor(genome: Gene[]) {
    this.data = genome;
    this.colour = this.get_colour(genome);
  }

  // Obtains a colour for the organism based on its genome.
  public get_colour(genome): string {
    let genome_string = "";

    // Convert each individual gene into a genome string.
    for (const gene of genome) {
      genome_string += `${gene.source_type},${gene.source_id},${gene.sink_type},${gene.sink_id},${gene.weight}`;
    }

    // Create a unique hash from the genome string.
    let hash = 0;
    for (let i = 0; i < genome_string.length; i++) {
      hash = (hash << 5) - hash + genome_string.charCodeAt(i);
    }

    // Calculate the rgb codes using the hash.
    let r = (hash & 0xff0000) >> 16;
    let g = (hash & 0x00ff00) >> 8;
    let b = hash & 0x0000ff;

    // Normalize RGB values to fit within the range of 0-255.
    r = Math.floor(r % 256);
    g = Math.floor(g % 256);
    b = Math.floor(b % 256);

    return `rgb(${r}, ${g}, ${b})`;
  }
}
