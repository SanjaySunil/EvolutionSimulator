import { SimulationConfig } from "../NEA/src/config/simulation.config";
import World from "../NEA/src/environment/World";

/** Simulation class. */
export default class Simulation {
  /** Target FPS for the simulation. */
  public target_fps: number;
  /** Current running FPS of the simulation. */
  public current_fps: number;
  /** Delta time since last update. */
  public dt: number;
  /** Last update timestamp. */
  public last_update: number;
  /** Whether or not the simulation is running. */
  public is_running: boolean;
  /** Simulation Loop ID. */
  public loop: number | NodeJS.Timer | undefined;
  /** Simulation World environment. */
  public environment: World;
  /** Whether or not simulation FPS boost is enabled. */
  public boost: boolean;

  public then: number;

  /** Build a new simulation. */
  constructor(public config: typeof SimulationConfig) {
    this.target_fps = config.FPS;
    this.current_fps = 0;
    this.dt = 0;
    this.last_update = Date.now();

    this.then = window.performance.now();

    this.is_running = false;
    this.loop;
    this.boost = false;
    this.environment = new World("canvas", config.CANVAS_SIZE, config.GRID_SIZE);
    this.start();

    /** Update DOM Target FPS */
    const target_fps_element = document.getElementById("target_fps") as HTMLSpanElement;
    target_fps_element.innerHTML = Math.round(this.target_fps).toString();
  }

  /** Set FPS method. */
  public set_fps(new_fps: number): void {
    this.target_fps = new_fps;
    // Adjust the loop if it's running
    if (this.is_running) {
      this.stop();
      this.start();
    }
  }

  /** Update DOM Actual FPS */
  public update_fps(): void {
    const current_fps_element = document.getElementById("current_fps") as HTMLSpanElement;
    current_fps_element.innerHTML = Math.round(this.current_fps).toString();
  }

  /** Start the animation frame. */
  public start(): void {
    if (!this.is_running) {
      this.is_running = true;
      if (this.boost) {
        this.loop = setInterval(() => {
          this.update_simulation();
        }, 1000 / this.target_fps);
      } else this.smooth_update_simulation();
    }
  }

  /**
   * Simulation update loop using window.requestAnimationFrame. Arrow function
   * is used to bind `this`.
   */
  public smooth_update_simulation = (): void => {
    /** `requestAnimationFrame` is much more smoother compared to setInterval. */
    if (this.is_running) {
      this.loop = requestAnimationFrame(this.smooth_update_simulation);
      const now = window.performance.now();
      const ms_passed = now - this.then;

      if (ms_passed > 1000 / this.target_fps) {
        const excess_time = (ms_passed % 1000) / this.target_fps;
        this.then = now - excess_time;
        this.update_simulation();
      }
    }
  };

  /** Stops the animation frame. */
  public stop(): void {
    this.is_running = false;
    if (this.loop) {
      if (this.boost) clearInterval(this.loop as NodeJS.Timer);
      else cancelAnimationFrame(this.loop as number);
    }
  }

  /** Switch between boost and smooth animation. */
  public switch_mode(): void {
    this.stop();
    this.boost = !this.boost;
    this.start();
  }

  /** Update the simulation. */
  private update_simulation(): void {
    const now = Date.now();
    this.dt = now - this.last_update;
    this.last_update = now;
    this.current_fps = 1000 / this.dt;
    this.update_fps();
    this.environment.update();
  }
}
