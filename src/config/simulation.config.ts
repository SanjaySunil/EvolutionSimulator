// Importing constants for output and input neurons
import { OutputNeurons } from "./../constants/OutputNeurons";
import { InputNeurons } from "../constants/InputNeurons";

// Defining Types for DefaultSimulationConfig
type Types = Record<string, any>;

/** Default simulation settings. */
const DefaultSimulationConfig: Types = {
  // Grid size for the simulation
  GRID_SIZE: 128,
  // Maximum frames per second (FPS) for updating the simulation
  TARGET_UPDATE_MAX_FPS: 300,
  // Target frames per second (FPS) for updating the simulation
  TARGET_UPDATE_FPS: 300,
  // Target frames per second (FPS) for rendering the simulation
  TARGET_RENDER_FPS: 60,
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
  // Total number of neurons in the simulation.
  NUMBER_OF_HIDDEN_NEURONS: 127, // 127
  // Maximum energy each organism can have.
  MAX_ENERGY: 1,
  // Total number of genes for organisms
  NUMBER_OF_GENES: 10,
  // Flags indicating whether goal is food or coordinated.
  GOAL_FOOD: false,
  GOAL_COORD: true,

  // Determine the number of available input and output neurons based on imported constants.
  NUMBER_OF_INPUTS: Object.keys(InputNeurons).length,
  NUMBER_OF_OUTPUTS: Object.keys(OutputNeurons).length,
};

export { DefaultSimulationConfig };
