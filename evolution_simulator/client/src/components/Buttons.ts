import Simulation from "../controllers/simulation.controller";
import { DOMElements } from "./DOMElements";

// Register event listener for downloading the neural network as SVG
export function register_download_neuralnet_button(): void {
  DOMElements.export_neuralnet.addEventListener("click", () => {
    const svg = document.querySelector("svg");
    if (svg) {
      const as_text = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([as_text], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const window = open(url);
      window!.onload = (): void => {
        URL.revokeObjectURL(url);
      };
    }
  });
}

// Register event listener for the rendering enabled button
export function register_rendering_enabled_button(simulation: Simulation): void {
  DOMElements.rendering_enabled.addEventListener("click", () => {
    simulation.rendering_enabled = !simulation.rendering_enabled;
    DOMElements.rendering_enabled.innerHTML = "Rendering " + (simulation.rendering_enabled ? "ON" : "OFF");
    if (simulation.is_running) {
      simulation.stop_engine();
      simulation.start_engine();
    }
  });
}

// Register event listener for the restart button
export function register_sim_restart_button(): void {
  DOMElements.sim_restart.addEventListener("click", () => {
    const restart = confirm("Are you sure you would like to restart?");
    if (restart) {
      window.location.reload();
    }
  });
}

// Register event listener for the start/stop button
export function register_sim_start_stop_button(simulation: Simulation): void {
  DOMElements.sim_start_stop.addEventListener("click", () => {
    if (simulation.is_running) {
      simulation.stop_engine();
      DOMElements.sim_start_stop.innerHTML = "START";
    } else {
      let result = simulation.start_engine();
      if (result) DOMElements.sim_start_stop.innerHTML = "STOP";
    }
  });
}

// Register sidebar button event listener.
export function register_sidebar_button() {
  let shown = false;

  DOMElements.button.addEventListener("click", () => {
    shown = !shown;
    if (shown == true) {
      DOMElements.sidebar.style.display = "block";
    } else {
      DOMElements.sidebar.style.display = "none";
    }
  });
}

// Register event listener for the FPS sliders
export function register_fps_sliders(simulation, config) {
  DOMElements.target_update_fps_slider.max = config.TARGET_UPDATE_MAX_FPS.toString();
  DOMElements.target_update_fps_slider.value = config.TARGET_UPDATE_FPS.toString();
  DOMElements.target_update_fps_slider.addEventListener("input", () => {
    let fps = 0;

    if (DOMElements.target_update_fps_slider.value === DOMElements.target_update_fps_slider.max) {
      DOMElements.slider_label.innerHTML = "MAX";
      fps = Number.MAX_SAFE_INTEGER;
    } else if (DOMElements.target_update_fps_slider.value == DOMElements.target_update_fps_slider.min) {
      DOMElements.slider_label.innerHTML = "1";
      fps = 1;
    } else {
      DOMElements.slider_label.innerHTML = DOMElements.target_update_fps_slider.value;
      fps = parseInt(DOMElements.target_update_fps_slider.value, 10);
    }

    config.TARGET_UPDATE_FPS = fps;

    if (simulation.is_running) {
      simulation.restart_engine();
    }
  });
}
