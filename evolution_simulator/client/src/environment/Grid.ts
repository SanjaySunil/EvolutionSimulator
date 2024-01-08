import Renderer from "../controllers/renderer.controller";
import Organism from "../models/Organism";
import { Coordinate } from "../models/types/Coordinate";
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
  public energy: number;

  // Builds a new GridCell.
  constructor(x: number, y: number, state = CellStates.EMPTY) {
    this.coordinate = { x, y };
    this._owner = null;
    this._state = state;
    this.is_selected = false;
    this.is_highlighted = false;
    this.energy = 0;
  }

  // Clears the GridCell.
  public clear(): void {
    // Reset the owner of the cell to null
    this._owner = null;

    // Set the state of the cell to EMPTY
    this._state = CellStates.EMPTY;
  }


  // Returns owner of GridCell.
  public get owner(): Organism | null {
    // Retrieve and return the owner of the GridCell
    return this._owner;
  }

  // Sets owner to specified Organism, and changes state of GridCell.
  public set owner(owner: Organism | null) {
    // Check if an owner is provided
    if (owner) {
      // If an owner is provided, set the owner of the GridCell
      this._owner = owner;

      // Update the state of the GridCell to indicate it's occupied by an organism
      this._state = CellStates.ORGANISM;
    } else {
      // If no owner is provided, reset the owner to null
      this._owner = null;
    }
  }


  // Returns state of GridCell.
  public get state(): number {
    // Retrieve and return the state of the GridCell
    return this._state;
  }


  // Sets the state of GridCell.
  public set state(state: number) {
    // Set the state of the GridCell to the provided state value
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
    // Loop through each row (x-axis) of the grid
    for (let x = 0; x < this.grid_size; x++) {
      // Create a new array to represent a column of grid cells
      const column: GridCell[] = new Array(this.grid_size);

      // Loop through each column (y-axis) of the grid
      for (let y = 0; y < this.grid_size; y++) {
        // Create a new GridCell instance with the current x and y coordinates
        const cell = new GridCell(x, y);

        // Set the initial state of the cell (currently commented out)
        // cell.state = grid[x][y] == true ? CellStates.WALL : CellStates.EMPTY;

        // Assign the cell to the current column in the grid
        column[y] = cell;
      }

      // Assign the column to the grid data at the current x position
      this._data[x] = column;
    }
  }

  // Clears the grid.
  public clear_grid(): void {
    // Reset the grid data to an empty array
    this._data = [];

    // Re-initialize the grid to clear all grid cells
    this.init();
  }

  // Checks if specified cell is valid.
  public is_valid_cell_at(coordinate: Coordinate): boolean {
    // Check if the specified coordinate is within the grid boundaries
    return coordinate.x >= 0 && coordinate.y >= 0 && coordinate.x < this.grid_size && coordinate.y < this.grid_size;
  }
  // Checks if specified cell is empty.
  public is_cell_empty(coordinate: Coordinate): boolean {
    // Check if the provided cell coordinate is valid within the grid
    if (this.is_valid_cell_at(coordinate)) {
      // Retrieve the state of the cell at the specified coordinate and check if it's empty
      return this._data[coordinate.x][coordinate.y].state == CellStates.EMPTY;
    } else {
      // Throw an error if the provided cell coordinate is not valid
      throw Error(`Not a valid cell. ${coordinate.x} ${coordinate.y}`);
    }
  }

  // Returns cell at specified Coordinate.
  public get_cell_at(coordinate: Coordinate): GridCell {
    // Check if the provided cell coordinate is within the grid
    if (this.is_valid_cell_at(coordinate)) {
      // Retrieve and return the GridCell at the specified coordinate
      return this._data[coordinate.x][coordinate.y];
    } else {
      // Throw an error if the provided cell coordinate is not valid
      throw Error(`Not a valid cell. ${coordinate.x} ${coordinate.y}`);
    }
  }

  // Sets the owner of a cell.
  public set_cell_owner(coordinate: Coordinate, owner: Organism): void {
    // Check if the provided cell coordinate is within the grid
    if (this.is_valid_cell_at(coordinate)) {
      // Retrieve the cell at the specified coordinate
      const cell = this.get_cell_at(coordinate);

      // Set the owner of the cell to the specified organism
      cell.owner = owner;

      // Add the cell to the 'to_fill' set in the renderer
      this.renderer.to_fill.add(cell);

      // Increment the count of occupied cells
      this.occupied += 1;
    }
  }


  // Sets the state of a cell.
  public set_cell_state(coordinate: Coordinate, state: number): void {
    // Check if the provided cell coordinate is within the grid
    if (this.is_valid_cell_at(coordinate)) {
      // Retrieve the cell at the specified coordinate
      const cell = this.get_cell_at(coordinate);

      // Set the state of the cell to the provided state
      cell.state = state;

      // If the cell state is 'FOOD', set its energy to 1 and clear its owner
      if (cell.state == CellStates.FOOD) {
        cell.energy = 1;
      }

      // Clear the owner of the cell
      cell.owner = null;

      // Add the cell to the 'to_fill' set in the renderer
      this.renderer.to_fill.add(cell);

      // Increment the count of occupied cells
      this.occupied += 1;
    }
  }

  // Sets the selected state of a cell.
  public set_cell_selected(coordinate: Coordinate, selected: boolean): void {
    // Check if the provided cell coordinate is within the grid
    if (this.is_valid_cell_at(coordinate)) {
      // Retrieve the cell at the specified coordinate
      const cell = this.get_cell_at(coordinate);

      // Set the 'is_selected' property of the cell to the provided value
      cell.is_selected = selected;

      // Add the cell to the 'to_fill' set in the renderer for rendering purposes
      this.renderer.to_fill.add(cell);
    }
  }
  // Sets the highlighted state of a cell.
  public set_cell_highlighted(coordinate: Coordinate, highlighted: boolean): void {
    // Check if the provided cell coordinate is within the grid
    if (this.is_valid_cell_at(coordinate)) {
      // Retrieve the cell at the specified coordinate
      const cell = this.get_cell_at(coordinate);

      // Set the 'is_highlighted' property of the cell to the provided value
      cell.is_highlighted = highlighted;

      // Add the cell to the 'to_fill' set in the renderer for rendering purposes
      this.renderer.to_fill.add(cell);
    }
  }

  // Clears the state of a cell.
  public clear_cell_state(coordinate: Coordinate): void {
    // Check if the provided cell coordinate is within the grid
    if (this.is_valid_cell_at(coordinate)) {
      // Retrieve the cell at the specified coordinate
      const cell = this.get_cell_at(coordinate);

      // Remove owner of the cell
      cell.owner = null;

      // Check if the cell's energy is less than or equal to zero
      if (cell.energy <= 0) {
        // Set cell state to EMPTY and add it to the 'to_clear' set in the renderer for clearing
        cell.state = CellStates.EMPTY;
        this.renderer.to_clear.add(cell);
      } else {
        // Set cell state to FOOD and add it to both 'to_clear' and 'to_fill' sets in the renderer
        cell.state = CellStates.FOOD;
        this.renderer.to_clear.add(cell);
        this.renderer.to_fill.add(cell);
      }

      // Reduce the count of occupied cells
      this.occupied -= 1;
    }
  }

  // Creates walls using Perlin Noise.
  public create_perlin_barrier(cell: GridCell, perlin): void {
    const WALL_THRESHOLD = 0.85; // Threshold value for determining wall creation probability
    const value = perlin.noise(cell.coordinate.x * 0.1, cell.coordinate.y * 0.1); // Generate Perlin noise value for the cell

    // Set the cell state to WALL or EMPTY based on the noise value and threshold
    cell.state = value > WALL_THRESHOLD ? CellStates.WALL : CellStates.EMPTY;

    // Add the cell to the 'to_fill' set in the renderer for rendering
    this.renderer.to_fill.add(cell);

    // Increment the count of occupied cells if a wall is created
    if (cell.state === CellStates.WALL) {
      this.occupied += 1;
    }
  }

  // Creates a radioactive barrier depending on specified conditions.
  public create_radioactive_barrier(cell: GridCell): void {
    const center = this.grid_size / 2; // Calculate the center of the grid
    const size = 7.5; // Define the size of the radioactive barrier

    // Check if the cell's coordinates fall within the specified radioactive barrier area
    if (
      cell.coordinate.x >= center - size &&
      cell.coordinate.x <= center + size &&
      cell.coordinate.y >= center - size &&
      cell.coordinate.y <= center + size
    ) {
      cell.state = CellStates.RADIOACTIVE; // Set the cell state to RADIOACTIVE if it's within the barrier
      this.renderer.to_fill.add(cell); // Add the cell to the 'to_fill' set in the renderer for rendering
      this.occupied += 1; // Increment the count of occupied cells
    }
  }

  // Creates a barrier depending on specified conditions.
  public create_barrier(cell: GridCell): void {
    const center = this.grid_size / 2; // Calculate the center of the grid
    const size = 7.5; // Define the size of the barrier

    // Check if the cell's coordinates fall within the specified barrier area
    if (
      cell.coordinate.x >= center - size &&
      cell.coordinate.x <= center + size &&
      cell.coordinate.y >= center - size &&
      cell.coordinate.y <= center + size
    ) {
      cell.state = CellStates.WALL; // Set the cell state to WALL if it's within the barrier
      this.renderer.to_fill.add(cell); // Add the cell to the 'to_fill' set in the renderer for rendering
      this.occupied += 1; // Increment the count of occupied cells
    }
  }

  // Fetches a random empty cell from the grid.
  public fetch_empty_cell(): Coordinate {
    // Check if the grid is fully occupied, throw an error if no empty cells are available
    if (this.occupied === this.grid_size ** 2) {
      alert("No empty cells left!");
      throw Error("No empty cells left!");
    }

    // Generate a random coordinate within the grid
    let random_coord = get_random_vector(0, 0, this.grid_size - 1, this.grid_size - 1);

    // Loop until an empty cell is found using the generated random coordinates
    while (!this.is_cell_empty(random_coord)) {
      random_coord = get_random_vector(0, 0, this.grid_size - 1, this.grid_size - 1);
    }

    return random_coord; // Return the coordinates of the found empty cell
  }
}
