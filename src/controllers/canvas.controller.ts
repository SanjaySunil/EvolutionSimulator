import { SimulationConfig } from "../config";
import { CellStates, Grid } from "../environment/Grid";
import { Coordinate } from "../math/Coordinate";
import get_style from "../utils/get_style";
import MouseController from "./mouse.controller";
import NeuralNetworkVisualizer from "./nn_visualizer.controller";
import RendererController from "./renderer.controller";

const mode = document.getElementById("mode") as HTMLSpanElement;

/** Mouse Modes */

const Modes = ["IDLE", "PAN", "GOAL", "WALL"];
const ModesEnum = {
  IDLE: 0,
  PAN: 1,
  GOAL: 2,
  WALL: 3,
};

/** Controller used to manage canvas events. */
export default class CanvasController {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public grid_size: number;
  public pixel_size: number;
  public zoom_level: number;
  public zoom_speed: number;
  public min_zoom: number;
  public pan_amount: number;
  public mouse: MouseController;
  public renderer: RendererController;
  public grid: Grid;
  public mode: string;

  public config: typeof SimulationConfig;
  public goal_coordinates: Coordinate;
  public cell_selected: Coordinate;

  /** Build a new canvas. */
  constructor(canvas_id: string, config: typeof SimulationConfig) {
    this.config = config;

    this.canvas = document.getElementById(canvas_id) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.canvas.width = this.canvas.height = this.config.GRID_SIZE * 15;
    this.grid_size = this.config.GRID_SIZE;
    this.pixel_size = (this.config.GRID_SIZE * 15) / this.grid_size;
    this.zoom_level = 0.4;
    this.zoom_speed = 0.01;
    this.min_zoom = 0.1;
    this.pan_amount = 50;
    this.mouse = new MouseController(this.pixel_size);
    this.renderer = new RendererController(this.canvas, this.ctx, this.pixel_size);
    this.grid = new Grid(this.grid_size, this.renderer);
    this.mode = Modes[0];

    this.goal_coordinates = { x: 0, y: 0 };
    this.cell_selected = { x: 0, y: 0 };
    this.grid.set_cell_selected(this.goal_coordinates, true);

    this.canvas.style.transform = `scale(${this.zoom_level})`;

    this.register_mouse_events();
    this.register_keyboard_events();
    this.renderer.clear_canvas();
  }

  /** Mouse event register */
  public register_mouse_events(): void {
    this.canvas.addEventListener("mousemove", (e) => this.mouse_move(e));
    this.canvas.addEventListener("mouseup", (e) => this.mouse_up(e));
    this.canvas.addEventListener("mousedown", (e) => this.mouse_down(e));
    this.canvas.addEventListener("mouseenter", (e) => this.mouse_enter(e));
    this.canvas.addEventListener("mouseleave", () => this.mouse_leave());
    this.canvas.addEventListener("wheel", (e) => this.wheel(e));
  }

  public clear_mouse_events(): void {
    this.canvas.removeEventListener("mousemove", (e) => this.mouse_move(e));
    this.canvas.removeEventListener("mouseup", (e) => this.mouse_up(e));
    this.canvas.removeEventListener("mousedown", (e) => this.mouse_down(e));
    this.canvas.removeEventListener("mouseenter", (e) => this.mouse_enter(e));
    this.canvas.removeEventListener("mouseleave", () => this.mouse_leave());
    this.canvas.removeEventListener("wheel", (e) => this.wheel(e));
  }

  /** Keyboard event register */
  public register_keyboard_events(): void {
    window.addEventListener("keydown", (e) => {
      this.handle_key_down(e);
    });
  }

  public mouse_move(event: MouseEvent): void {
    this.mouse.mouse_move(event);
    this.handle_mouse_move();
    this.check_mouse_events();
  }

  public mouse_up(event: MouseEvent): void {
    this.mouse.mouse_up(event);
  }

  public mouse_down(event: MouseEvent): void {
    this.mouse.mouse_down(event);
    this.check_mouse_events();
  }

  public mouse_enter(event: MouseEvent): void {
    this.mouse.mouse_enter(event);
    this.handle_mouse_move();
  }

  public mouse_leave(): void {
    this.mouse.mouse_leave();
    this.handle_mouse_leave();
  }

  public wheel(event: WheelEvent): void {
    this.handle_mouse_wheel(event);
  }

  // Read Mouse Events
  public check_mouse_events(): void {
    if (this.mouse.left_click) {
      const cell = this.grid.get_cell_at(this.mouse.grid_coord);
      if (this.mode == Modes[ModesEnum.GOAL]) {
        if (this.goal_coordinates) {
          this.grid.set_cell_selected(this.goal_coordinates, false);
        }
        this.goal_coordinates = cell.coordinate;
        this.grid.set_cell_selected(this.goal_coordinates, true);
      } else if (this.mode == Modes[ModesEnum.IDLE]) {
        if (cell.state == CellStates.ORGANISM) {
          if (cell.owner?.brain.connections) {
            const NN = new NeuralNetworkVisualizer();

            NN.draw(
              cell.owner.brain.sensor_neurons,
              cell.owner.brain.internal_neurons,
              cell.owner.brain.action_neurons,
              cell.owner.brain.neurons.length,
              cell.owner.brain.connections
            );

            const fitness_element = document.getElementById("org_fitness") as HTMLTableCellElement;
            if (cell.owner && cell.owner.fitness) fitness_element.innerHTML = cell.owner.fitness?.toPrecision(3).toString();
            else document.getElementById("org_fitness")!.innerHTML = "N/A";
          }
        }
      } else if (this.mode == Modes[ModesEnum.PAN]) {
        const canvas_top = parseInt(get_style("canvas", "top"));
        const canvas_left = parseInt(get_style("canvas", "left"));
        this.canvas.style.top = canvas_top + (this.mouse.canvas_coord.y - this.mouse.clicked_coord.y) * this.zoom_level + "px";
        this.canvas.style.left = canvas_left + (this.mouse.canvas_coord.x - this.mouse.clicked_coord.x) * this.zoom_level + "px";
      } else if (this.mode == Modes[ModesEnum.WALL]) {
        if (!cell.owner) {
          this.grid.set_cell_state(this.mouse.grid_coord, CellStates.WALL);
        }
      }
    }
  }

  /** Handle key press. */
  public handle_key_down(event: KeyboardEvent): void {
    const canvas_top = parseInt(get_style("canvas", "top"));
    const canvas_left = parseInt(get_style("canvas", "left"));
    if (event.code == "KeyD") this.canvas.style.left = canvas_left - this.pan_amount + "px";
    else if (event.code == "KeyA") this.canvas.style.left = canvas_left + this.pan_amount + "px";
    else if (event.code == "KeyS") this.canvas.style.top = canvas_top - this.pan_amount + "px";
    else if (event.code == "KeyW") this.canvas.style.top = canvas_top + this.pan_amount + "px";
    else if (event.code == "Digit1") this.mode = Modes[ModesEnum.IDLE];
    else if (event.code == "Digit2") this.mode = Modes[ModesEnum.PAN];
    else if (event.code == "Digit3") this.mode = Modes[ModesEnum.GOAL];
    else if (event.code == "Digit4") this.mode = Modes[ModesEnum.WALL];

    mode.innerHTML = this.mode;
  }

  /** Panning controls */
  public handle_mouse_wheel(event: WheelEvent): void {
    const sign = -Math.sign(event.deltaY);
    const scale = Math.max(this.min_zoom, this.zoom_level + sign * this.zoom_speed);

    const canvas_top = parseInt(get_style("canvas", "top"));
    const canvas_left = parseInt(get_style("canvas", "left"));

    const dx = (this.canvas.width / 2 - this.mouse.canvas_coord.x) * (scale - this.zoom_level);
    const dy = (this.canvas.height / 2 - this.mouse.canvas_coord.y) * (scale - this.zoom_level);

    this.canvas.style.top = canvas_top + dy + "px";
    this.canvas.style.left = canvas_left + dx + "px";

    this.zoom_level = scale;
    this.canvas.style.transform = `scale(${this.zoom_level})`;
  }

  /** Highlight cell action. */
  public handle_mouse_move(): void {
    this.grid.set_cell_highlighted(this.mouse.prev_grid_coord, false);
    this.grid.set_cell_highlighted(this.mouse.grid_coord, true);
  }

  /** Handle mouse leave canvas. */
  public handle_mouse_leave(): void {
    // const cell = this.grid.get_cell_at(this.mouse.grid_coord);
    // if (cell.is_highlighted) {
    //   this.grid.set_cell_highlighted_at(this.mouse.grid_coord, false);
    // }
  }
}