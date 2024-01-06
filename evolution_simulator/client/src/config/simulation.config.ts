import { OutputNeurons } from './../constants/OutputNeurons';
import { InputNeurons } from "../constants/InputNeurons";

// SimulationConfig Types
type Types = Record<string, any>;

// This is the global simulation configuration file.
const SimulationConfig: Types = {
  GRID_SIZE: 128,
  TARGET_UPDATE_MAX_FPS: 300,
  TARGET_UPDATE_FPS: 300,
  TARGET_RENDER_FPS: 60,
  POPULATION: 1500,
  TICKS_PER_GENERATION: 300,
  ELITISM_PERCENT: 10,
  // DEFAULT: 5
  MUTATION_PERCENT: 0,
  SEXUAL_REPRODUCTION: true,
  NUMBER_OF_NEURONS: 127,
  // DEFAULT: 25
  NUMBER_OF_GENES: 25,

  // DO NOT CHANGE THE FOLLOWING.
  NUMBER_OF_SENSORS: Object.keys(InputNeurons).length,
  NUMBER_OF_ACTIONS: Object.keys(OutputNeurons).length,
};

export { SimulationConfig };
