import SimulationConfig from "../NEA/src/config/simulation.config";
import { BrainStates } from "../NEA/src/constants/BrainStates";
import { Directions } from "../NEA/src/constants/Directions";
import World from "../NEA/src/models/environment/World.model";
import Anatomy from "./Anatomy.model";
import Brain from "../NEA/src/models/organism/Brain/Brain.model";
import { Cell } from "./Cell.model";
import Genome from "./Genome.model";
import Vector from "../NEA/src/math/Vector";

// Class for a single Organism.
export default class Organism {
  public grid_coord: Vector;

  public brain: Brain;
  public genome: Genome;
  public anatomy: Anatomy;

  public world: World;
  public age: number;
  public max_age: number;
  public energy: number;
  public max_energy: number;
  public step_count: number;
  public direction: number[];
  public rotation: number;
  public next_organism: Organism | null;

  // Constructor
  constructor(x: number, y: number, world: World, genome: any = null) {
    // Accessors
    this.world = world;

    // Coordinates
    this.grid_coord = new Vector(x, y);

    // Organism Components
    this.anatomy = new Anatomy(this, genome);
    this.brain = new Brain(this);
    this.genome = genome === null ? new Genome() : genome;

    // Organism Variables
    this.max_age = this.anatomy.cells.length * SimulationConfig.MAX_AGE;
    this.max_energy = this.anatomy.cells.length * SimulationConfig.MAX_ENERGY;
    this.age = 0;
    this.energy = 0.5 * this.max_energy;
    this.direction = Directions.IDLE;
    this.rotation = 0;
    this.step_count = 0;
    this.birth();

    // Next Organism for Update
    this.next_organism = null;
  }

  // Returns if the organism is alive or not.
  public is_alive(): boolean {
    // Condition for alive - Energy > 0, Age < Max Age
    return this.energy > 0 && this.age < this.max_age;
  }

  // Birth of organism.
  private birth(): void {
    console.log(`
    Organism is born:
    Max Energy: ${this.max_energy}
    Max Age: ${this.max_age}
    `);
  }

  // Kills this organism.
  public kill(): void {
    // Convert's every single one of the anatomy cells to a food cell.
    for (const cell of this.anatomy.cells) {
      this.world.grid.clear_cell_at(cell.grid_coord);
      this.world.grid.set_cell_state_at(cell.grid_coord, "FOOD_CELL");
      // this.world.renderer.fill_cell(this.world.grid.get_cell_at(cell.grid_coord));
      this.world.renderer.to_fill.push(this.world.grid.get_cell_at(cell.grid_coord));
    }

    // console.log(`Organism died with ${this.energy} energy, at the age of ${this.age}, with a total step count of ${this.step_count}.`);
  }

  // Checks if the cell can move to the location.
  private cell_can_move(cell: Cell): boolean {
    const new_point = new Vector(cell.grid_coord.x + this.direction[0], cell.grid_coord.y + this.direction[1]);
    if (this.world.grid.is_valid_cell_at(new_point)) {
      const cell_at_new_point = this.world.grid.get_cell_at(new_point);
      if (cell_at_new_point.state == "FOOD_CELL" && cell.type == "MOUTH_CELL") {
        return true;
      } else {
        const isEmpty = cell_at_new_point.state == "EMPTY_CELL" || cell_at_new_point.owner == cell.belongs_to;
        return isEmpty;
      }
    } else {
      return false;
    }
  }

  // Checks if an individual cell can rotate.
  private cell_can_rotate(cell: Cell): boolean {
    // Make a new vector.
    const new_point = new Vector();
    // Copy the coordinates of the current cell coordinates.
    new_point.copy(cell.grid_coord);
    // Rotate point around origin of the organism.
    new_point.rotate_around(this.grid_coord.x, this.grid_coord.y, this.rotation);
    // Check if the new rotated point is a valid point.
    if (this.world.grid.is_valid_cell_at(new_point)) {
      // Reference the new rotated point on the grid.
      const grid_cell = this.world.grid.get_cell_at(new_point);
      // Return whether the point is empty or not.
      const isEmpty = grid_cell.state == "EMPTY_CELL" || grid_cell.owner == cell.belongs_to;
      return isEmpty;
    } else {
      return false;
    }
  }

  // Check if an organism can move.
  private can_move(): boolean {
    for (const cell of this.anatomy.cells) {
      if (this.cell_can_move(cell) == false) {
        return false;
      }
    }
    return true;
  }

  // Determines whether an organism can rotate or not.
  private can_rotate(): boolean {
    for (const cell of this.anatomy.cells) {
      if (this.cell_can_rotate(cell) == false) {
        return false;
      }
    }
    return true;
  }

  // Add energy to the organisms' energy store.
  public add_energy(energy: number): void {
    if (this.energy + energy <= this.max_energy) {
      this.energy += energy;
    } else {
      console.log("cannot add energy, organism has reached max energy.");
    }
  }

  // Subtract energy to the organisms' energy store.
  public subtract_energy(energy: number): void {
    if (this.energy - energy <= 0) {
      this.kill();
    } else {
      this.energy -= energy;
    }
  }

  // Move an organism using a direction vector.
  public organism_move(): void {
    const direction_vector = new Vector(this.direction[0], this.direction[1]);
    for (const cell of this.anatomy.cells) {
      this.world.grid.clear_cell_at(cell.grid_coord);
      this.world.grid.set_cell_state_at(cell.grid_coord, "EMPTY_CELL");
      // this.world.renderer.clear_cell(this.world.grid.get_cell_at(cell.grid_coord));
      this.world.renderer.to_clear.push(this.world.grid.get_cell_at(cell.grid_coord));
    }
    for (const cell of this.anatomy.cells) {
      cell.grid_coord.add(direction_vector);
      this.world.grid.set_cell_owner_at(cell.grid_coord, this);
      this.world.grid.set_cell_state_at(cell.grid_coord, cell.type);
      // this.world.renderer.fill_cell(this.world.grid.get_cell_at(cell.grid_coord));
      this.world.renderer.to_fill.push(this.world.grid.get_cell_at(cell.grid_coord));
    }
    this.grid_coord.add(direction_vector);
    this.subtract_energy(1);
    this.step_count += 1;
  }

  // Rotate an organism using a rotation angle.
  public organism_rotate(): void {
    for (const cell of this.anatomy.cells) {
      this.world.grid.clear_cell_at(cell.grid_coord);
      this.world.grid.set_cell_state_at(cell.grid_coord, "EMPTY_CELL");
      this.world.renderer.clear_cell(this.world.grid.get_cell_at(cell.grid_coord));
    }
    for (const cell of this.anatomy.cells) {
      cell.grid_coord.rotate_around(this.grid_coord.x, this.grid_coord.y, this.rotation);
      this.world.grid.set_cell_owner_at(cell.grid_coord, this);
      this.world.grid.set_cell_state_at(cell.grid_coord, cell.type);
      this.world.renderer.fill_cell(this.world.grid.get_cell_at(cell.grid_coord));
    }
    this.subtract_energy(1);
  }

  // Sets a random direction. (e.g: N)
  public set_random_direction(): void {
    const possible_directions = Object.keys(Directions);
    const random_index = Math.floor(Math.random() * possible_directions.length);
    this.direction = Directions[Object.keys(Directions)[random_index]];
  }

  // Sets a random rotation.
  public set_random_rotation(): void {
    this.rotation = [90, -90][Math.floor(Math.random() * 2)];
  }

  // Let the organism perform its actions here.
  public function_not_smart(): void {
    this.brain.make_decision();
    if (this.brain.state == BrainStates[0]) {
      // Organism has decided to do nothing
    } else if (this.brain.state == BrainStates[5] || this.brain.state == BrainStates[1]) {
      // Choose a random direction for roaming.
      this.direction = this.brain.decide_direction();
      if (this.can_move()) this.organism_move();
      else {
        // Organism couldn't move, so attempting to rotate.
        this.set_random_rotation();
        if (this.can_rotate()) this.organism_rotate();
        else console.log("couldn't move or rotate");
      }
    }
    // Increment age after each function call.
    this.age += 1;
    console.log(this.energy);
  }

  /*
  This implementation of the Organism's function is much more starter and utilises a neural network to decide the organism's movement and actions.
  */
  public function(): void {
    this.age += 1;
    this.function_not_smart();
  }
}
