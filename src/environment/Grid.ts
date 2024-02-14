import create_obstructions from "../algorithms/EnvironmentGenerator";
import Renderer from "../controllers/renderer.controller";
import Organism from "../models/Organism";
import { Coordinate } from "../types/Coordinate";
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

/** This class is used to create a grid cell that can be used to represent a cell in the grid. */
export class GridCell {
  private _owner: Organism | null;
  private _state: number;
  public coordinate: Coordinate;
  public energy: number;
  public is_highlighted: boolean;
  public is_selected: boolean;

  /**
   * Instantiates a new grid cell.
   * @param x - The x-coordinate of the cell.
   * @param y - The y-coordinate of the cell.
   * @param state - The state of the cell.
   */
  constructor(x: number, y: number, state = CellStates.EMPTY) {
    this.coordinate = { x, y };
    this._owner = null;
    this._state = state;
    this.is_selected = false;
    this.is_highlighted = false;
    this.energy = 0;
  }

  /**
   * This method is used to get the owner of the grid cell.
   * @returns The owner of the grid cell.
   */
  public get owner(): Organism | null {
    // Retrieve and return the owner of the GridCell
    return this._owner;
  }

  /**
   * This method is used to set the owner of the grid cell.
   * @param owner - The owner of the grid cell.
   */
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

  /**
   * This method is used to get the state of the grid cell.
   * @returns The state of the grid cell.
   */
  public get state(): number {
    // Retrieve and return the state of the GridCell
    return this._state;
  }

  /**
   * This method is used to set the state of the grid cell.
   * @param state - The state of the grid cell.
   */
  public set state(state: number) {
    // Set the state of the GridCell to the provided state value
    this._state = state;
  }

  /** This method is used to clear the grid cell. */
  public clear(): void {
    // Reset the owner of the cell to null
    this._owner = null;

    // Set the state of the cell to EMPTY
    this._state = CellStates.EMPTY;
  }
}

/** This class is used to create a grid that can be used to represent the environment. */
export class Grid {
  private _data: GridCell[][];
  public grid_size: number;
  public occupied: number;
  public renderer: Renderer;

  /**
   * Builds a new grid.
   * @param grid_size - The size of the grid.
   * @param renderer - The renderer to use for rendering the grid.
   */
  constructor(grid_size: number, renderer: Renderer) {
    this._data = new Array(grid_size);
    this.renderer = renderer;
    this.grid_size = grid_size;
    this.occupied = 0;
    this.init();
  }

  /** This method is used to initialize the grid. */
  private init(): void {
    // Loop through each row (x-axis) of the grid
    for (let x = 0; x < this.grid_size; x++) {
      // Create a new array to represent a column of grid cells
      const column: GridCell[] = new Array(this.grid_size);

      // Loop through each column (y-axis) of the grid
      for (let y = 0; y < this.grid_size; y++) {
        // Create a new GridCell instance with the current x and y coordinates
        const cell = new GridCell(x, y);

        // Assign the cell to the current column in the grid
        column[y] = cell;
      }

      // Assign the column to the grid data at the current x position
      this._data[x] = column;
    }
  }

  /** This method is used to generate obstructions in the grid. */
  public generate_obstructions(): void {
    // Create a grid of obstructions
    const obstructions = create_obstructions(this.grid_size, this.grid_size, 0.75);

    // Loop through each cell in the grid, and if the cell is an obstruction, set it as a wall, else set it as empty.
    for (let x = 0; x < this.grid_size; x++) {
      for (let y = 0; y < this.grid_size; y++) {
        const cell = this.get_cell_at({ x, y });
        cell.state = obstructions[x][y] == 1 ? CellStates.WALL : CellStates.EMPTY;
        if (cell.state == CellStates.WALL) this.renderer.to_fill.enqueue(cell);
      }
    }
  }

  /** Clears all obstructions from the grid. */
  public clear_obstructions(): void {
    // Loop through each cell in the grid, and if the cell is a wall, clear its state.
    for (let x = 0; x < this.grid_size; x++) {
      for (let y = 0; y < this.grid_size; y++) {
        const cell = this.get_cell_at({ x, y });
        if (cell.state == CellStates.WALL) {
          this.clear_cell_state({ x, y });
        }
      }
    }
  }

  /**
   * Clears the state of a cell.
   * @param coordinate - The coordinate of the cell to clear the state of.
   */
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
        this.renderer.to_clear.enqueue(cell);
      } else {
        // Set cell state to FOOD and add it to both 'to_clear' and 'to_fill' sets in the renderer
        cell.state = CellStates.FOOD;
        this.renderer.to_clear.enqueue(cell);
        this.renderer.to_fill.enqueue(cell);
      }

      // Reduce the count of occupied cells
      this.occupied -= 1;
    }
  }

  /**
   * This method is used to fetch a random empty cell from the grid.
   * @returns A random empty cell from the grid.
   */
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

  /**
   * This method is used to get the cell at the specified coordinate.
   * @param coordinate - The coordinate to check.
   * @returns The cell at the specified coordinate.
   */
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

  /**
   * This method is used to check if the specified cell is empty.
   * @param coordinate - The coordinate to check.
   * @returns Whether the specified cell is empty.
   */
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

  /**
   * This method is used to check if the specified cell is valid.
   * @param coordinate - The coordinate to check.
   * @returns Whether the specified cell is valid.
   */
  public is_valid_cell_at(coordinate: Coordinate): boolean {
    // Check if the specified coordinate is within the grid boundaries
    return coordinate.x >= 0 && coordinate.y >= 0 && coordinate.x < this.grid_size && coordinate.y < this.grid_size;
  }

  /**
   * Sets the highlighted state of a cell.
   * @param coordinate - The coordinate of the cell to set the highlighted state of.
   * @param highlighted - The highlighted state to set.
   */
  public set_cell_highlighted(coordinate: Coordinate, highlighted: boolean): void {
    // Check if the provided cell coordinate is within the grid
    if (this.is_valid_cell_at(coordinate)) {
      // Retrieve the cell at the specified coordinate
      const cell = this.get_cell_at(coordinate);

      // Set the 'is_highlighted' property of the cell to the provided value
      cell.is_highlighted = highlighted;

      // Add the cell to the 'to_fill' set in the renderer for rendering purposes
      this.renderer.to_fill.enqueue(cell);
    }
  }

  /**
   * Sets the owner of a cell.
   * @param coordinate - The coordinate of the cell to set the owner of.
   * @param owner - The owner to set.
   */
  public set_cell_owner(coordinate: Coordinate, owner: Organism): void {
    // Check if the provided cell coordinate is within the grid
    if (this.is_valid_cell_at(coordinate)) {
      // Retrieve the cell at the specified coordinate
      const cell = this.get_cell_at(coordinate);

      // Set the owner of the cell to the specified organism
      cell.owner = owner;

      // Add the cell to the 'to_fill' set in the renderer
      this.renderer.to_fill.enqueue(cell);

      // Increment the count of occupied cells
      this.occupied += 1;
    }
  }

  /**
   * Sets the selected state of a cell.
   * @param coordinate - The coordinate of the cell to set the selected state of.
   * @param selected - The selected state to set.
   */
  public set_cell_selected(coordinate: Coordinate, selected: boolean): void {
    // Check if the provided cell coordinate is within the grid
    if (this.is_valid_cell_at(coordinate)) {
      // Retrieve the cell at the specified coordinate
      const cell = this.get_cell_at(coordinate);

      // Set the 'is_selected' property of the cell to the provided value
      cell.is_selected = selected;

      // Add the cell to the 'to_fill' set in the renderer for rendering purposes
      this.renderer.to_fill.enqueue(cell);
    }
  }

  /**
   * Sets the state of a cell.
   * @param coordinate The coordinate of the cell to set the state of.
   * @param state The state to set.
   */
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
      this.renderer.to_fill.enqueue(cell);

      // Increment the count of occupied cells
      this.occupied += 1;
    }
  }
}
