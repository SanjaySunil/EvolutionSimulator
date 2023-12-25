import { ActionNeurons } from "../constants/ActionNeurons";
import { SensorNeurons } from "../constants/SensorNeurons";

type Types = Record<string, number>;

/** This is the global simulation configuration file. */
const SimulationConfig: Types = {};

/** SIMULATION CONFIGURATION */
SimulationConfig.GRID_SIZE = 127;
SimulationConfig.CANVAS_SIZE = SimulationConfig.GRID_SIZE * 16;
SimulationConfig.TARGET_UPDATE_FPS = 30;
SimulationConfig.TARGET_RENDER_FPS = 60;
SimulationConfig.TARGET_UPDATE_MAX_FPS = 300;

/** WORLD CONFIGURATION */
SimulationConfig.INITIAL_FOOD_POPULATION = 0.9; // Adjusted initial food population
SimulationConfig.INITIAL_ORG_POPULATION = 1; // Adjusted initial organism population
SimulationConfig.FOOD_DROP_PER_TICK = 25; // Adjusted food drop rate
SimulationConfig.MAX_ORGANISMS = 9999; // Reduced maximum organisms
SimulationConfig.ORG_PER_TICK = 0; // Introducing a small number of new organisms per tick

/** ORGANISM CONFIGURATION */
SimulationConfig.COST_TO_MOVE = 10;
SimulationConfig.ENERGY_FROM_FOOD = 100;
SimulationConfig.MAX_ENERGY = 1000;
SimulationConfig.MAX_AGE = 3000;
SimulationConfig.ENERGY_AT_BIRTH = 0.5 * SimulationConfig.MAX_ENERGY;
SimulationConfig.MIN_ENERGY_TO_REPROD = 0.7 * SimulationConfig.MAX_ENERGY; // Adjusted reproduction energy threshold
SimulationConfig.REPRODUCTION_COST = 0.15 * SimulationConfig.MAX_ENERGY;

/** NEURAL NETWORK CONFIGURATION */
const Constants: Types = {};
Constants.NUMBER_OF_SENSORS = Object.keys(SensorNeurons).length;
Constants.NUMBER_OF_ACTIONS = Object.keys(ActionNeurons).length;
Constants.NUMBER_OF_NEURONS = 15; // Increased number of neurons
Constants.NUMBER_OF_GENES = 50;
SimulationConfig.MUTATION_PROB = 0;

export { Constants, SimulationConfig };
