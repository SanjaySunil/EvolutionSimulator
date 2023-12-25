import { cloneDeep } from "lodash";
import { Constants, SimulationConfig } from "../config/simulation.config";
import get_random_number from "../utils/get_random_number";
import Organism from "./Organism";

/** Each gene specifies one synaptic connection in a neural network. */
export class Gene {
  /** Source of the connection is either an input sensory neuron/internal neuron. */
  public source_type: number;
  /** Identifer of which input sensory neuron/internal neuron. */
  public source_id: number;
  /** Sink of the connection is either an output action neuron/internal neuron */
  public sink_type: number;
  /** Identifier of which output action neuron/internal neuron. */
  public sink_id: number;
  /** The weight of the connection. */
  public weight: number;

  /** Builds a new gene. */
  constructor() {
    this.source_type = get_random_number(0, 1);
    this.source_id = get_random_number(0, 0x7fff) % Constants.NUMBER_OF_NEURONS;
    this.sink_type = get_random_number(0, 1);
    this.sink_id = get_random_number(0, 0x7fff) % Constants.NUMBER_OF_NEURONS;
    this.weight = Math.round(Math.random() * 0xffff) - 0x8000;
  }

  /** Returns the weight as a float. */
  public weight_as_float(): number {
    return this.weight / 8192.0;
  }
}

/** The genome stores the set of genes. */
export class Genome {
  /** Structure storing the set of genes. */
  public data: Gene[] | undefined;
  /** Owner of the genome. */
  public owner: Organism;
  public colour: string | undefined;
  public parent: boolean;

  /** Builds a new genome. */
  constructor(owner: Organism, genome: Gene[] | null = null) {
    this.owner = owner;
    this.parent = false;
    this.data;
    this.colour;
    this.copy_genome(genome).then(() => this.get_colour().then(() => this.mutate()));
  }

  /**
   * Copies the genome from the parent, if the organism has no parent, then a
   * new set of random genes are generated.
   */
  public copy_genome(genome: Gene[] | null): any {
    return new Promise((resolve) => {
      if (genome === null) {
        /** Organism doesn't have a parent, so lets create a random set of genes. */
        const data: Gene[] = [];
        for (let i = 0; i < Constants.NUMBER_OF_GENES; i++) data.push(new Gene());
        this.parent = false;
        this.data = data;
        resolve("Genome initialized.");
      } else {
        /** Organism has a parent, so lets clone the parents genes. */
        this.parent = true;
        this.data = cloneDeep(genome);
        resolve("Genome copied.");
      }
    });
  }

  /** Mutate the genome */
  public mutate(): void {
    if (this.data) {
      const chance = Math.random();
      if (chance < SimulationConfig.MUTATION_PROB) {
        const index = get_random_number(0, Constants.NUMBER_OF_GENES - 1);
        this.mutate_gene(index);
      }
    }
  }

  /** Mutate gene */
  public mutate_gene(index: number): void {
    const bitMask = 1 << get_random_number(0, 15);
    const chance = Math.random(); // 0..1

    try {
      if (this.data) {
        if (chance < 0.2) {
          // sourceType
          this.data[index].source_type ^= 1;
        } else if (chance < 0.4) {
          // sinkType
          this.data[index].sink_type ^= 1;
        } else if (chance < 0.6) {
          // sourceNum
          this.data[index].source_id ^= bitMask;
        } else if (chance < 0.8) {
          // sinkNum
          this.data[index].sink_id ^= bitMask;
        } else {
          // weight
          this.data[index].weight ^= bitMask;
        }
      }
    } catch (e) {
      console.log(index);
    }
  }

  /** Generate the colour of the organism based on the genes. */
  public get_colour(): any {
    return new Promise((resolve) => {
      if (this.data) {
        let genomeString = "";

        /** Convert each individual gene into a genome string. */
        for (const gene of this.data) {
          genomeString += `${gene.source_type},${gene.source_id},${gene.sink_type},${gene.sink_id},${gene.weight}`;
        }

        /** Create a unique hash from the genome string. */
        let hash = 0;
        for (let i = 0; i < genomeString.length; i++) {
          hash = (hash << 5) - hash + genomeString.charCodeAt(i);
        }

        /** Calculate the rgb codes using the hash. */
        let r = (hash & 0xff0000) >> 16;
        let g = (hash & 0x00ff00) >> 8;
        let b = hash & 0x0000ff;

        /** Normalize RGB values to fit within the range of 0-255. */
        r = Math.floor(r % 256);
        g = Math.floor(g % 256);
        b = Math.floor(b % 256);

        this.colour = `rgb(${r}, ${g}, ${b})`;
        resolve("Organism colour calculated.");
      }
    });
  }
}
