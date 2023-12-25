import { SimulationConfig } from "../config/simulation.config";
import World from "../core/World";

export default class SimulationController {
  public target_update_fps: number;
  public target_render_fps: number;
  public current_update_fps: number;
  public current_render_fps: number;

  public is_running: boolean;
  public rendering_enabled: boolean;
  public world: World;

  public last_update_time: number;
  public last_render_time: number;
  public last_update_dt: number;
  public last_render_dt: number;
  public update_loop: NodeJS.Timer | undefined;
  public render_loop: NodeJS.Timer | undefined;

  public target_update_fps_element: HTMLSpanElement | null;
  public target_render_fps_element: HTMLSpanElement | null;
  public current_update_fps_element: HTMLSpanElement | null;
  public current_render_fps_element: HTMLSpanElement | null;

  constructor(config: typeof SimulationConfig) {
    this.target_update_fps = config.TARGET_UPDATE_FPS;
    this.target_render_fps = config.TARGET_RENDER_FPS;

    this.current_update_fps = 0;
    this.current_render_fps = 0;

    this.is_running = false;
    this.last_update_time = window.performance.now();
    this.last_render_time = window.performance.now();
    this.last_update_dt = 0;
    this.last_render_dt = 0;
    this.update_loop = undefined;
    this.render_loop = undefined;
    this.rendering_enabled = true;
    this.world = new World("canvas", config.CANVAS_SIZE, config.GRID_SIZE);

    this.target_update_fps_element = document.getElementById("target_update_fps");
    this.target_render_fps_element = document.getElementById("target_render_fps");
    this.current_update_fps_element = document.getElementById("current_update_fps");
    this.current_render_fps_element = document.getElementById("current_render_fps");

    this.target_render_fps_element!.innerHTML = SimulationConfig.TARGET_RENDER_FPS.toString();

    this.setup_render_loop();
  }

  public setup_render_loop(): void {
    if (this.rendering_enabled) {
      this.render_loop = setInterval(() => {
        this.render_simulation();
      }, 1000 / this.target_render_fps);
    }
  }

  public start(): void {
    if (this.render_loop != undefined) {
      clearInterval(this.render_loop);
      this.render_loop = undefined;
    }
    if (!this.world.world_initialized) this.world.initalize();
    if (!this.is_running) {
      this.is_running = true;

      /** Boot up the update loop. */
      this.update_loop = setInterval(() => {
        /** Update the simulation. */
        this.update_simulation();
        /** Check if current FPS can handle rendering too. */
        if (this.current_update_fps >= this.target_render_fps && this.render_loop != undefined) {
          clearInterval(this.render_loop);
          this.render_loop = undefined;
        } else {
          if (this.current_render_fps < this.target_render_fps && this.render_loop == undefined) {
            this.setup_render_loop();
          }
        }
      }, 1000 / this.target_update_fps);
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

  public update_dom_update_fps(): void {
    const current_update_fps = document.getElementById("current_update_fps") as HTMLSpanElement;
    current_update_fps.innerHTML = Math.round(this.current_update_fps).toString();
  }

  public update_dom_current_fps(): void {
    this.update_dom_update_fps();
    const current_render_fps = document.getElementById("current_render_fps") as HTMLSpanElement;
    current_render_fps.innerHTML = Math.round(this.current_render_fps).toString();
  }

  public update_simulation(): void {
    this.last_update_dt = window.performance.now() - this.last_update_time;
    this.last_update_time = window.performance.now();
    this.current_update_fps = 1000 / this.last_update_dt;
    this.current_render_fps = 1000 / this.last_render_dt;
    this.world.update();

    if (this.render_loop === undefined && this.rendering_enabled) {
      this.render_simulation();
    } else {
      this.update_dom_update_fps();
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
    this.world.render();
    this.update_dom_current_fps();
  }
}
