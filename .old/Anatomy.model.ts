import { GeneticCode } from "../NEA/src/constants/GeneticCode";
import type { Cell } from "./Cell.model";
import { CoreCell, MouthCell, EyeCell, MuscleCell, DefenseCell, CombatCell, ProducerCell } from "./Cell.model";
import Genome from "./Genome.model";
import Organism from "./Organism.model";
import SimulationConfig from "../NEA/src/config/simulation.config";
import Vector from "../NEA/src/math/Vector";
// The structure of an organism.
export default class Anatomy {
  public self: Organism;
  public size: number;
  public structure: any[];
  public cells: Cell[];
  public center: Vector;

  // Constructor
  constructor(self: Organism, genome: Genome) {
    this.self = self;
    this.size = SimulationConfig.ANATOMY_SIZE;
    // Full Structure (including empty cells)
    this.structure = [];
    // All Physical Cells (excluding empty cells)
    this.cells = [];
    this.center = new Vector((this.size - 1) / 2, (this.size - 1) / 2);
    for (let i = 0; i < this.size; i++) {
      const row = new Array(this.size).fill("EMPTY_CELL");
      this.structure.push(row);
    }

    for (let i = 0; i < genome.cs1_length; i++) {
      const gene = genome.data[0][i];
      // fix x coord and y coord
      const anatomy_coord = new Vector(Math.floor(i / this.size), i % this.size);
      const cell = GeneticCode[gene];

      if (cell != "EMPTY_CELL") {
        // console.log(cell, center.x, center.y);
        // this.add_cell(cell, xy.x, xy.y, center.x, center.y, structure_x, structure_x);
        this.add_cell(cell, anatomy_coord);
      }
    }
  }

  // Checks if a cell has a function.
  public is_empty_cell(cell: string): boolean {
    return cell !== "EMPTY_CELL";
  }

  // Create an organism cell.
  public create_organism_cell(cell: string, anatomy_coord: Vector): Cell {
    if (cell == "CORE_CELL") {
      return new CoreCell(this.self, anatomy_coord);
    } else if (cell == "MOUTH_CELL") {
      return new MouthCell(this.self, anatomy_coord);
    } else if (cell == "EYE_CELL") {
      return new EyeCell(this.self, anatomy_coord);
    } else if (cell == "MUSCLE_CELL") {
      return new MuscleCell(this.self, anatomy_coord);
    } else if (cell == "DEFENSE_CELL") {
      return new DefenseCell(this.self, anatomy_coord);
    } else if (cell == "COMBAT_CELL") {
      return new CombatCell(this.self, anatomy_coord);
    } else if (cell == "PRODUCER_CELL") {
      return new ProducerCell(this.self, anatomy_coord);
    } else {
      throw Error(`Cannot create this cell: ${cell}`);
    }
  }

  // // Origin is at (this.width / 2, this.height / 2)
  // public add_cell_from_origin(x: number, y: number, cell: string): void {
  //   if (this.is_not_empty_cell(cell)) {
  //     const organism_cell = this.create_organism_cell(x, y, cell);
  //     const cellIsEmpty = this.structure[this.center + x][this.center + y] === null;
  //     if (cellIsEmpty) {
  //       this.structure[this.center + x][this.center + y] = organism_cell;
  //       this.cells.push(organism_cell);
  //     } else {
  //       console.log("could not add cell to organism's anatomy");
  //     }
  //   }
  // }

  // add cell to structure using row and col
  public add_cell(cell: string, anatomy_coord: Vector): void {
    if (this.is_empty_cell(cell)) {
      const organism_cell = this.create_organism_cell(cell, anatomy_coord);
      this.structure[anatomy_coord.x][anatomy_coord.y] = organism_cell;
      this.cells.push(organism_cell);
      // // Update max energy and age when a change is made to anatomy.
      // this.self.update_max_age();
      // this.self.update_max_energy();
    }
  }

  // Remove a cell from the anatomy
  // public remove_cell(x: number, y: number): void {
  //   const cell_to_remove = this.structure[this.center + x][this.center + y];
  //   this.structure[this.center + x][this.center + y] = null;
  //   for (let cell = 0; cell < this.cells.length; cell++) {
  //     if (this.cells[cell] === cell_to_remove) {
  //       this.cells.splice(cell, 1);
  //     }
  //   }
  // }
}
