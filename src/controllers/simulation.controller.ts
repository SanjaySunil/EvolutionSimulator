import { SimulationConfig } from "../config";
import { Environment } from "../environment";
import { render_fps_element } from "./ui.controller";

const target_update_fps = document.getElementById("target_update_fps") as HTMLSpanElement;
const target_render_fps = document.getElementById("target_render_fps") as HTMLSpanElement;
const current_update_fps = document.getElementById("current_update_fps") as HTMLSpanElement;
const current_render_fps = document.getElementById("current_render_fps") as HTMLSpanElement;

const tick_count = document.getElementById("tick_count") as HTMLSpanElement;
const generation = document.getElementById("generation") as HTMLSpanElement;

const best_fitness = document.getElementById("best_fitness") as HTMLSpanElement;
const overall_fitness = document.getElementById("overall_fitness") as HTMLSpanElement;
const organisms_alive = document.getElementById("organisms_alive") as HTMLSpanElement;
const organisms_dead = document.getElementById("organisms_dead") as HTMLSpanElement;


export default class Simulation {
  public target_update_fps: number;
  public current_update_fps: number;
  public last_update_time: number;
  public last_update_dt: number;

  public target_render_fps: number;
  public current_render_fps: number;
  public last_render_time: number;
  public last_render_dt: number;

  public is_running: boolean;
  public rendering_enabled: boolean;
  public started_simulation: boolean;
  public first_simulation: boolean;

  public config: typeof SimulationConfig;
  public update_loop: NodeJS.Timeout | undefined;
  public render_loop: NodeJS.Timeout | undefined;

  public environment: Environment;
  public cached_population: any[];

  constructor(config: typeof SimulationConfig = SimulationConfig) {
    this.config = config;

    /** Update */
    this.target_update_fps = this.config.TARGET_UPDATE_FPS;
    this.current_update_fps = 0;
    this.last_update_time = window.performance.now();
    this.last_update_dt = 0;

    /** Render */
    this.target_render_fps = this.config.TARGET_RENDER_FPS;
    this.current_render_fps = 0;
    this.last_render_time = window.performance.now();
    this.last_render_dt = 0;

    this.is_running = false;
    this.rendering_enabled = true;
    this.started_simulation = false;
    this.first_simulation = true;

    /** Loops */
    this.update_loop = undefined;
    this.render_loop = undefined;

    this.cached_population = [];
    this.environment = new Environment("canvas", this.config);

    this.setup_render_loop();

    /** */
    render_fps_element(target_update_fps, this.config.TARGET_UPDATE_FPS);
    render_fps_element(target_render_fps, this.config.TARGET_RENDER_FPS);
  }

  public init(): void {
    if (!this.started_simulation) {
      /** Clone and place new canvas, in case changes have been made to Grid size.
       * Cloning is necessary to delete all previous canvas event listeners such as
       * zoom and panning. */

      if (!this.first_simulation) {
        const old_canvas = document.getElementById("canvas")!;
        const new_canvas = old_canvas.cloneNode(true);
        old_canvas.parentNode!.replaceChild(new_canvas, old_canvas);
        this.environment = new Environment("canvas", this.config);
      }

      if (this.cached_population.length > 0) {
        for (const org of this.cached_population) {
          this.environment.add_organism(org.coordinate, org.genome);
        }
        console.log(this.cached_population);
      } else {
        this.environment.init();

      }

      this.started_simulation = true;
    }
  }

  public setup_render_loop(): void {
    if (this.rendering_enabled) {
      this.render_loop = setInterval(() => { this.render_simulation(); }, 1000 / this.config.TARGET_RENDER_FPS);
    }
  }

  public start(): void {
    this.init();
    if (this.render_loop != undefined) {
      clearInterval(this.render_loop);
      this.render_loop = undefined;
    }
    if (!this.is_running) {
      this.is_running = true;

      /** Boot up the update loop. */
      this.update_loop = setInterval(() => {
        /** Update the simulation. */
        this.update_simulation();

        tick_count.innerHTML = this.environment.ticks.toString();
        generation.innerHTML = this.environment.generation.toString();
        best_fitness.innerHTML = this.environment.best_fitness.toPrecision(3).toString();
        overall_fitness.innerHTML = this.environment.overall_fitness.toPrecision(3).toString();
        organisms_alive.innerHTML = this.environment.alive.toString();
        organisms_dead.innerHTML = (this.environment.population.length - this.environment.alive).toString();

        /** Check if current FPS can handle rendering too. */
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
  }

  public stop(): void {
    if (this.is_running) {
      this.is_running = false;
      clearInterval(this.update_loop);
      clearInterval(this.render_loop);
      this.setup_render_loop();
    }
  }

  public restart(): void {
    this.stop();
    this.start();
  }

  public update_simulation(): void {
    this.last_update_dt = window.performance.now() - this.last_update_time;
    this.last_update_time = window.performance.now();
    this.current_update_fps = 1000 / this.last_update_dt;
    this.environment.update();

    if (this.render_loop === undefined && this.rendering_enabled) {
      this.render_simulation();
    } else {
      /** Update current FPS. */
      render_fps_element(current_update_fps, this.current_update_fps);
    }
  }

  public render_simulation(): void {
    if (this.render_loop) {
      this.last_render_dt = window.performance.now() - this.last_render_time;
      this.last_render_time = window.performance.now();
    } else {
      this.last_render_dt = this.last_update_dt;
    }
    this.current_render_fps = 1000 / this.last_render_dt;
    this.environment.render();
    /** Update Current FPS */
    render_fps_element(current_update_fps, this.current_update_fps);
    render_fps_element(current_render_fps, this.current_render_fps);
  }
}
