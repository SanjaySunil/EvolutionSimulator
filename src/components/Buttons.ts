import Simulation from "../controllers/simulation.controller";
import { DOMElements } from "./DOMElements";

/**
 * Registers an event listener for the download neural network button.
 */
export function register_download_neuralnet_button(): void {
  DOMElements.export_neuralnet.addEventListener("click", () => {
    // Get the SVG element from the Document Object Model (DOM)
    const svg = document.querySelector("svg");
    if (svg) {
      // Serialize the SVG element to a string
      const as_text = new XMLSerializer().serializeToString(svg);
      // Create a Blob object from the serialized SVG string
      const blob = new Blob([as_text], { type: "image/svg+xml" });
      // Create a URL object from the Blob object
      const url = URL.createObjectURL(blob);
      // Create a link element and set its attributes
      const link = document.createElement("a");
      link.href = url;
      link.download = "neural_network.svg";
      // Click the link element to download the SVG file
      link.click();
    }
  });
}

/**
 * Registers an event listener for the rendering enabled button.
 * @param simulation - The simulation object.
 */
export function register_rendering_enabled_button(simulation: Simulation): void {
  DOMElements.rendering_enabled.addEventListener("click", () => {
    // When the button is clicked, the rendering enabled property is toggled.
    simulation.rendering_enabled = !simulation.rendering_enabled;
    // Update the button text to reflect the current rendering state.
    DOMElements.rendering_enabled.innerHTML = "Rendering " + (simulation.rendering_enabled ? "ON" : "OFF");
    // If the simulation is running, restart the engine to apply the changes.
    if (simulation.is_running) {
      simulation.stop_engine();
      simulation.start_engine();
    }
  });
}

/**
 * Registers an event listener for the restart button.
 */
export function register_sim_restart_button(): void {
  DOMElements.sim_restart.addEventListener("click", () => {
    // Creates a confirmation dialog box asking the user whether they want to restart the simulation.
    const restart_confirmed = confirm("Are you sure you would like to restart?");
    // If the user confirms, reload the page.
    if (restart_confirmed) {
      window.location.reload();
    }
  });
}

/**
 * Registers an event listener for the start/stop button.
 * @param simulation - The simulation object.
 */
export function register_sim_start_stop_button(simulation: Simulation): void {
  // When the button is clicked, the simulation is either started or stopped.
  DOMElements.sim_start_stop.addEventListener("click", () => {
    // If the simulation is running, stop the engine and update the button text.
    if (simulation.is_running) {
      simulation.stop_engine();
      DOMElements.sim_start_stop.innerHTML = "START";
    } else {
      // If the simulation is not running, start the engine and update the button text.
      const engine_started = simulation.start_engine();
      if (engine_started) {
        DOMElements.sim_start_stop.innerHTML = "STOP";
      }
    }
  });
}

/**
 * Registers an event listener for the show controls button.
 */
export function register_show_controls(): void {
  let control_window_shown = false;

  // When the button is clicked, the control window is either shown or hidden.
  DOMElements.button.addEventListener("click", () => {
    // Toggle the control window's visibility.
    control_window_shown = !control_window_shown;
    // If the control window is shown, display the sidebar, else hide it.
    if (control_window_shown) {
      DOMElements.sidebar.style.display = "block";
    } else {
      DOMElements.sidebar.style.display = "none";
    }
  });
}

/**
 * Registers an event listener for the FPS slider.
 * @param simulation - The simulation object.
 * @param config - The simulation configuration.
 */
export function register_fps_slider(simulation, config): void {
  // Set the slider's min, max, and initial value.
  DOMElements.target_update_fps_slider.max = config.TARGET_UPDATE_MAX_FPS.toString();
  DOMElements.target_update_fps_slider.value = config.TARGET_UPDATE_FPS.toString();

  // When the slider's value is changed, the target update FPS is updated.
  DOMElements.target_update_fps_slider.addEventListener("input", () => {
    if (DOMElements.target_update_fps_slider.value === DOMElements.target_update_fps_slider.max) {
      // If the slider is at its maximum value, set the target update FPS to the maximum safe integer (highest possible FPS).
      DOMElements.slider_label.innerHTML = "MAX";
      config.TARGET_UPDATE_FPS = Number.MAX_SAFE_INTEGER;
    } else if (DOMElements.target_update_fps_slider.value == DOMElements.target_update_fps_slider.min) {
      // If the slider is at its minimum value, set the target update FPS to 1.
      DOMElements.slider_label.innerHTML = "1";
      config.TARGET_UPDATE_FPS = 1;
    } else {
      // Otherwise, set the target update FPS to the slider's value.
      DOMElements.slider_label.innerHTML = DOMElements.target_update_fps_slider.value;
      config.TARGET_UPDATE_FPS = parseInt(DOMElements.target_update_fps_slider.value, 10);
    }

    // If the simulation is running, restart the engine to apply the changes.
    if (simulation.is_running) {
      simulation.restart_engine();
    }
  });
}

/**
 * Registers an event listener for the chart switcher.
 * @param simulation - The simulation object.
 */
export function register_switch_chart(simulation: Simulation): void {
  DOMElements.switch_chart.addEventListener("change", () => {
    const index = parseInt(DOMElements.switch_chart.value);
    simulation.environment.chart.switch_chart(index);
  });
}
