import { SimulationConfig } from "../config/simulation.config";
import Directions from "../constants/Directions";
import { OutputNeurons } from "../constants/OutputNeurons";
import { Grid } from "../environment/Grid";
import { make_vector } from "../utils/geometry";
import prob2bool from "../utils/prob2bool";
import Brain from "./Brain";
import Gene from "./Gene";
import Genome from "./Genome";
import { Coordinate } from "./types/Coordinate";

// Represents an organism in the simulation.
export default class Organism {
  private _coordinate: Coordinate;
  public genome: Genome;
  public brain: Brain;
  public fitness: number | null;
  public alive: boolean;
  public energy: number;
  public age: number;
  public direction: Coordinate;
  public config: typeof SimulationConfig;
  public id: number;
  public grid: Grid;

  // Constructs a new Organism object.
  constructor(coordinate, genome: Gene[], grid: Grid, config, id) {
    this.grid = grid;
    this._coordinate = coordinate;
    // If a genome has been given, use this genome, else create a new random genome.
    this.genome = new Genome(this, genome);
    this.config = config;
    this.brain = new Brain(this, this.config.NUMBER_OF_SENSORS, this.config.NUMBER_OF_NEURONS, this.config.NUMBER_OF_ACTIONS);
    this.direction = Directions.NORTH;
    this.fitness = null;
    this.alive = true;
    this.age = 0;
    this.energy = 0;
    this.id = id;
  }

  // Sets the coordinate of the organism.
  public set coordinate(coordinate: Coordinate) {
    this.grid.clear_cell_state(this.coordinate);
    this.grid.set_cell_owner(coordinate, this);
    this._coordinate = coordinate;
  }

  // Gets the coordinate of the organism.
  public get coordinate(): Coordinate {
    return this._coordinate;
  }
  
  // Performs an action based on the organism's brain.
  public action(): Coordinate {
    // Perform NN Feed Forward.
    const action_levels = this.brain.feed_forward();
    // Compute function with action levels.
    return this.compute_action(action_levels);
  }

  // Computes the action based on the action levels.
  public compute_action(action_levels: number[]): Coordinate {
    // Move x and Move y is the urge to move in the X and Y direction.
    let move_x = action_levels[OutputNeurons.MOVE_X];
    let move_y = action_levels[OutputNeurons.MOVE_Y];

    move_x += action_levels[OutputNeurons.MOVE_EAST];
    move_x -= action_levels[OutputNeurons.MOVE_WEST];
    move_y += action_levels[OutputNeurons.MOVE_NORTH];
    move_y -= action_levels[OutputNeurons.MOVE_SOUTH];

    // Hyperbolic tangent function produces an output between -1.0 and 1.0.
    move_x = Math.tanh(move_x);
    move_y = Math.tanh(move_y);

    const prob_x = +prob2bool(Math.abs(move_x));
    const prob_y = +prob2bool(Math.abs(move_y));

    const signum_x = move_x < 0.0 ? -1 : 1;
    const signum_y = move_y < 0.0 ? -1 : 1;

    const offset = make_vector(prob_x * signum_x, prob_y * signum_y);
    return offset;
  }
}
