import { SimulationConfig } from "../config/simulation.config";
import Vector from "../math/vector.math";

/** This controller is used to manage mouse events. */
export default class MouseController {
  public middle_click: boolean;
  public left_click: boolean;
  public right_click: boolean;
  public pixel_size: number;
  public grid_coord: Vector;
  public prev_grid_coord: Vector;
  public canvas_coord: Vector;
  public clicked_coord: Vector;

  constructor(pixel_size: number) {
    this.grid_coord = new Vector();
    this.prev_grid_coord = new Vector();
    this.canvas_coord = new Vector();
    this.clicked_coord = new Vector();
    this.middle_click = false;
    this.left_click = false;
    this.right_click = false;
    this.pixel_size = pixel_size;
  }

  /** This event is triggered when the mouse moves in the canvas. */
  public mouse_move(event: MouseEvent): void {
    event.preventDefault();

    this.canvas_coord.x = event.offsetX;
    this.canvas_coord.y = event.offsetY;
    this.prev_grid_coord.copy(this.grid_coord);

    this.grid_coord.x = Math.floor(this.canvas_coord.x / this.pixel_size);
    this.grid_coord.y = Math.floor(this.canvas_coord.y / this.pixel_size);

    /** Fix grid coordinates when at canvas boundaries. */
    if (this.grid_coord.x >= SimulationConfig.GRID_SIZE) this.grid_coord.x -= 1;
    if (this.grid_coord.y >= SimulationConfig.GRID_SIZE) this.grid_coord.y -= 1;
    if (this.grid_coord.x <= 0) this.grid_coord.x = 0;
    if (this.grid_coord.y <= 0) this.grid_coord.y = 0;
  }

  /** This event is triggered when the mouse click is released. */
  public mouse_up(event: MouseEvent): void {
    event.preventDefault();

    if (event.button == 0) this.left_click = false;
    if (event.button == 1) this.middle_click = false;
    if (event.button == 2) this.right_click = false;
  }

  /** This event is triggered when the mouse is clicked. */
  public mouse_down(event: MouseEvent): void {
    event.preventDefault();

    this.left_click = event.button == 0;
    this.middle_click = event.button == 1;
    this.right_click = event.button == 2;

    this.clicked_coord.copy(this.canvas_coord);
  }

  /** This event is triggered when the mouse enters the canvas. */
  public mouse_enter(event: MouseEvent): void {
    this.left_click = !!(event.buttons & 1);
    this.right_click = !!(event.buttons & 2);
    this.middle_click = !!(event.buttons & 4);

    this.clicked_coord.copy(this.canvas_coord);
  }

  /** This event is triggered when the mouse leaves the canvas. */
  public mouse_leave(): void {
    this.left_click = false;
    this.middle_click = false;
    this.right_click = false;
  }
}
