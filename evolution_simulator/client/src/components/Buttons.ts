import Simulation from "../controllers/simulation.controller";

// Get references to HTML elements
const button = document.getElementById("open_sidebar") as HTMLButtonElement;
const export_neuralnet = document.getElementById("export_neuralnet") as HTMLButtonElement;
const rendering_enabled = document.getElementById("render_on_off") as HTMLButtonElement;
const sidebar = document.getElementById("sidebar") as HTMLDivElement;
const sim_restart = document.getElementById("sim_restart") as HTMLButtonElement;
const sim_start_stop = document.getElementById("sim_start_stop") as HTMLButtonElement;
const slider_label = document.getElementById("target_update_fps") as HTMLSpanElement;
const target_update_fps_slider = document.getElementById("target_update_fps_slider") as HTMLInputElement;

// Register event listener for downloading the neural network as SVG
export function register_download_neuralnet_button(): void {
  export_neuralnet.addEventListener("click", () => {
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
  rendering_enabled.addEventListener("click", () => {
    simulation.rendering_enabled = !simulation.rendering_enabled;
    rendering_enabled.innerHTML = "Rendering " + (simulation.rendering_enabled ? "ON" : "OFF");
    if (simulation.is_running) {
      simulation.stop_engine();
      simulation.start_engine();
    }
  });
}

// Register event listener for the restart button
export function register_sim_restart_button(): void {
  sim_restart.addEventListener("click", () => {
    const restart = confirm("Are you sure you would like to restart?");
    if (restart) {
      window.location.reload();
    }
  });
}

// Register event listener for the start/stop button
export function register_sim_start_stop_button(simulation: Simulation): void {
  sim_start_stop.addEventListener("click", () => {
    if (simulation.is_running) {
      simulation.stop_engine();
      sim_start_stop.innerHTML = "START";
    } else {
      let result = simulation.start_engine();
      if (result) sim_start_stop.innerHTML = "STOP";
    }
  });
}

// Register sidebar button event listener.
export function register_sidebar_button() {
  let shown = false;

  button.addEventListener("click", () => {
    shown = !shown;
    if (shown == true) {
      sidebar.style.display = "block";
    } else {
      sidebar.style.display = "none";
    }
  });
}

// Register event listener for the FPS sliders
export function register_fps_sliders(simulation, config) {
  target_update_fps_slider.max = config.TARGET_UPDATE_MAX_FPS.toString();
  target_update_fps_slider.value = config.TARGET_UPDATE_FPS.toString();
  target_update_fps_slider.addEventListener("input", () => {
    let fps = 0;

    if (target_update_fps_slider.value === target_update_fps_slider.max) {
      slider_label.innerHTML = "MAX";
      fps = Number.MAX_SAFE_INTEGER;
    } else if (target_update_fps_slider.value == target_update_fps_slider.min) {
      slider_label.innerHTML = "1";
      fps = 1;
    } else {
      slider_label.innerHTML = target_update_fps_slider.value;
      fps = parseInt(target_update_fps_slider.value, 10);
    }

    config.TARGET_UPDATE_FPS = fps;

    if (simulation.is_running) {
      simulation.restart_engine();
    }
  });
}
