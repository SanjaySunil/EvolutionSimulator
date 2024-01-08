import { render_fps_element } from "../components/Settings";
import { DefaultSimulationConfig } from "../config/simulation.config";
import { Environment } from "../environment";
import { DOMElements } from "../components/DOMElements";

// Get references to HTML elements

// Define the Simulation class
export default class Simulation {
  // Define properties for update loop
  public target_update_fps: number;
  public current_update_fps: number;
  public last_update_time: number;
  public last_update_dt: number;

  // Define properties for render loop
  public target_render_fps: number;
  public current_render_fps: number;
  public last_render_time: number;
  public last_render_dt: number;

  // Define other properties
  public is_running: boolean;
  public rendering_enabled: boolean;
  public started_simulation: boolean;
  public first_simulation: boolean;

  // Define configuration and loop variables
  public config: typeof DefaultSimulationConfig;
  public update_loop: NodeJS.Timeout | undefined;
  public render_loop: NodeJS.Timeout | undefined;

  // Define environment and population variables
  public environment: Environment;
  public cached_organisms: [];

  // Constructor for the Simulation class
  constructor(config: typeof DefaultSimulationConfig) {
    this.config = config;

    // Initialize update loop properties
    this.target_update_fps = this.config.TARGET_UPDATE_FPS;
    this.current_update_fps = 0;
    this.last_update_time = window.performance.now();
    this.last_update_dt = 0;

    // Initialize render loop properties
    this.target_render_fps = this.config.TARGET_RENDER_FPS;
    this.current_render_fps = 0;
    this.last_render_time = window.performance.now();
    this.last_render_dt = 0;

    // Initialize other properties
    this.is_running = false;
    this.rendering_enabled = true;
    this.started_simulation = false;
    this.first_simulation = true;

    // Initialize loop variables
    this.update_loop = undefined;
    this.render_loop = undefined;

    // Initialize population and environment
    this.cached_organisms = [];
    this.environment = new Environment("canvas", this.config);

    // Setup render loop
    this.setup_render_loop();

    // Render target update and render FPS elements
    render_fps_element(DOMElements.target_update_fps, this.config.TARGET_UPDATE_FPS);
    render_fps_element(DOMElements.target_render_fps, this.config.TARGET_RENDER_FPS);
  }

  public run_prechecks(): boolean {
    if (this.cached_organisms.length > this.config.GRID_SIZE ** 2 || this.config.POPULATION > this.config.GRID_SIZE ** 2) {
      let error = "Population size cannot be greater than Grid size squared.";
      alert(error);
      return false;
    }

    if (!this.config.GOAL_COORD && !this.config.GOAL_FOOD) {
      alert('Must have either "Goal is Food" or "Goal is Coordinate" enabled.');
      return false;
    }

    if (this.config.GOAL_COORD && this.config.GOAL_FOOD) {
      alert('Cannot have both "Goal is Food" and "Goal is Coordinate" enabled.');
      return false;
    }

    if (this.config.GOAL_COORD && this.environment.goal_coordinates.length == 0) {
      alert("No goal coordinates have been set.");
      return false;
    }

    return true;
  }

  // Initialize the simulation
  public init(): void {
    this.environment.init();
    this.started_simulation = true;
  }

  // Setup the render loop
  public setup_render_loop(): void {
    if (this.rendering_enabled) {
      this.render_loop = setInterval(() => {
        this.render_simulation();
      }, 1000 / this.config.TARGET_RENDER_FPS);
    }
  }

  // Start the simulation
  public start_engine(): boolean {
    if (!this.run_prechecks()) return false;
    // Check if simulation has been started before.
    if (!this.started_simulation) this.init();

    if (this.render_loop != undefined) {
      clearInterval(this.render_loop);
      this.render_loop = undefined;
    }

    if (!this.is_running) {
      this.is_running = true;

      // Start the update loop
      this.update_loop = setInterval(() => {
        // Update the simulation
        this.update_simulation();

        // Update HTML elements with simulation data
        DOMElements.tick_count.innerHTML = this.environment.ticks.toString();
        DOMElements.generation.innerHTML = this.environment.generation.toString();
        DOMElements.best_fitness.innerHTML = this.environment.best_fitness.toPrecision(3).toString();
        DOMElements.overall_fitness.innerHTML = this.environment.overall_fitness.toPrecision(3).toString();
        DOMElements.organisms_alive.innerHTML = this.environment.alive.toString();
        DOMElements.organisms_dead.innerHTML = (this.environment.population.length - this.environment.alive).toString();

        // Check if current FPS can handle rendering too
        if (this.current_update_fps >= this.config.TARGET_RENDER_FPS && this.render_loop != undefined) {
          clearInterval(this.render_loop);
          this.render_loop = undefined;
        } else {
          if (this.current_render_fps < this.config.TARGET_RENDER_FPS && this.render_loop == undefined) {
            this.setup_render_loop();
          }
        }
      }, 1000 / this.config.TARGET_UPDATE_FPS);
    }
    return true;
  }

  // Stop the simulation
  public stop_engine(): void {
    if (this.is_running) {
      this.is_running = false;
      clearInterval(this.update_loop);
      clearInterval(this.render_loop);
      this.setup_render_loop();
    }
  }

  // Restart the simulation
  public restart_engine(): void {
    this.stop_engine();
    this.start_engine();
  }

  // Update the simulation
  public update_simulation(): void {
    this.last_update_dt = window.performance.now() - this.last_update_time;
    this.last_update_time = window.performance.now();
    this.current_update_fps = 1000 / this.last_update_dt;
    this.environment.update();

    if (this.render_loop === undefined && this.rendering_enabled) {
      this.render_simulation();
    } else {
      // Update current FPS
      render_fps_element(DOMElements.current_update_fps, this.current_update_fps);
    }
  }

  // Render the simulation
  public render_simulation(): void {
    if (this.render_loop) {
      this.last_render_dt = window.performance.now() - this.last_render_time;
      this.last_render_time = window.performance.now();
    } else {
      this.last_render_dt = this.last_update_dt;
    }
    this.current_render_fps = 1000 / this.last_render_dt;
    this.environment.render();

    // Update current FPS
    render_fps_element(DOMElements.current_update_fps, this.current_update_fps);
    render_fps_element(DOMElements.current_render_fps, this.current_render_fps);
  }
}
