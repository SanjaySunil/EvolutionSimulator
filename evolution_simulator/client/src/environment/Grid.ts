import Renderer from "../controllers/renderer.controller";
import Organism from "../models/Organism";
import { Coordinate } from "../models/types/Coordinate";
import PerlinNoise from "../utils/PerlinNoise";
import get_random_vector from "../utils/get_random_vector";

// Various Cell States that a GridCell can take.
export const CellStates = {
  EMPTY: 0,
  ORGANISM: 1,
  WALL: 2,
  FOOD: 3,
  RADIOACTIVE: 4,
};

// Create an array of the keys of the CellStates.
export const AllCellStates = Object.keys(CellStates);

// GridCell class.
export class GridCell {
  public coordinate: Coordinate;
  private _owner: Organism | null;
  private _state: number;
  public is_selected: boolean;
  public is_highlighted: boolean;

  // Builds a new GridCell.
  constructor(x: number, y: number, state = CellStates.EMPTY) {
    this.coordinate = { x, y };
    this._owner = null;
    this._state = state;
    this.is_selected = false;
    this.is_highlighted = false;
  }

  // Clears the GridCell.
  public clear(): void {
    this._owner = null;
    this._state = CellStates.EMPTY;
  }

  // Returns owner of GridCell.
  public get owner(): Organism | null {
    return this._owner;
  }

  // Sets owner to specified Organism, and changes state of GridCell.
  public set owner(owner: Organism | null) {
    if (owner) {
      this._owner = owner;
      this._state = CellStates.ORGANISM;
    } else {
      this._owner = null;
    }
  }

  // Returns state of GridCell.
  public get state(): number {
    return this._state;
  }

  // Sets the state of GridCell.
  public set state(state: number) {
    this._state = state;
  }
}

// Grid Class.
export class Grid {
  private _data: GridCell[][];
  public grid_size: number;
  public renderer: Renderer;
  public occupied: number;

  // Builds a new Grid.
  constructor(grid_size: number, renderer: Renderer) {
    this._data = new Array(grid_size);
    this.renderer = renderer;
    this.grid_size = grid_size;
    this.occupied = 0;
    this.init();
  }

  // Initializes the grid.
  public init(): void {
    const perlin = new PerlinNoise();
    // const grid = this.generateMaze(this.grid_size, this.grid_size);
    for (let x = 0; x < this.grid_size; x++) {
      const column: GridCell[] = new Array(this.grid_size);
      for (let y = 0; y < this.grid_size; y++) {
        const cell = new GridCell(x, y);
        // cell.state = grid[x][y] == true ? CellStates.WALL : CellStates.EMPTY;
        // this.create_barrier(cell);
        // this.create_radioactive_barrier(cell);
        // this.create_perlin_barrier(cell, perlin);
        // this.renderer.to_clear.add(cell);
        column[y] = cell;
      }
      this._data[x] = column;
    }
  }

  // Clears the grid.
  public clear_grid(): void {
    this._data = [];
    this.init();
  }

  // Checks if specified cell is valid.
  public is_valid_cell_at(coordinate: Coordinate): boolean {
    return coordinate.x >= 0 && coordinate.y >= 0 && coordinate.x < this.grid_size && coordinate.y < this.grid_size;
  }

  // Checks if specified cell is empty.
  public is_cell_empty(coordinate: Coordinate): boolean {
    if (this.is_valid_cell_at(coordinate)) {
      return this._data[coordinate.x][coordinate.y].state == CellStates.EMPTY;
    } else {
      throw Error(`Not a valid cell. ${coordinate.x} ${coordinate.y}`);
    }
  }

  // Returns cell at specified Coordinateinate.
  public get_cell_at(coordinate: Coordinate): GridCell {
    if (this.is_valid_cell_at(coordinate)) {
      return this._data[coordinate.x][coordinate.y];
    } else {
      throw Error(`Not a valid cell. ${coordinate.x} ${coordinate.y}`);
    }
  }

  // Sets the owner of a cell.
  public set_cell_owner(coordinate: Coordinate, owner: Organism): void {
    if (this.is_valid_cell_at(coordinate)) {
      const cell = this.get_cell_at(coordinate);
      cell.owner = owner;
      this.renderer.to_fill.add(cell);
      this.occupied += 1;
    }
  }

  // Sets the state of a cell.
  public set_cell_state(coordinate: Coordinate, state: number): void {
    if (this.is_valid_cell_at(coordinate)) {
      const cell = this.get_cell_at(coordinate);
      cell.state = state;
      cell.owner = null;
      this.renderer.to_fill.add(cell);
      this.occupied += 1;
    }
  }

  // Sets the selected state of a cell.
  public set_cell_selected(coordinate: Coordinate, selected: boolean): void {
    if (this.is_valid_cell_at(coordinate)) {
      const cell = this.get_cell_at(coordinate);
      cell.is_selected = selected;
      this.renderer.to_fill.add(cell);
    }
  }

  // Sets the highlighted state of a cell.
  public set_cell_highlighted(coordinate: Coordinate, highlighted: boolean): void {
    if (this.is_valid_cell_at(coordinate)) {
      const cell = this.get_cell_at(coordinate);
      cell.is_highlighted = highlighted;
      this.renderer.to_fill.add(cell);
    }
  }

  // Clears the state of a cell.
  public clear_cell_state(coordinate: Coordinate): void {
    if (this.is_valid_cell_at(coordinate)) {
      const cell = this.get_cell_at(coordinate);
      cell.state = CellStates.EMPTY;
      cell.owner = null;
      this.renderer.to_clear.add(cell);
      this.occupied -= 1;
    }
  }

  // Creates walls using Perlin Noise.
  public create_perlin_barrier(cell: GridCell, perlin): void {
    const WALL_THRESHOLD = 0.85; // 0.85
    // 0.1
    const value = perlin.noise(cell.coordinate.x * 0.1, cell.coordinate.y * 0.1); // Adjust the scale as needed
    cell.state = value > WALL_THRESHOLD ? CellStates.WALL : CellStates.EMPTY;
    this.renderer.to_fill.add(cell);
    this.occupied += 1;
  }

  // Creates a radioactive barrier depending on specified conditions.
  public create_radioactive_barrier(cell: GridCell): void {
    const center = this.grid_size / 2;
    const size = 7.5;
    if (
      cell.coordinate.x >= center - size &&
      cell.coordinate.x <= center + size &&
      cell.coordinate.y >= center - size &&
      cell.coordinate.y <= center + size
    )
      cell.state = CellStates.RADIOACTIVE;
    this.renderer.to_fill.add(cell);
    this.occupied += 1;
  }

  // Creates a barrier depending on specified conditions.
  public create_barrier(cell: GridCell): void {
    const center = this.grid_size / 2;
    const size = 7.5;
    if (
      cell.coordinate.x >= center - size &&
      cell.coordinate.x <= center + size &&
      cell.coordinate.y >= center - size &&
      cell.coordinate.y <= center + size
    )
      cell.state = CellStates.WALL;
    this.renderer.to_fill.add(cell);
    this.occupied += 1;
  }

  // Fetches an random empty cell from the grid.
  public fetch_empty_cell(): Coordinate {
    if (this.occupied == this.grid_size ** 2) {
      alert("No empty cells left!");
      throw Error("No empty cells left!");
    }
    let random_coord = get_random_vector(0, 0, this.grid_size - 1, this.grid_size - 1);

    while (!this.is_cell_empty(random_coord)) {
      random_coord = get_random_vector(0, 0, this.grid_size - 1, this.grid_size - 1);
    }

    return random_coord;
  }
}
