import { Coordinate } from "../types/Coordinate";
import { make_vector } from "../utils/geometry";

// Define the different modes for mouse interaction.
export const MouseModeSymbols = ["IDLE", "PAN", "GOAL", "WALL", "RADIOACTIVE", "REMOVE"];

// ModesEnum is used to access the different modes by index.
export const MouseModes = {
  IDLE: 0,
  PAN: 1,
  GOAL: 2,
  WALL: 3,
  RADIOACTIVE: 4,
  REMOVE: 5,
};

/** This class is used to create a mouse controller that can be used to manage mouse events. */
export class Mouse {
  public canvas_coord: Coordinate;
  public clicked_coord: Coordinate;
  public grid_coord: Coordinate;
  public grid_size: number;
  public left_click: boolean;
  public middle_click: boolean;
  public mode: number;
  public pixel_size: number;
  public prev_grid_coord: Coordinate;
  public right_click: boolean;

  /**
   * Instantiates a new Mouse.
   * @param pixel_size - The size of the pixels on the canvas.
   * @param grid_size - The size of the grid on the canvas.
   */
  constructor(pixel_size: number, grid_size: number) {
    this.grid_size = grid_size;
    this.grid_coord = make_vector(0, 0);
    this.prev_grid_coord = make_vector(0, 0);
    this.canvas_coord = make_vector(0, 0);
    this.clicked_coord = make_vector(0, 0);
    this.middle_click = false;
    this.left_click = false;
    this.right_click = false;
    this.pixel_size = pixel_size;
    this.mode = MouseModes.IDLE;
  }

  /**
   * This method is triggered when the mouse is clicked.
   * @param event - The mouse down event.
   */
  public mouse_down(event: MouseEvent): void {
    event.preventDefault();

    // Identify and set flags for different mouse buttons upon click.
    this.left_click = event.button === 0; // Left mouse button clicked
    this.middle_click = event.button === 1; // Middle mouse button clicked
    this.right_click = event.button === 2; // Right mouse button clicked

    // Store the coordinates of the click.
    this.clicked_coord.x = this.canvas_coord.x;
    this.clicked_coord.y = this.canvas_coord.y;
  }

  /**
   * This method is triggered when the mouse enters the canvas.
   * @param event - The mouse enter event.
   */
  public mouse_enter(event: MouseEvent): void {
    // Identify and set flags for different mouse buttons upon entering the canvas.
    this.left_click = !!(event.buttons & 1); // Left mouse button clicked
    this.right_click = !!(event.buttons & 2); // Right mouse button clicked
    this.middle_click = !!(event.buttons & 4); // Middle mouse button clicked

    // Store the coordinates of the mouse pointer upon entering the canvas.
    this.clicked_coord.x = this.canvas_coord.x;
    this.clicked_coord.y = this.canvas_coord.y;
  }

  /** This method is triggered when the mouse leaves the canvas. */
  public mouse_leave(): void {
    // Left mouse button released
    this.left_click = false;
    // Middle mouse button released
    this.middle_click = false;
    // Right mouse button released
    this.right_click = false;
  }

  /**
   * This method is triggered when the mouse moves in the canvas.
   * @param event - The mouse move event.
   */
  public mouse_move(event: MouseEvent): void {
    event.preventDefault();

    // Update the coordinates based on mouse position.
    this.canvas_coord.x = event.offsetX;
    this.canvas_coord.y = event.offsetY;

    // Store the previous grid coordinates.
    this.prev_grid_coord.x = this.grid_coord.x;
    this.prev_grid_coord.y = this.grid_coord.y;

    // Calculate new grid coordinates based on the canvas and pixel size.
    this.grid_coord.x = Math.floor(this.canvas_coord.x / this.pixel_size);
    this.grid_coord.y = Math.floor(this.canvas_coord.y / this.pixel_size);

    // Fix grid coordinates within canvas boundaries.
    if (this.grid_coord.x >= this.grid_size) this.grid_coord.x -= 1;
    if (this.grid_coord.y >= this.grid_size) this.grid_coord.y -= 1;
    if (this.grid_coord.x <= 0) this.grid_coord.x = 0;
    if (this.grid_coord.y <= 0) this.grid_coord.y = 0;
  }

  /**
   * This method is triggered when the mouse click is released.
   * @param event - The mouse up event.
   */
  public mouse_up(event: MouseEvent): void {
    event.preventDefault();

    // Identify and handle different mouse buttons upon release.
    if (event.button === 0) this.left_click = false; // Left mouse button released
    if (event.button === 1) this.middle_click = false; // Middle mouse button released
    if (event.button === 2) this.right_click = false; // Right mouse button released
  }
}
