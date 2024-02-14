import Gene from "./Gene";

/** This class is used to create a genome that can be used to store information */
export default class Genome {
  public colour: string | null;
  public data: Gene[] | null;

  /**
   * Instantiates a new Genome from a given set of genes.
   * @param genome - The genes to create the genome from.
   */
  constructor(genome: Gene[]) {
    this.data = genome;
    this.colour = this.get_colour(genome);
  }

  /**
   * Obtains a colour for the organism based on its genome.
   * @param genome
   * @returns The colour of the organism.
   */
  private get_colour(genome): string {
    // Create a string to store the genome data.
    let genome_string = "";

    // Convert each individual gene into a genome string.
    for (const gene of genome) {
      genome_string += `${gene.source_type},${gene.source_id},${gene.sink_type},${gene.sink_id}`;
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

    // Return the rgb colour.
    return `rgb(${r}, ${g}, ${b})`;
  }
}
