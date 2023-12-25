import { SimulationConfig } from "../config/simulation.config";
import { ActionNeurons } from "../constants/ActionNeurons";
import { CellStates } from "../constants/CellStates";
import { Directions } from "../constants/Directions";
import World from "../core/World";
import Vector from "../math/vector.math";
import get_random_number from "../utils/get_random_number";
import { Brain } from "./Brain";
import { Genome } from "./Genome";

/** Structure that represents one organism. */
export default class Organism {
  /** World accessor. */
  public world: World;
  /** Genetic information of the organism. */
  public genome: Genome;
  /** The decision maker of the organism. */
  public brain: Brain;
  /** Coordinates of Organism on the grid map. */
  public coord: Vector;
  /** Age of Organism */
  public age: number;
  public max_age: number;
  public energy: number;
  public max_energy: number;
  public step_count: number;
  public energy_consumed: number;
  public alive: boolean;
  public drop_food_on_death: boolean;
  public direction: Vector;
  public id: number;
  public is_in_reproduction_queue: boolean;

  /** Builds a new organism. */
  constructor(x: number, y: number, world: World, parent: Organism | null = null, genome: Genome | null = null) {
    this.world = world;
    if (genome) {
      this.genome = new Genome(this, genome.data);
    } else {
      this.genome = new Genome(this, parent?.genome.data ? parent.genome.data : null);
    }
    this.brain = new Brain(this, this.genome);
    this.coord = new Vector(x, y);
    this.max_age = SimulationConfig.MAX_AGE;
    this.max_energy = SimulationConfig.MAX_ENERGY;
    this.age = 0;
    this.energy = SimulationConfig.ENERGY_AT_BIRTH;
    this.step_count = 0;
    this.energy_consumed = 0;
    this.alive = true;
    this.drop_food_on_death = true;
    this.direction = Directions.NORTH;
    this.world.grid.set_cell_at(this.coord, CellStates.ORGANISM, this);
    this.id = get_random_number(0, 9999);
    this.is_in_reproduction_queue = false;
  }

  /** Checks whether an organism is alive or not. */
  public is_alive(): boolean {
    /** Condition for alive - energy > 0, age < max age. */
    const is_alive = this.energy > 0 && this.age < this.max_age && this.alive;
    /** Goal Testing */
    /** Go to left test. */
    /** Go to center test */
    // if (this.coord.x < SimulationConfig.GRID_SIZE / 2) {
    //   this.energy -= SimulationConfig.GRID_SIZE / 2 * 0.75 - this.coord.x;
    // } else {
    //   this.energy -= this.coord.x * 0.75 - SimulationConfig.GRID_SIZE / 2;
    // }
    if (!is_alive) this.kill();
    return is_alive;
  }

  /** Probability to boolean. */
  public prob2bool(factor: number): boolean {
    return Math.random() < factor;
  }

  /** Subtract energy from the organism's energy store safely. */
  public subtract_energy(energy: number): void {
    if (this.energy - energy <= 0) this.kill();
    else this.energy -= energy;
  }

  /** Add energy to the organism's energy store safely. */
  public add_energy(energy: number): void {
    if (this.energy + energy <= this.max_energy) {
      this.energy += energy;
      this.energy_consumed += energy;
    }
  }

  /** Kills this organism. */
  public kill(): void {
    if (this.alive) {
      this.alive = false;
      if (this.drop_food_on_death) this.world.grid.set_cell_at(this.coord, CellStates.FOOD);
    }
  }

  /** Organism update function. */
  public function(): void {
    if (this.is_alive()) {
      /** Increment age by 1. */
      this.age++;
      /** Reproduce if it can. */
      this.organism_reproduce();
      /** Perform NN Feed Forward. */
      const action_levels = this.brain.feed_forward();
      /** Compute function with action levels. */
      this.compute_action_levels(action_levels);
    }
  }

  /** Checks whether an organism can move. */
  private can_move(offset: Vector): boolean {
    const new_point = new Vector().copy(this.coord).add(offset);
    if (this.world.grid.is_valid_cell_at(new_point)) {
      const cell = this.world.grid.get_cell_at(new_point);
      if (cell.state == CellStates.FOOD) {
        this.add_energy(SimulationConfig.ENERGY_FROM_FOOD);
        return true;
      } else if (cell.state == CellStates.RADIOACTIVE) {
        this.kill();
        return false;
      } else if (cell.state == CellStates.EMPTY || new_point == this.coord) return true;
    }
    return false;
  }

  /** Move an organism using a direction vector. */
  public organism_move(vector: Vector): void {
    this.direction = vector;

    /** Check if vector offset is diagonal to double. */
    if (vector.x == vector.y) this.subtract_energy(SimulationConfig.COST_TO_MOVE * 2);
    else this.subtract_energy(SimulationConfig.COST_TO_MOVE);

    if (this.can_move(vector)) {
      if (!vector.equal(Directions.IDLE)) {
        /** Clear cell content at old coordinate. */
        this.world.grid.clear_cell_at(this.coord);
        /** Update cell at new coordinate. */
        this.coord.add(vector);
        this.world.grid.set_cell_at(this.coord, CellStates.ORGANISM, this);
        this.step_count += 1;
      } else {
        /** Update cell at new coordinate. */
        // this.world.grid.set_cell_at(this.coord, this);
      }
    }
  }

  /** Check if organism can reproduce, if it can, then clone organism. */
  public organism_reproduce(): void {
    if (SimulationConfig.SEXUAL_REPRODUCTION && this.energy >= SimulationConfig.MIN_ENERGY_TO_REPROD) {
      console.log("sexual reproduction enabled");
      if (!this.is_in_reproduction_queue) this.world.reproduction_queue.push(this);
      this.is_in_reproduction_queue = true;
      this.subtract_energy(SimulationConfig.REPRODUCTION_COST);
    } else {
      if (this.energy >= SimulationConfig.MIN_ENERGY_TO_REPROD) {
        const org = new Organism(this.coord.x, this.coord.y, this.world, this);
        /** Push to world. */
        this.world.add_organism(org);
        this.subtract_energy(SimulationConfig.REPRODUCTION_COST);
      }
    }
  }

  /** Execute actions */
  public compute_action_levels(action_levels: number[]): void {
    /** Define X and Y components by reading current action levels. */
    /** Move x and Move y is the urge to move in the X and Y direction. */
    let move_x = action_levels[ActionNeurons.MOVE_X];
    let move_y = action_levels[ActionNeurons.MOVE_Y];

    // move_x += action_levels[ActionNeurons.MOVE_EAST];
    // move_x -= action_levels[ActionNeurons.MOVE_WEST];
    // move_y += action_levels[ActionNeurons.MOVE_NORTH];
    // move_y -= action_levels[ActionNeurons.MOVE_SOUTH];

    /** Hyperbolic tangent function produces an output between -1.0 and 1.0. */
    move_x = Math.tanh(move_x);
    move_y = Math.tanh(move_y);

    const prob_x = +this.prob2bool(Math.abs(move_x));
    const prob_y = +this.prob2bool(Math.abs(move_y));

    const signum_x = move_x < 0.0 ? -1 : 1;
    const signum_y = move_y < 0.0 ? -1 : 1;

    const offset = new Vector(prob_x * signum_x, prob_y * signum_y);
    this.organism_move(offset);

    /** Hyperbolic tangent function produces and output between -1.0 and 1.0 */
    // if (move_x > move_y) {
    //   /** Urge to move X is greater. */
    //   move_x = Math.tanh(move_x);
    //   // The probability of movement along each axis is the absolute value
    //   /** Probability of movement  */
    //   const prob_x = +this.prob2bool(Math.abs(move_x));
    //   const signum_x = move_x < 0.0 ? -1 : 1;
    //   const offset = new Vector(prob_x * signum_x, 0);
    //   this.organism_move(offset);
    // } else if (move_y > move_x) {
    //   /** Urge to move Y is greater. */
    //   move_y = Math.tanh(move_y);
    //   const prob_y = +this.prob2bool(Math.abs(move_y));
    //   const signum_y = move_y < 0.0 ? -1 : 1;
    //   const offset = new Vector(0, prob_y * signum_y);
    //   this.organism_move(offset);
    // }
  }
}
