import Organism from "./Organism.model";
import Vector from "../NEA/src/math/Vector";
import SimulationConfig from "../NEA/src/config/simulation.config";

// Empty Organism Cell
export abstract class Cell {
  public type: string;
  public belongs_to: Organism;
  public grid_coord: Vector;
  public anatomy_coord: Vector;
  public rel_anatomy_coord: Vector;

  // Constructor
  constructor(self: Organism, anatomy_coord: Vector) {
    this.type = "EMPTY_CELL";
    this.anatomy_coord = anatomy_coord;
    this.rel_anatomy_coord = this.set_rel_anatomy_coord();
    this.grid_coord = new Vector().copy(self.grid_coord).add(this.rel_anatomy_coord);
    this.belongs_to = self;

    // console.log(this.rel_anatomy_coord.x, this.rel_anatomy_coord.y, this.grid_coord.x, this.grid_coord.y, this.anatomy_coord.x, this.anatomy_coord.y);
  }

  // Create the anatomy coordinates relative to the center.
  private set_rel_anatomy_coord(): Vector {
    // Relative Coordinates from center = anatomy_coord - center_coord
    const organism_center = (SimulationConfig.ANATOMY_SIZE - 1) / 2;
    const organism_center_v = new Vector(organism_center, organism_center);
    const rel_anatomy_coord = new Vector().copy(this.anatomy_coord).subtract(organism_center_v);
    return rel_anatomy_coord;
  }
  public abstract function(): any;
}

// Core Cell - switches on brain
export class CoreCell extends Cell {
  constructor(self: Organism, anatomy_coord: Vector) {
    super(self, anatomy_coord);
    this.type = "CORE_CELL";
  }

  public override function(): void {}
}

// Mouth Cell - provides ability to eat
export class MouthCell extends Cell {
  constructor(self: Organism, anatomy_coord: Vector) {
    super(self, anatomy_coord);
    this.type = "MOUTH_CELL";
  }

  public override function(): void {}
}

// Eye Cell - provides the ability to see in a direction
export class EyeCell extends Cell {
  constructor(self: Organism, anatomy_coord: Vector) {
    super(self, anatomy_coord);
    this.type = "EYE_CELL";
  }

  public override function(): void {}
}

// Muscle cell - provides ability for rotation
export class MuscleCell extends Cell {
  constructor(self: Organism, anatomy_coord: Vector) {
    super(self, anatomy_coord);
    this.type = "MUSCLE_CELL";
  }

  public override function(): void {}
}

// Combat cell - provides ability to fight
export class CombatCell extends Cell {
  constructor(self: Organism, anatomy_coord: Vector) {
    super(self, anatomy_coord);
    this.type = "COMBAT_CELL";
  }

  public override function(): void {}
}

// Defense cell - provides ability for defense
export class DefenseCell extends Cell {
  constructor(self: Organism, anatomy_coord: Vector) {
    super(self, anatomy_coord);
    this.type = "DEFENSE_CELL";
  }

  public override function(): void {}
}

// Producer cell - provides ability to produce food
export class ProducerCell extends Cell {
  constructor(self: Organism, anatomy_coord: Vector) {
    super(self, anatomy_coord);
    this.type = "PRODUCER_CELL";
  }

  public override function(): void {}
}
