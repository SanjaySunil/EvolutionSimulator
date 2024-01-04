import Directions from "../constants/Directions";
import { Environment } from "../environment";
import { Coordinate, make_vector } from "../math/Coordinate";
import get_random_vector from "../utils/get_random_vector";
import prob2bool from "../utils/prob2bool";
import Brain from "./Brain";
import Gene from "./Gene";
import Genome from "./Genome";
import { ActionNeurons } from "./Neurons";
import { SimulationConfig } from "../config";

export default class Organism {
  private _coordinate: Coordinate;
  public genome: Genome;
  public brain: Brain;

  public fitness: number | null;
  public alive: boolean;
  public age: number;
  public direction: Coordinate;
  public environment: Environment;

  public config: typeof SimulationConfig;

  constructor(coordinate, genome: Gene[], environment) {
    this.environment = environment;
    this._coordinate = coordinate;
    /** If a genome has been given, use this genome, else create a new random genome. */
    this.genome = new Genome(this, genome);
    this.config = environment.config;
    this.brain = new Brain(
      this,
      this.config.NUMBER_OF_SENSORS,
      this.config.NUMBER_OF_NEURONS,
      this.config.NUMBER_OF_ACTIONS
    );
    this.direction = Directions.NORTH;
    this.fitness = null;
    this.alive = true;
    this.age = 0;
  }

  public set coordinate(coordinate: Coordinate) {
    this.environment.grid.clear_cell_state(this.coordinate);
    this.environment.grid.set_cell_owner(coordinate, this);
    this._coordinate = coordinate;
  }

  public get coordinate(): Coordinate {
    return this._coordinate;
  }

  public mate(partner: Organism): Organism {
    const child_genome: Gene[] = new Array(this.genome.data.length);

    for (let i = 0; i < this.genome.data.length; i++) {
      const organism_gene: Gene = this.genome.data[i];
      const partner_gene: Gene = partner.genome.data[i];
      const random_probability: number = Math.random();

      const selection_probability = ((100 - this.config.MUTATION_PERCENT) / 2) / 100;
      if (random_probability < selection_probability) {
        child_genome[i] = organism_gene;
      } else if (random_probability < selection_probability * 2) {
        child_genome[i] = partner_gene;
      } else {
        child_genome[i] = new Gene(this.config.NUMBER_OF_NEURONS);
      }
    }

    let random_coord = get_random_vector(0, 0, this.config.GRID_SIZE - 1, this.config.GRID_SIZE - 1);

    while (!this.environment.grid.is_cell_empty(random_coord)) {
      random_coord = get_random_vector(0, 0, this.config.GRID_SIZE - 1, this.config.GRID_SIZE - 1);
    }

    return new Organism(random_coord, child_genome, this.environment);
  }

  public action(): Coordinate {
    /** Perform NN Feed Forward. */
    const action_levels = this.brain.feed_forward();
    /** Compute function with action levels. */
    return this.compute_action(action_levels);
  }

  public compute_action(action_levels: number[]): Coordinate {
    /** Move x and Move y is the urge to move in the X and Y direction. */
    let move_x = action_levels[ActionNeurons.MOVE_X];
    let move_y = action_levels[ActionNeurons.MOVE_Y];

    move_x += action_levels[ActionNeurons.MOVE_EAST];
    move_x -= action_levels[ActionNeurons.MOVE_WEST];
    move_y += action_levels[ActionNeurons.MOVE_NORTH];
    move_y -= action_levels[ActionNeurons.MOVE_SOUTH];

    /** Hyperbolic tangent function produces an output between -1.0 and 1.0. */
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
