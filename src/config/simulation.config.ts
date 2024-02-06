// Importing constants for output and input neurons
import { InputNeurons } from "../constants/InputNeurons";
import { OutputNeurons } from "./../constants/OutputNeurons";

// Defining Types for DefaultSimulationConfig
type Types = Record<string, any>;

export const FixedDefaults: Types = {
  // Maximum frames per second (FPS) for rendering the simulation
  TARGET_RENDER_FPS: 60,
  // Maximum frames per second (FPS) for updating the simulation
  TARGET_UPDATE_MAX_FPS: 300,
};

/** Default simulation settings. */
export const DefaultSimulationConfig: Types = {
  // Grid size for the simulation
  GRID_SIZE: 128,
  // Target frames per second (FPS) for updating the simulation
  TARGET_UPDATE_FPS: 300,
  // Number of organisms in the population
  POPULATION: 1500,
  // Number of simulation steps before moving to next generation.
  TICKS_PER_GENERATION: 300,
  // Percentage of top performers considered for elitism
  ELITISM_PERCENT: 10,
  // Percentage of top performers for reproduction
  TOP_PERCENT_TO_REPRODUCE: 3,
  // Percentage of mutation rate
  MUTATION_PERCENT: 0,
  // Flag for enabling sexual reproduction
  SEXUAL_REPRODUCTION: true,
  // Maximum energy each organism can have.
  MAX_ENERGY: 1,
  // Energy gained from food
  ENERGY_FROM_FOOD: 1,
  // Total number of neurons in the simulation.
  NUMBER_OF_HIDDEN_NEURONS: 127, // 127
  // Determine the number of available input and output neurons based on imported constants.
  NUMBER_OF_INPUTS: Object.keys(InputNeurons).length,
  NUMBER_OF_OUTPUTS: Object.keys(OutputNeurons).length,
  // Total number of genes for organisms
  NUMBER_OF_GENES: 10,
  // Flags indicating whether goal is food or coordinated.
  GOAL_FOOD: true,
  GOAL_COORD: false,
};

export const SimulationConfigBoundaries: Types = {
  GRID_SIZE: [32, 512],
  TARGET_UPDATE_MAX_FPS: [1, 300],
  TARGET_UPDATE_FPS: [1, 300],
  TARGET_RENDER_FPS: [1, 300],
  POPULATION: [10, 10000],
  TICKS_PER_GENERATION: [50, 1000],
  ELITISM_PERCENT: [0, 100],
  TOP_PERCENT_TO_REPRODUCE: [0, 100],
  MUTATION_PERCENT: [0, 100],
  MAX_ENERGY: [1, 100],
  ENERGY_FROM_FOOD: [1, 100],
  NUMBER_OF_HIDDEN_NEURONS: [0, 512],
  NUMBER_OF_INPUTS: [1, Object.keys(InputNeurons).length],
  NUMBER_OF_OUTPUTS: [1, Object.keys(OutputNeurons).length],
  NUMBER_OF_GENES: [1, 512],
};
