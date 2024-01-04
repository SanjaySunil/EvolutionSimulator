import { SimulationConfig } from "./config";
import {
  register_download_neuralnet_button,
  register_export_all_organisms_button,
  register_export_simulation_button,
  register_import_button,
  register_rendering_enabled_button,
  register_sim_restart_button,
  register_sim_start_stop_button
} from "./controllers/button.controller";
import Simulation from "./controllers/simulation.controller";
import { render_settings } from "./controllers/ui.controller";

function read_fps_slider(config, slider, label): void {
  const slider_label = document.getElementById(label) as HTMLSpanElement;
  let fps = 0;

  if (slider.value === slider.max) {
    slider_label.innerHTML = "MAX";
    fps = Number.MAX_SAFE_INTEGER;
  } else if (slider.value == slider.min) {
    slider_label.innerHTML = "1";
    fps = 1;
  } else {
    slider_label.innerHTML = slider.value;
    fps = parseInt(slider.value, 10);
  }

  config.TARGET_UPDATE_FPS = fps;
}

function slider(simulation, config, slider, label): void {
  if (simulation.is_running) {
    read_fps_slider(config, slider, label);
    simulation.restart();
  } else {
    read_fps_slider(config, slider, label);
  }
}

let shown = false;
const button = document.getElementById("open_sidebar") as HTMLButtonElement;
const sidebar = document.getElementById("sidebar") as HTMLDivElement;

button.addEventListener("click", () => {
  shown = !shown;

  if (shown == true) {
    sidebar.style.display = "block";
  } else {
    sidebar.style.display = "none";
  }
});

const config = SimulationConfig;
const simulation = new Simulation(config);

const target_update_fps_slider = document.getElementById("target_update_fps_slider") as HTMLInputElement;
target_update_fps_slider.max = config.TARGET_UPDATE_MAX_FPS.toString();
target_update_fps_slider.value = config.TARGET_UPDATE_FPS.toString();

target_update_fps_slider.addEventListener("input", () => slider(simulation, config, target_update_fps_slider, "target_update_fps"));

render_settings(config);
register_rendering_enabled_button(simulation);
register_sim_restart_button();
register_sim_start_stop_button(simulation);
register_download_neuralnet_button();
register_import_button(simulation);
register_export_all_organisms_button(simulation);
register_export_simulation_button(simulation, config);
