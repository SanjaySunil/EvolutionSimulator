import { CellStates } from "../constants/CellStates";
import Grid from "../models/Grid";
import get_style from "../utils/get_style";
import MouseController from "./mouse.controller";
import NeuralNetworkVisualizer from "./nn_visualizer.controller";
import RendererController from "./renderer.controller";

/** Mouse Modes */
const Modes = {
  IDLE: 0,
  WALL: 1,
  RADIOACTIVE: 2,
  REMOVE: 3,
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
  public mode: number;

  /** Build a new canvas. */
  constructor(canvas_id: string, canvas_size: number, grid_size: number) {
    this.canvas = document.getElementById(canvas_id) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.canvas.width = this.canvas.height = canvas_size;
    this.grid_size = grid_size;
    this.pixel_size = canvas_size / grid_size;
    this.zoom_level = 1;
    this.zoom_speed = 0.1;
    this.min_zoom = 0.1;
    this.pan_amount = 100;
    this.mouse = new MouseController(this.pixel_size);
    this.renderer = new RendererController(this.canvas, this.ctx, this.pixel_size);
    this.grid = new Grid(this.grid_size, this.renderer);
    this.mode = Modes.IDLE;
    this.register_mouse_events();
    this.register_keyboard_events();
    this.renderer.clear_canvas();
    this.grid.initialize();
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

  public clear_mouse_events(): void { }

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
      if (this.mode == Modes.RADIOACTIVE) {
        if (cell.owner) {
          cell.owner.drop_food_on_death = false;
          cell.owner.kill();
        }
        this.grid.set_cell_at(this.mouse.grid_coord, CellStates.RADIOACTIVE);
      } else if (this.mode == Modes.WALL) {
        if (cell.owner) {
          cell.owner.drop_food_on_death = false;
          cell.owner.kill();
        }
        this.grid.set_cell_at(this.mouse.grid_coord, CellStates.WALL);
      } else if (this.mode == Modes.REMOVE) {
        if (!cell.owner) this.grid.clear_cell_at(this.mouse.grid_coord);
      } else if (this.mode == Modes.IDLE) {
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

            document.getElementById("org_age")!.innerHTML = cell.owner.age.toString();
            document.getElementById("org_energy")!.innerHTML = cell.owner.energy.toString();
            document.getElementById("org_step_count")!.innerHTML = cell.owner.step_count.toString();
            document.getElementById("org_energy_consumed")!.innerHTML = cell.owner.energy_consumed.toString();
            document.getElementById("org_fitness")!.innerHTML = (cell.owner.energy_consumed / 1000000).toString();

            console.log(cell);
          }
        }
      }
    } else if (this.mouse.middle_click) {
      const canvas_top = parseInt(get_style("canvas", "top"));
      const canvas_left = parseInt(get_style("canvas", "left"));
      this.canvas.style.top = canvas_top + (this.mouse.canvas_coord.y - this.mouse.clicked_coord.y) * this.zoom_level + "px";
      this.canvas.style.left = canvas_left + (this.mouse.canvas_coord.x - this.mouse.clicked_coord.x) * this.zoom_level + "px";
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
    else if (event.code == "Digit1") this.mode = Modes.IDLE;
    else if (event.code == "Digit2") this.mode = Modes.REMOVE;
    else if (event.code == "Digit3") this.mode = Modes.WALL;
    else if (event.code == "Digit4") this.mode = Modes.RADIOACTIVE;
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
    this.grid.set_cell_highlighted_at(this.mouse.prev_grid_coord, false);
    this.grid.set_cell_highlighted_at(this.mouse.grid_coord, true);
  }

  /** Handle mouse leave canvas. */
  public handle_mouse_leave(): void {
    const cell = this.grid.get_cell_at(this.mouse.grid_coord);
    if (cell.is_highlighted) {
      this.grid.set_cell_highlighted_at(this.mouse.grid_coord, false);
    }
  }
}
