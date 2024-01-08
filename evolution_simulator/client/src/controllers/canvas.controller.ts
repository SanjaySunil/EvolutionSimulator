import NeuralNetDiagram from "../components/NeuralNetDiagram";
import { DefaultSimulationConfig } from "../config/simulation.config";
import { CellStates, Grid } from "../environment/Grid";
import { Coordinate } from "../models/types/Coordinate";
import { max_distance } from "../utils/get_max_distance";
import get_style from "../utils/get_style";
import Mouse from "./mouse.controller";
import Renderer from "./renderer.controller";
import { DOMElements } from "../components/DOMElements";

// Define the different modes for mouse interaction.
const Modes = ["IDLE", "PAN", "GOAL", "WALL", "RADIOACTIVE", "REMOVE"];
const ModesEnum = {
  IDLE: 0,
  PAN: 1,
  GOAL: 2,
  WALL: 3,
  RADIOACTIVE: 4,
  REMOVE: 5,
};

// Controller used to manage canvas events.
export default class Canvas {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public grid_size: number;
  public pixel_size: number;
  public zoom_level: number;
  public zoom_speed: number;
  public min_zoom: number;
  public pan_amount: number;
  public mouse: Mouse;
  public renderer: Renderer;
  public grid: Grid;
  public mode: string;
  public config: typeof DefaultSimulationConfig;
  public goal_coordinates: Coordinate[];
  public max_distances_to_goal: number[];

  constructor(canvas_id: string, config: typeof DefaultSimulationConfig) {
    this.config = config;

    // Get the canvas element and its 2D rendering context
    this.canvas = document.getElementById(canvas_id) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;

    // Set the canvas dimensions based on the grid size
    this.canvas.width = this.canvas.height = this.config.GRID_SIZE * 15;
    this.grid_size = this.config.GRID_SIZE;
    this.pixel_size = (this.config.GRID_SIZE * 15) / this.grid_size;
    this.zoom_level = 0.4;
    this.zoom_speed = 0.01;
    this.min_zoom = 0.1;
    this.pan_amount = 50;
    this.mouse = new Mouse(this.pixel_size, this.grid_size);
    this.renderer = new Renderer(this.canvas, this.ctx, this.pixel_size);
    this.grid = new Grid(this.grid_size, this.renderer);
    this.mode = Modes[0];

    this.goal_coordinates = [];
    this.max_distances_to_goal = [];

    // Set the initial zoom level and transform the canvas accordingly
    this.canvas.style.transform = `scale(${this.zoom_level})`;

    // Register mouse and keyboard events
    this.register_mouse_events();
    this.register_keyboard_events();
    this.renderer.clear_canvas();
  }

  // Function to register mouse events.
  public register_mouse_events(): void {
    // Register mouse events on the canvas.
    this.canvas.addEventListener("mousemove", (e) => this.mouse_move(e));
    this.canvas.addEventListener("mouseup", (e) => this.mouse_up(e));
    this.canvas.addEventListener("mousedown", (e) => this.mouse_down(e));
    this.canvas.addEventListener("mouseenter", (e) => this.mouse_enter(e));
    this.canvas.addEventListener("mouseleave", () => this.mouse_leave());
    this.canvas.addEventListener("wheel", (e) => this.wheel(e));
  }

  // Register keyboard events
  public register_keyboard_events(): void {
    // Register keyboard events on the window
    window.addEventListener("keydown", (e) => {
      this.handle_key_down(e);
    });
  }

  public mouse_move(event: MouseEvent): void {
    // Handle mouse move event
    this.mouse.mouse_move(event);
    this.handle_mouse_move();
    this.check_mouse_events();
  }

  public mouse_up(event: MouseEvent): void {
    // Handle mouse up event
    this.mouse.mouse_up(event);
  }

  public mouse_down(event: MouseEvent): void {
    // Handle mouse down event
    this.mouse.mouse_down(event);
    this.check_mouse_events();
  }

  public mouse_enter(event: MouseEvent): void {
    // Handle mouse enter event
    this.mouse.mouse_enter(event);
    this.handle_mouse_move();
  }

  public mouse_leave(): void {
    // Handle mouse leave event
    this.mouse.mouse_leave();
    this.handle_mouse_leave();
  }

  public wheel(event: WheelEvent): void {
    // Handle mouse wheel event
    this.handle_mouse_wheel(event);
  }

  // Checks and performs mouse-related actions based on the current mode
  public check_mouse_events(): void {
    // Check if the left mouse button is clicked
    if (this.mouse.left_click) {
      // Get the cell at the current mouse position
      const cell = this.grid.get_cell_at(this.mouse.grid_coord);

      // If the current mode is goal, check if the cell is selected, and add or remove it from the goal coordinates.
      if (this.mode == Modes[ModesEnum.GOAL]) {
        if (cell.is_selected) {
          // Remove selected goal coordinate and its max distance
          this.goal_coordinates.splice(this.goal_coordinates.indexOf(cell.coordinate), 1);
          this.max_distances_to_goal.splice(this.goal_coordinates.indexOf(cell.coordinate), 1);
          this.grid.set_cell_selected(cell.coordinate, false);
        } else {
          // Add selected goal coordinate and its max distance
          this.goal_coordinates.push(cell.coordinate);
          this.max_distances_to_goal.push(max_distance(this.config.GRID_SIZE, cell.coordinate.x, cell.coordinate.y));
          this.grid.set_cell_selected(cell.coordinate, true);
        }
      } else if (this.mode == Modes[ModesEnum.IDLE]) {
        // If the current mode is idle, check if the cell is an organism, and create its neural network diagram.
        if (cell.state == CellStates.ORGANISM && cell.owner?.brain.connections) {
          // Display selected organism's neural network diagram
          DOMElements.organism_selected.innerHTML = "Organism selected";
          DOMElements.organism_selected_table.style.display = "block";

          const diagram = new NeuralNetDiagram();
          diagram.draw(cell.owner.brain.connections);
        } else {
          // Clear organism selected message and hide neural network diagram download button.
          DOMElements.organism_selected.innerHTML = "";
          DOMElements.organism_selected_table.style.display = "none";
        }
      } else if (this.mode == Modes[ModesEnum.PAN]) {
        // If the current mode is pan, move the canvas based on the mouse movement.
        const canvas_top = parseInt(get_style("canvas", "top"));
        const canvas_left = parseInt(get_style("canvas", "left"));
        // Add the difference between the current mouse position and the clicked mouse position to the canvas position.
        this.canvas.style.top = canvas_top + (this.mouse.canvas_coord.y - this.mouse.clicked_coord.y) * this.zoom_level + "px";
        this.canvas.style.left = canvas_left + (this.mouse.canvas_coord.x - this.mouse.clicked_coord.x) * this.zoom_level + "px";
      } else if (this.mode == Modes[ModesEnum.WALL]) {
        // If the current mode is wall and there is no owner in the selected cell, set the cell state to wall.
        if (!cell.owner) {
          this.grid.set_cell_state(this.mouse.grid_coord, CellStates.WALL);
        }
      } else if (this.mode == Modes[ModesEnum.RADIOACTIVE]) {
        // If the current mode is radioactive and there is no owner in the selected cell, set the cell state to radioactive.
        if (!cell.owner) {
          this.grid.set_cell_state(this.mouse.grid_coord, CellStates.RADIOACTIVE);
        }
      } else if (this.mode == Modes[ModesEnum.REMOVE]) {
        // If the current mode is remove and there is no owner in the selected cell, clear the cell state.
        if (!cell.owner) {
          this.grid.clear_cell_state(this.mouse.grid_coord);
        }
      }
    }
  }

  // Handles keyboard key press events
  public handle_key_down(event: KeyboardEvent): void {
    // Obtain canvas top and left style values
    const canvas_top = parseInt(get_style("canvas", "top"));
    const canvas_left = parseInt(get_style("canvas", "left"));

    // If the WASD keys are pressed, pan the canvas by adding or subtracting the pan amount from the canvas top or left style values.
    if (event.code == "KeyD") this.canvas.style.left = canvas_left - this.pan_amount + "px";
    else if (event.code == "KeyA") this.canvas.style.left = canvas_left + this.pan_amount + "px";
    else if (event.code == "KeyS") this.canvas.style.top = canvas_top - this.pan_amount + "px";
    else if (event.code == "KeyW") this.canvas.style.top = canvas_top + this.pan_amount + "px";
    // If the 1-6 keys are pressed, change the current mode.
    else if (event.code == "Digit1") this.mode = Modes[ModesEnum.IDLE];
    else if (event.code == "Digit2") this.mode = Modes[ModesEnum.PAN];
    else if (event.code == "Digit3") this.mode = Modes[ModesEnum.GOAL];
    else if (event.code == "Digit4") this.mode = Modes[ModesEnum.WALL];
    else if (event.code == "Digit5") this.mode = Modes[ModesEnum.RADIOACTIVE];
    else if (event.code == "Digit6") this.mode = Modes[ModesEnum.REMOVE];

    // Display the current mode on the DOM
    DOMElements.mode.innerHTML = this.mode;
  }

  // Panning controls
  public handle_mouse_wheel(event: WheelEvent): void {
    // Handle mouse wheel event for zooming and panning
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

  // Highlight cell action.
  public handle_mouse_move(): void {
    // Handle mouse move event to highlight cells
    this.grid.set_cell_highlighted(this.mouse.prev_grid_coord, false);
    this.grid.set_cell_highlighted(this.mouse.grid_coord, true);
  }

  // Handle mouse leave canvas.
  public handle_mouse_leave(): void {
    // Handle mouse leave event
    // const cell = this.grid.get_cell_at(this.mouse.grid_coord);
    // if (cell.is_highlighted) {
    //   this.grid.set_cell_highlighted(this.mouse.grid_coord, false);
    // }
  }
}
