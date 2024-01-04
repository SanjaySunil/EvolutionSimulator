import { cloneDeep } from "lodash";
import Organism from ".";
import Gene from "./Gene";

export default class Genome {
  public owner: Organism;
  public data: Gene[];
  public colour: string | undefined;

  /** Builds a new Genome. */
  constructor(owner: Organism, genome: Gene[]) {
    this.owner = owner;
    this.data = cloneDeep(genome);
    this.colour = this.get_colour();
  }

  public get_colour(): string {
    if (this.data) {
      let genomeString = "";

      // Convert each individual gene into a genome string.
      for (const gene of this.data) {
        genomeString += `${gene.source_type},${gene.source_id},${gene.sink_type},${gene.sink_id},${gene.weight}`;
      }

      // Create a unique hash from the genome string.
      let hash = 0;
      for (let i = 0; i < genomeString.length; i++) {
        hash = (hash << 5) - hash + genomeString.charCodeAt(i);
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
    } else throw Error("Genome has no data.");
  }
}
