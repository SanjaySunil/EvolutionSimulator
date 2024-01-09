import { render_fps_element } from "../components/Settings";
import { DefaultSimulationConfig } from "../config/simulation.config";
import { Environment } from "../environment";
import { DOMElements } from "../components/DOMElements";

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
    this.environment = new Environment("canvas", this.config);

    // Setup render loop
    this.setup_render_loop();

    // Render target update and render FPS elements
    render_fps_element(DOMElements.target_update_fps, this.config.TARGET_UPDATE_FPS);
    render_fps_element(DOMElements.target_render_fps, this.config.TARGET_RENDER_FPS);
  }

  // Runs prechecks to validate the configuration before execution.
  public run_prechecks(): boolean {
    // Check if the population size exceeds the maximum allowed grid size
    if (this.config.POPULATION > this.config.GRID_SIZE ** 2) {
      const error = "Population size cannot be greater than Grid size squared.";
      alert(error);
      return false;
    }

    // Check if no goal has been set.
    if (!this.config.GOAL_COORD && !this.config.GOAL_FOOD) {
      alert("No goal has been set.");
      return false;
    }

    // Check if coordinate goal and food goal are both enabled.
    if (this.config.GOAL_COORD && this.config.GOAL_FOOD) {
      alert("Cannot have both coordinate and food goal enabled.");
      return false;
    }

    // Check if coordinate goal is enabled and no goal coordinates have been set.
    if (this.config.GOAL_COORD && this.environment.goal_coordinates.length == 0) {
      alert("No goal coordinates have been set.");
      return false;
    }

    // Checks have passed, so return true.
    return true;
  }

  // Method to initialize the simulation
  public init(): void {
    // Initialize the environment
    this.environment.init();
    // Set the started_simulation flag to true.
    this.started_simulation = true;
  }

  // Setup the render loop
  public setup_render_loop(): void {
    // Check if rendering is enabled
    if (this.rendering_enabled) {
      // Setup the render loop
      this.render_loop = setInterval(() => {
        this.render_simulation();
      }, 1000 / this.config.TARGET_RENDER_FPS);
    }
  }

  // Function to start the simulation engine.
  public start_engine(): boolean {
    // Run prechecks to validate the configuration before execution.
    if (!this.run_prechecks()) return false;
    // Check if simulation has been started before.
    if (!this.started_simulation) this.init();

    // Check if render loop is running and stop it if it is.
    if (this.render_loop != undefined) {
      clearInterval(this.render_loop);
      this.render_loop = undefined;
    }

    // Check if the simulation is not running.
    if (!this.is_running) {
      // Set the is_running flag to true.
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

        // Check if the current update FPS is greater than or equal to the target update FPS.
        if (this.current_update_fps >= this.config.TARGET_RENDER_FPS && this.render_loop != undefined) {
          // Stop the render loop
          clearInterval(this.render_loop);
          this.render_loop = undefined;
        } else {
          // Check if the current render FPS is less than the target render FPS and the render loop is not running.
          if (this.current_render_fps < this.config.TARGET_RENDER_FPS && this.render_loop == undefined) {
            // Start the render loop.
            this.setup_render_loop();
          }
        }
      }, 1000 / this.config.TARGET_UPDATE_FPS);
    }
    return true;
  }

  // Method to stop the simulation engine.
  public stop_engine(): void {
    if (this.is_running) {
      this.is_running = false;
      clearInterval(this.update_loop);
      clearInterval(this.render_loop);
      this.setup_render_loop();
    }
  }

  // Method or restart the simulation engine.
  public restart_engine(): void {
    this.stop_engine();
    this.start_engine();
  }

  // Method to update the simulation.
  public update_simulation(): void {
    // Calculate the time since the last update by subtracting the current time from the last update time.
    this.last_update_dt = window.performance.now() - this.last_update_time;
    // Set the last update time to the current time.
    this.last_update_time = window.performance.now();
    // Calculate the current update FPS by dividing 1000 by the last update delta time.
    this.current_update_fps = 1000 / this.last_update_dt;
    // Update the environment.
    this.environment.update();

    // Check if the render loop is not running and rendering is enabled.
    if (this.render_loop === undefined && this.rendering_enabled) {
      // Render the simulation
      this.render_simulation();
    } else {
      // Update current FPS
      render_fps_element(DOMElements.current_update_fps, this.current_update_fps);
    }
  }

  // Method to render the simulation.
  public render_simulation(): void {
    // Check if the render loop is running.
    if (this.render_loop) {
      // Calculate the time since the last render by subtracting the current time from the last render time.
      this.last_render_dt = window.performance.now() - this.last_render_time;
      // Set the last render time to the current time.
      this.last_render_time = window.performance.now();
    } else {
      // Set the last render time to match the last update time.
      this.last_render_dt = this.last_update_dt;
    }

    // Calculate the current render FPS by dividing 1000 by the last render delta time.
    this.current_render_fps = 1000 / this.last_render_dt;

    // Render the environment.
    this.environment.render();

    // Update FPS elements.
    render_fps_element(DOMElements.current_update_fps, this.current_update_fps);
    render_fps_element(DOMElements.current_render_fps, this.current_render_fps);
  }
}
