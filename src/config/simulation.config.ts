import { ActionNeurons } from "../constants/ActionNeurons";
import { SensorNeurons } from "../constants/SensorNeurons";

/** Configuration Types */
type Types = Record<string, number>;

/** This is the global simulation configuration file. */
const SimulationConfig: Types = {};

/** SIMULATION CONFIGURATION */
SimulationConfig.GRID_SIZE = 127;
SimulationConfig.CANVAS_SIZE = SimulationConfig.GRID_SIZE * 15;
SimulationConfig.TARGET_UPDATE_FPS = 300; // 300
SimulationConfig.TARGET_RENDER_FPS = 20;
SimulationConfig.TARGET_UPDATE_MAX_FPS = 300; // 300

/** WORLD CONFIGURATION */
SimulationConfig.INITIAL_FOOD_POPULATION = 0.5;
SimulationConfig.INITIAL_ORG_POPULATION = 1000;
SimulationConfig.FOOD_DROP_PER_TICK = 15;
SimulationConfig.MAX_ORGANISMS = 1000;
SimulationConfig.ORG_PER_TICK = 0;

/** ORGANISM CONFIGURATION */
SimulationConfig.MAX_ENERGY = 100;
SimulationConfig.MAX_AGE = 99999999999;
SimulationConfig.COST_TO_MOVE = 0.1;
SimulationConfig.ENERGY_FROM_FOOD = 50;
SimulationConfig.MIN_ENERGY_TO_REPROD = 0.65 * SimulationConfig.MAX_ENERGY;
SimulationConfig.REPRODUCTION_COST = 0.35 * SimulationConfig.MAX_ENERGY;

// Make energy at birth a transfer of energy from reproduction cost.
SimulationConfig.ENERGY_AT_BIRTH = SimulationConfig.REPRODUCTION_COST;
SimulationConfig.SEXUAL_REPRODUCTION = 0;

/** NEURAL NETWORK CONFIGURATION */
const Constants: Types = {};
Constants.NUMBER_OF_SENSORS = Object.keys(SensorNeurons).length;
Constants.NUMBER_OF_ACTIONS = Object.keys(ActionNeurons).length;
Constants.NUMBER_OF_NEURONS = Math.max(Constants.NUMBER_OF_SENSORS, Constants.NUMBER_OF_ACTIONS);
Constants.NUMBER_OF_GENES = 5; // 25
SimulationConfig.MUTATION_PROB = 0.01; // 0.15 for asexual, try 0.001 for sexual

export { Constants, SimulationConfig };
