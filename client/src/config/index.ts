import { SensorNeurons, ActionNeurons } from "../organism/Neurons";

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
  MUTATION_PERCENT: 0, // 5
  SEXUAL_REPRODUCTION: true,
  NUMBER_OF_NEURONS: 127,
  NUMBER_OF_GENES: 25, // 50

  // DO NOT CHANGE THE FOLLOWING.
  NUMBER_OF_SENSORS: Object.keys(SensorNeurons).length,
  NUMBER_OF_ACTIONS: Object.keys(ActionNeurons).length,
};

export { SimulationConfig };
