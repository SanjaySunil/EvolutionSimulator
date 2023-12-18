import SimulationConfig from "../NEA/src/config/simulation.config";
import { Directions } from "../NEA/src/constants/Directions";

// Genome refers to the entire set of genetic material or DNA present in the organism.
export default class Genome {
  public data: any[];
  public cs1_length: number;
  public cs2_length: number;
  constructor() {
    // Genome Length = Anatomy Size^2 + 8 possible direction probabilities
    this.cs1_length = SimulationConfig.ANATOMY_SIZE * SimulationConfig.ANATOMY_SIZE;
    this.cs2_length = 8;
    this.data = [Array(this.cs1_length), Array(this.cs2_length)];
  }
}
