import ThemeConfig from "../config/theme.config";
import { CellStates } from "../constants/CellStates";
import RendererController from "../controllers/renderer.controller";
import Vector from "../math/vector.math";
import Organism from "./Organism";
import { SimulationConfig } from "../config/simulation.config";

/** An individual grid cell. */
export class GridCell {
  public coord: Vector;
  public state: number;
  public colour: string | undefined;
  public owner: undefined | Organism;
  public is_highlighted: boolean;

  /** Grid Cell constructor. */
  constructor(x: number, y: number, state = CellStates.EMPTY) {
    this.coord = new Vector(x, y);
    this.owner = undefined;
    this.state = state;
    this.colour = undefined;
    this.is_highlighted = false;
  }

  /** Returns the colour of a grid cell using theme config. */
  public get_colour(): string {
    if (this.is_highlighted) return ThemeConfig["HIGHLIGHTED_CELL"];
    else if (this.colour) return this.colour;
    else return ThemeConfig[this.state];
  }
}

/** Grid used to simulate the environment. */
export default class Grid {
  public grid: GridCell[][];
  public renderer: RendererController;
  public grid_size: number;
  public cells_occupied: number;
  public number_of_cells: number;

  /** Builds a new grid. */
  constructor(grid_size: number, renderer: RendererController) {
    this.grid = [];
    this.grid_size = grid_size;
    this.renderer = renderer;
    this.cells_occupied = 0;
    this.number_of_cells = this.grid_size * this.grid_size;
  }

  /** Initializes an empty grid with empty cells. */
  public initialize(): void {
    for (let x = 0; x < this.grid_size; x++) {
      const column: GridCell[] = [];
      for (let y = 0; y < this.grid_size; y++) {
        const cell = new GridCell(x, y);
        // Radioactive border test (medium)
        // if (y >= (SimulationConfig.GRID_SIZE / 2) - 15 && x >= (SimulationConfig.GRID_SIZE / 2) - 15 && x <= (SimulationConfig.GRID_SIZE / 2) + 15 && y <= (SimulationConfig.GRID_SIZE / 2) + 15) {
        //   cell.state = CellStates.RADIOACTIVE;
        //   this.renderer.to_fill.add(cell);
        // }
        // // Stripe radioactive test (hard)
        if (y % 50 == 0 || x % 50 == 0) {
          cell.state = CellStates.RADIOACTIVE;
          this.renderer.to_fill.add(cell);
        }
        column.push(cell);
      }
      this.grid.push(column);
    }
  }

  /** Returns whether the grid is full or not. */
  public is_full(): boolean {
    return this.cells_occupied == this.number_of_cells;
  }

  /** Checks if specified cell is valid. */
  public is_valid_cell_at(coord: Vector): boolean {
    return coord.x >= 0 && coord.y >= 0 && coord.x < this.grid_size && coord.y < this.grid_size;
  }

  /** Checks if specified cell is occupied. */
  public is_cell_occupied(coord: Vector): boolean {
    return this.grid[coord.x][coord.y].state != CellStates.EMPTY && this.grid[coord.x][coord.y].state != CellStates.FOOD;
  }

  /** Returns cell at specified coordinate. */
  public get_cell_at(coord: Vector): GridCell {
    if (this.is_valid_cell_at(coord)) {
      return this.grid[coord.x][coord.y];
    } else {
      throw Error(`Not a valid cell. ${coord.x} ${coord.y}`);
    }
  }

  /** Clear cell at specified coordinates. */
  public clear_cell_at(coord: Vector): void {
    if (this.is_valid_cell_at(coord)) {
      if (this.grid[coord.x][coord.y].state != CellStates.EMPTY) this.cells_occupied--;
      this.grid[coord.x][coord.y].owner = undefined;
      this.grid[coord.x][coord.y].state = CellStates.EMPTY;
      this.grid[coord.x][coord.y].colour = undefined;
      this.renderer.to_clear.add(this.get_cell_at(coord));
    }
  }

  /** Sets owner and state at specified coordinates. */
  public set_cell_at(coord: Vector, state: number, owner: Organism | null = null): void {
    if (this.is_valid_cell_at(coord)) {
      if ([CellStates.RADIOACTIVE, CellStates.WALL].includes(this.grid[coord.x][coord.y].state) && state != CellStates.EMPTY) return;
      this.grid[coord.x][coord.y].state = state;
      if (owner) this.grid[coord.x][coord.y].owner = owner;
      else this.grid[coord.x][coord.y].owner = undefined;
      this.renderer.to_fill.add(this.grid[coord.x][coord.y]);
    }
  }

  /** Highlights cell at specified coordinate. */
  public set_cell_highlighted_at(coord: Vector, state: boolean): void {
    if (this.is_valid_cell_at(coord)) {
      this.grid[coord.x][coord.y].is_highlighted = state;
      this.renderer.to_fill.add(this.get_cell_at(coord));
    }
  }
}
