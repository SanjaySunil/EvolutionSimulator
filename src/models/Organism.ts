import { DefaultSimulationConfig } from "../config/simulation.config";
import { Directions } from "../constants/Directions";
import { OutputNeurons } from "../constants/OutputNeurons";
import { Grid } from "../environment/Grid";
import { Coordinate } from "../types/Coordinate";
import { make_vector } from "../utils/geometry";
import probability_to_boolean from "../utils/probability_to_boolean";
import Brain from "./Brain";
import Gene from "./Gene";
import Genome from "./Genome";

/** This class is used to represent an organism in the simulation. */
export default class Organism {
  private _coordinate: Coordinate;
  private _energy: number;
  public genome: Genome;
  public brain: Brain;
  public fitness: number | null;
  public alive: boolean;
  public direction: Coordinate;
  public config: typeof DefaultSimulationConfig;
  public grid: Grid;

  /**
   * Instantiates a new Organism.
   * @param coordinate - The coordinate of the organism.
   * @param genome - The genome of the organism.
   * @param grid - Reference to the grid.
   * @param config - The configuration to use for the organism.
   */
  constructor(coordinate, genome: Gene[], grid: Grid, config) {
    this.grid = grid;
    this._coordinate = coordinate;
    // If a genome has been given, use this genome, else create a new random genome.
    this.genome = new Genome(genome);
    this.config = config;
    this.brain = new Brain(
      this.coordinate,
      this.grid,
      this.genome.data,
      this.config.NUMBER_OF_INPUT_NEURONS,
      this.config.NUMBER_OF_HIDDEN_NEURONS,
      this.config.NUMBER_OF_OUTPUTS_NEURONS
    );
    this.direction = Directions.NORTH;
    this.fitness = null;
    this.alive = true;
    this._energy = 0;
  }

  /** Gets the energy of the organism. */
  public get energy(): number {
    return this._energy;
  }

  /**
   * Sets the energy of the organism.
   * @param energy - The new energy value of the organism.
   */
  public set energy(energy: number) {
    if (energy >= 0 && energy <= this.config.MAX_ENERGY) {
      this._energy = energy;
    }
  }

  /**
   * Sets the coordinate of the organism.
   * @param coordinate - The new coordinate of the organism.
   */
  public set coordinate(coordinate: Coordinate) {
    // Clears the current cell state of the organism's previous coordinate.
    this.grid.clear_cell_state(this.coordinate);
    // Sets the cell owner to the current organism at the new specified coordinate.
    this.grid.set_cell_owner(coordinate, this);
    // Updates the organism's _coordinate property with the new coordinate value.
    this._coordinate = coordinate;
  }

  /**
   * Gets the coordinate of the organism.
   * @returns The coordinate of the organism.
   */
  public get coordinate(): Coordinate {
    return this._coordinate;
  }

  /**
   * Performs an action based on the organism's brain.
   * @returns The coordinate offset of the action.
   */
  public action(): Coordinate {
    // Perform Neural Network Feed Forward to obtain action levels.
    const action_levels = this.brain.feed_forward();
    // Compute the action to take based on the action levels.
    return this.compute_movement_offset(action_levels);
  }

  /**
   * Computes the action based on the action levels.
   * @param action_levels - The action levels to compute the action from.
   * @returns
   */
  private compute_movement_offset(action_levels: number[]): Coordinate {
    // 'move_x' and 'move_y' represent the urge to move in the X and Y direction respectively.
    let move_x = action_levels[OutputNeurons.MOVE_X];
    let move_y = action_levels[OutputNeurons.MOVE_Y];

    // Accumulate the urge to move based on specific output neurons representing directions.
    move_x += action_levels[OutputNeurons.MOVE_EAST];
    move_x -= action_levels[OutputNeurons.MOVE_WEST];
    move_y += action_levels[OutputNeurons.MOVE_NORTH];
    move_y -= action_levels[OutputNeurons.MOVE_SOUTH];

    // The hyperbolic tangent function confines movement values between -1.0 and 1.0.
    move_x = Math.tanh(move_x);
    move_y = Math.tanh(move_y);

    // Calculate probabilities based on absolute values.
    const prob_x = +probability_to_boolean(Math.abs(move_x));
    const prob_y = +probability_to_boolean(Math.abs(move_y));

    // Determine direction of movement based on the sign of the values using signum function.
    const signum_x = move_x < 0.0 ? -1 : 1;
    const signum_y = move_y < 0.0 ? -1 : 1;

    // Create a vector representing the calculated movement based on probabilities and directions.
    const offset = make_vector(prob_x * signum_x, prob_y * signum_y);

    // Return the calculated offset vector.
    return offset;
  }
}
