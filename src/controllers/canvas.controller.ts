import { calculate_fitness } from "../algorithms/GeneticAlgorithm";
import { draw_neural_net_brain } from "../algorithms/NeuralNetDiagram";
import { DOMElements } from "../components/DOMElements";
import { DefaultSimulationConfig } from "../config/simulation.config";
import { CellStates, Grid } from "../environment/Grid";
import { Coordinate } from "../types/Coordinate";
import { max_distance_to_point } from "../utils/get_max_distance";
import get_style from "../utils/get_style";
import { Mouse, MouseModeSymbols, MouseModes } from "./mouse.controller";
import Renderer from "./renderer.controller";

/** Class to handle canvas-related events. */
export default class Canvas {
  public canvas: HTMLCanvasElement;
  public config: typeof DefaultSimulationConfig;
  public ctx: CanvasRenderingContext2D;
  public goal_coordinates: Coordinate[];
  public grid: Grid;
  public grid_size: number;
  public max_distances_to_goal: number[];
  public min_zoom: number;
  public mouse: Mouse;
  public pan_amount: number;
  public pixel_size: number;
  public renderer: Renderer;
  public zoom_level: number;
  public zoom_speed: number;

  /**
   * Instantiates a new Canvas.
   * @param canvas_id - The ID of the canvas to render the environment on.
   * @param config - The configuration to use for the environment.
   */
  constructor(canvas_id: string, config: typeof DefaultSimulationConfig) {
    this.config = config;
    // Get the canvas element and its 2D rendering context
    this.canvas = document.getElementById(canvas_id) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    // Set the canvas dimensions based on the grid size
    this.canvas.width = this.canvas.height = this.config.GRID_SIZE * 15;
    this.grid_size = this.config.GRID_SIZE;
    // Calculate the pixel size based on the grid size
    this.pixel_size = (this.config.GRID_SIZE * 15) / this.grid_size;
    this.zoom_level = 0.4;
    this.zoom_speed = 0.01;
    this.min_zoom = 0.1;
    this.pan_amount = 50;
    // Create a new mouse, renderer, and grid
    this.mouse = new Mouse(this.pixel_size, this.grid_size);
    this.renderer = new Renderer(this.canvas, this.ctx, this.pixel_size);
    this.grid = new Grid(this.grid_size, this.renderer);
    this.goal_coordinates = [];
    this.max_distances_to_goal = [];
    // Set the initial zoom level and transform the canvas accordingly
    this.canvas.style.transform = `scale(${this.zoom_level})`;
    // Register mouse and keyboard events
    this.register_mouse_events();
    this.register_keyboard_events();
    // Clear the canvas.
    this.renderer.clear_canvas();
  }

  /** Checks and performs mouse-related actions based on the current mode */
  private check_mouse_events(): void {
    // Check if the left mouse button is clicked
    if (this.mouse.left_click) {
      // Get the cell at the current mouse position
      const cell = this.grid.get_cell_at(this.mouse.grid_coord);
      // If the current mode is goal, check if the cell is selected, and add or remove it from the goal coordinates.
      if (this.mouse.mode == MouseModes.GOAL) {
        if (cell.is_selected) {
          // Remove selected goal coordinate and its max distance
          this.goal_coordinates.splice(this.goal_coordinates.indexOf(cell.coordinate), 1);
          this.max_distances_to_goal.splice(this.goal_coordinates.indexOf(cell.coordinate), 1);
          this.grid.set_cell_selected(cell.coordinate, false);
        } else {
          // Add selected goal coordinate and its max distance
          this.goal_coordinates.push(cell.coordinate);
          this.max_distances_to_goal.push(max_distance_to_point(this.config.GRID_SIZE, cell.coordinate.x, cell.coordinate.y));
          this.grid.set_cell_selected(cell.coordinate, true);
        }
      } else if (this.mouse.mode == MouseModes.IDLE) {
        // If the current mode is idle, check if the cell is an organism, and create its neural network diagram.
        if (cell.state == CellStates.ORGANISM && cell.owner?.brain.connections) {
          // Display selected organism's neural network diagram
          DOMElements.select_organism_info.style.display = "none";
          DOMElements.organism_selected_text.innerHTML = "Organism selected";
          DOMElements.export_neuralnet_button.style.display = "block";
          DOMElements.organism_info.style.display = "block";

          // Calculate and display the fitness score of the selected organism
          if (this.config.GOAL_COORD) {
            DOMElements.fitness_score.innerHTML = calculate_fitness(cell.owner, "coord", {
              goal_coordinates: this.goal_coordinates,
              max_distances_to_goal: this.max_distances_to_goal,
            }).toFixed(2);
          } else if (this.config.GOAL_FOOD) {
            DOMElements.fitness_score.innerHTML = calculate_fitness(cell.owner, "food").toFixed(2);
          }

          // Draw the neural network diagram of the selected organism
          draw_neural_net_brain(cell.owner.brain.connections);
        } else {
          // Clear organism selected message and hide neural network diagram download button.
          DOMElements.select_organism_info.style.display = "block";
          DOMElements.organism_selected_text.innerHTML = "";
          DOMElements.export_neuralnet_button.style.display = "none";
          DOMElements.organism_info.style.display = "none";
          DOMElements.fitness_score.innerHTML = "N/A";
        }
      } else if (this.mouse.mode == MouseModes.PAN) {
        // If the current mode is pan, move the canvas based on the mouse movement.
        const canvas_top = parseInt(get_style("canvas", "top"));
        const canvas_left = parseInt(get_style("canvas", "left"));
        // Add the difference between the current mouse position and the clicked mouse position to the canvas position.
        this.canvas.style.top = canvas_top + (this.mouse.canvas_coord.y - this.mouse.clicked_coord.y) * this.zoom_level + "px";
        this.canvas.style.left = canvas_left + (this.mouse.canvas_coord.x - this.mouse.clicked_coord.x) * this.zoom_level + "px";
      } else if (this.mouse.mode == MouseModes.WALL) {
        // If the current mode is wall and there is no owner in the selected cell, set the cell state to wall.
        if (!cell.owner) {
          this.grid.set_cell_state(this.mouse.grid_coord, CellStates.WALL);
        }
      } else if (this.mouse.mode == MouseModes.RADIOACTIVE) {
        // If the current mode is radioactive and there is no owner in the selected cell, set the cell state to radioactive.
        if (!cell.owner) {
          this.grid.set_cell_state(this.mouse.grid_coord, CellStates.RADIOACTIVE);
        }
      } else if (this.mouse.mode == MouseModes.REMOVE) {
        // If the current mode is remove and there is no owner in the selected cell, clear the cell state.
        if (!cell.owner) {
          this.grid.clear_cell_state(this.mouse.grid_coord);
        }
      }
    }
  }

  /**
   * Handles keyboard key down events.
   * @param event - The keyboard event.
   */
  private handle_key_down(event: KeyboardEvent): void {
    // Obtain canvas top and left style values
    const canvas_top = parseInt(get_style("canvas", "top"));
    const canvas_left = parseInt(get_style("canvas", "left"));

    // If the WASD keys are pressed, pan the canvas by adding or subtracting the pan amount from the canvas top or left style values.
    if (event.code == "KeyD") this.canvas.style.left = canvas_left - this.pan_amount + "px";
    else if (event.code == "KeyA") this.canvas.style.left = canvas_left + this.pan_amount + "px";
    else if (event.code == "KeyS") this.canvas.style.top = canvas_top - this.pan_amount + "px";
    else if (event.code == "KeyW") this.canvas.style.top = canvas_top + this.pan_amount + "px";
    // If the 1-6 keys are pressed, change the current mode.
    else if (event.code == "Digit1") this.mouse.mode = MouseModes.IDLE;
    else if (event.code == "Digit2") this.mouse.mode = MouseModes.PAN;
    else if (event.code == "Digit3" && this.config.GOAL_COORD) this.mouse.mode = MouseModes.GOAL;
    else if (event.code == "Digit3" && !this.config.GOAL_COORD) {
      alert("Goal coordinates are disabled when the food goal is enabled.");
    } else if (event.code == "Digit4") this.mouse.mode = MouseModes.WALL;
    else if (event.code == "Digit5") this.mouse.mode = MouseModes.RADIOACTIVE;
    else if (event.code == "Digit6") this.mouse.mode = MouseModes.REMOVE;

    // Display the current mode on the DOM
    DOMElements.current_mode.innerHTML = MouseModeSymbols[this.mouse.mode];
  }

  /** Registers mouse events on the canvas. */
  private register_mouse_events(): void {
    // Register mouse events on the canvas.
    this.canvas.addEventListener("mousemove", (e) => this.mouse_move(e));
    this.canvas.addEventListener("mouseup", (e) => this.mouse_up(e));
    this.canvas.addEventListener("mousedown", (e) => this.mouse_down(e));
    this.canvas.addEventListener("mouseenter", (e) => this.mouse_enter(e));
    this.canvas.addEventListener("mouseleave", () => this.mouse_leave());
    this.canvas.addEventListener("wheel", (e) => this.wheel(e));
  }

  /** Registers keyboard events on the window. */
  private register_keyboard_events(): void {
    // When a key is pressed, handle the key down event.
    window.addEventListener("keydown", (e) => {
      this.handle_key_down(e);
    });
  }

  /**
   * Handles mouse move event.
   * @param event - The mouse move event.
   */
  private mouse_move(event: MouseEvent): void {
    this.mouse.mouse_move(event);
    this.handle_mouse_move();
    this.check_mouse_events();
  }

  /**
   * Handles mouse up event.
   * @param event - The mouse up event.
   */
  private mouse_up(event: MouseEvent): void {
    this.mouse.mouse_up(event);
  }

  /**
   * Handles mouse down event.
   * @param event - The mouse down event.
   */
  private mouse_down(event: MouseEvent): void {
    this.mouse.mouse_down(event);
    this.check_mouse_events();
  }

  /**
   * Handles mouse enter event.
   * @param event - The mouse enter event.
   */
  private mouse_enter(event: MouseEvent): void {
    this.mouse.mouse_enter(event);
    this.handle_mouse_move();
  }

  /**
   * Handles mouse leave event.
   * @param event - The mouse leave event.
   */
  private mouse_leave(): void {
    this.mouse.mouse_leave();
    this.handle_mouse_leave();
  }

  /**
   * Handles mouse wheel event.
   * @param event - The mouse wheel event.
   */
  private wheel(event: WheelEvent): void {
    this.handle_mouse_wheel(event);
  }

  // Handles mouse wheel event for zooming and panning
  private handle_mouse_wheel(event: WheelEvent): void {
    // Determine the direction of mouse wheel scroll
    const sign = -Math.sign(event.deltaY);

    // Calculate the scale by taking the maximum between the minimum zoom level and the current zoom level plus the sign of the mouse wheel scroll multiplied by the zoom speed.
    const scale = Math.max(this.min_zoom, this.zoom_level + sign * this.zoom_speed);

    // Obtain the current top and left style values for the canvas
    const canvas_top = parseInt(get_style("canvas", "top"));
    const canvas_left = parseInt(get_style("canvas", "left"));

    // Calculate the displacement in X and Y from zooming
    const dx = (this.canvas.width / 2 - this.mouse.canvas_coord.x) * (scale - this.zoom_level);
    const dy = (this.canvas.height / 2 - this.mouse.canvas_coord.y) * (scale - this.zoom_level);

    // Update the top and left styles for canvas based on the zoom level and mouse position
    this.canvas.style.top = canvas_top + dy + "px";
    this.canvas.style.left = canvas_left + dx + "px";

    // Update the zoom level and apply the CSS scale transformation to the canvas
    this.zoom_level = scale;
    this.canvas.style.transform = `scale(${this.zoom_level})`;
  }

  // Handles the action to highlight cells upon mouse move.
  private handle_mouse_move(): void {
    // Clear the highlight from the previously highlighted cell
    this.grid.set_cell_highlighted(this.mouse.prev_grid_coord, false);
    // Set the current cell under the mouse pointer as highlighted
    this.grid.set_cell_highlighted(this.mouse.grid_coord, true);
  }

  // Handle mouse leave canvas.
  private handle_mouse_leave(): void {
    // Handle mouse leave event
    const cell = this.grid.get_cell_at(this.mouse.grid_coord);
    if (cell.is_highlighted) {
      this.grid.set_cell_highlighted(this.mouse.grid_coord, false);
    }
  }
}
