import Organism from "../.old/Organism.model";
import { BrainStates } from "../../NEA/src/constants/BrainStates";
import SimulationConfig from "../../NEA/src/config/simulation.config";
import { Directions } from "../../NEA/src/constants/Directions";

// Brain of an Organism
export default class Brain {
  public self: Organism;
  public state: string;

  constructor(self: Organism) {
    this.self = self;
    // Default state is IDLE.
    this.state = BrainStates[0];
  }

  public make_decision(): void {
    if (this.self.energy >= SimulationConfig.MIN_ENERGY_TO_REPROD * this.self.max_energy) {
      // console.log("wants to reprod");
    } else if (this.self.energy <= SimulationConfig.ENERGY_TO_HUNT * this.self.max_energy) {
      // console.log("wants food");
      this.state = BrainStates[1];
      return;
    } else {
      // console.log("wants to roam");
      this.state = BrainStates[5];
    }
  }

  public decide_direction(): any {
    const rand = Math.random();
    let sum = 0;
    for (let i = 0; i < this.self.genome.cs2_length; i++) {
      const dp = this.self.genome.data[1][i];
      sum += dp;
      if (sum >= rand) {
        return Directions[Object.keys(Directions)[i]];
      }
    }
  }

  // private generate_genes(): void {
  //   const gene_probabilities = [];
  //   const directions = 8;

  //   // Push random probabilities
  //   for (let i = 0; i < directions - 1; i++) {
  //     gene_probabilities.push(Math.random());
  //   }

  //   // Sort in ascending order
  //   gene_probabilities.sort((a, b) => a - b);

  //   // Calculate the differences
  //   const differences = [];
  //   for (let i = 1; i < directions - 1; i++) {
  //     differences.push(gene_probabilities[i] - gene_probabilities[i - 1]);
  //   }

  //   // Get full probability distribution
  //   const genes = [gene_probabilities[0], ...differences, 1 - gene_probabilities[directions - 2]];
  //   return genes;

  //   // Should Equal 1.
  //   // let sum = 0;
  //   // for (const i of normalized) {
  //   //   sum += i;
  //   // }
  //   // console.log(sum);
  // }
}
