import { SensorNeurons, ActionNeurons } from "../organism/Neurons";

// Configuration Types
type Types = Record<string, any>;

// This is the global simulation configuration file.
const SimulationConfig: Types = {};

// SIMULATION CONFIGURATION
SimulationConfig.GRID_SIZE = 128;
SimulationConfig.TARGET_UPDATE_MAX_FPS = 300;
SimulationConfig.TARGET_UPDATE_FPS = 300;
SimulationConfig.TARGET_RENDER_FPS = 60;

// WORLD CONFIGURATION
SimulationConfig.POPULATION = 1500;
SimulationConfig.TICKS_PER_GENERATION = 300;
SimulationConfig.ELITISM_PERCENT = 10;
SimulationConfig.MUTATION_PERCENT = 0; // 5
SimulationConfig.SEXUAL_REPRODUCTION = true;

// Number of internal neurons.
SimulationConfig.NUMBER_OF_NEURONS = 127;
// Number of NeuralNet connections.
SimulationConfig.NUMBER_OF_GENES = 25; // 50

// DO NOT CHANGE THE FOLLOWING.
SimulationConfig.NUMBER_OF_SENSORS = Object.keys(SensorNeurons).length;
SimulationConfig.NUMBER_OF_ACTIONS = Object.keys(ActionNeurons).length;

export { SimulationConfig };
