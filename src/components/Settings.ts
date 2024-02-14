import { SimulationConfigBoundaries } from "../config/simulation.config";
import Renderer from "../controllers/renderer.controller";
import Simulation from "../controllers/simulation.controller";
import { Grid } from "../environment/Grid";
import { DOMElements } from "./DOMElements";

/** These are the only parameters that can only be changed whilst the simulation is running. */
const live_params = ["MUTATION_PERCENT", "ELITISM_PERCENT", "TICKS_PER_GENERATION", "TARGET_UPDATE_FPS"];

/**
 * Checks if the parameter is a live parameter and alerts the user if it is.
 * @param started - Whether the simulation has started.
 * @param key - The key in the config object that was changed.
 * @returns - Whether the parameter is a live parameter.
 */
function check_if_live_param(started: boolean, key: string): boolean {
  // If the simulation has started and the key is not a live parameter, alert the user that the parameter cannot be changed.
  if (started && !live_params.includes(key)) {
    alert(`The ${key} parameter cannot be changed when the simulation has already started.`);
    return false;
  } else {
    return true;
  }
}

/**
 * Checks if the input is valid based on the key and value.
 * @param key - The key in the config object that was changed.
 * @param value - The value of the key in the config object.
 * @returns - Whether the input is valid.
 */
function check_if_valid_input(key: string, value: string): boolean {
  // If the key is in the SimulationConfigBoundaries object, check if the value is within the boundaries.
  if (key in SimulationConfigBoundaries) {
    const min = SimulationConfigBoundaries[key][0];
    const max = SimulationConfigBoundaries[key][1];
    // If the value is not within the boundaries, alert the user and return false.
    if (parseInt(value) < min || parseInt(value) > max) {
      alert(`The value for ${key} must be between ${min} and ${max}.`);
      return false;
    }
  }
  return true;
}

/**
 * Checks for changes in the config object and applies them to the simulation.
 * @param simulation - The simulation object.
 * @param config - The config object.
 * @param key - The key in the config object that was changed.
 */
function check_config_changes(simulation, config, key): void {
  // Check if the key in the config object is "GRID_SIZE"
  if (key === "GRID_SIZE") {
    // Calculate the new pixel size based on the grid size.
    simulation.environment.pixel_size = (config[key] * 15) / config[key];

    // Set canvas width and height based on the grid size multiplied by 15,
    simulation.environment.canvas.width = simulation.environment.canvas.height = config[key] * 15;

    // Apply scaling to the canvas using the zoom level.
    simulation.environment.canvas.style.transform = `scale(${simulation.environment.zoom_level})`;

    // Create a new Renderer instance with updated canvas, context, and pixel size.
    simulation.environment.renderer = new Renderer(
      simulation.environment.canvas,
      simulation.environment.ctx,
      simulation.environment.pixel_size
    );

    // Create a new Grid instance with the updated grid size and renderer
    simulation.environment.grid = new Grid(config[key], simulation.environment.renderer);

    // Ensure renderer's pixel size matches the updated environment's pixel size
    simulation.environment.renderer.pixel_size = simulation.environment.pixel_size;

    // Clear the canvas using the updated renderer.
    simulation.environment.renderer.clear_canvas();
  } else if (key === "TARGET_UPDATE_FPS") {
    // If the simulation is running, restart the engine to apply the changes.
    if (simulation.is_running) {
      simulation.restart_engine();
    }
    // Update the target update FPS element on the HTML page.
    render_fps_element(DOMElements.target_update_fps, config[key]);
  }
}

/**
 * Renders the FPS element on the HTML page.
 * @param element - The HTML element to render the FPS element in.
 * @param fps - The FPS value to display.
 */
export function render_fps_element(element: HTMLElement, fps: number): void {
  // Set the inner HTML of the specified HTML element to display the rounded FPS value as a string
  element.innerHTML = Math.round(fps).toString();
}

/**
 * Renders the settings element on the HTML page.
 * @param simulation - The simulation object.
 * @param config - The config object.
 */
export function render_settings(simulation: Simulation, config: object): void {
  // Function to handle changes in the input
  function handle_change(event: Event): void {
    // Get the target element of the event.
    const target = event.target as HTMLInputElement;
    // Get the key and value of the target element.
    const key = target.id;
    const value = target.value;

    // Check if the input is valid and is a live parameter
    if (check_if_valid_input(key, value) && check_if_live_param(simulation.has_started, key)) {
      // Update the config object based on the input type
      if (typeof config[key] === "number") {
        config[key] = parseInt(value);
      } else if (typeof config[key] === "boolean") {
        config[key] = target.checked;
      }

      // Trigger function to check and apply config changes
      check_config_changes(simulation, config, key);
    } else {
      // Reset the input value to the config value
      target.value = config[key].toString();
    }
  }

  // Retrieve all keys from the config object
  const keys = Object.keys(config);

  // Clear the innerHTML of the settings element
  DOMElements.settings.innerHTML = "";

  // Iterate through each key in the config object
  for (let i = 0; i < keys.length; i++) {
    // Get the key and value from the config object
    const key = keys[i];
    const value = config[key];

    // Create a new table row.
    const row = document.createElement("tr");

    // Create a new table cell for the key
    const key_cell = document.createElement("td");

    // Display the key with underscores replaced by spaces
    key_cell.textContent = key.replaceAll("_", " ");

    // Append the key cell to the row
    row.appendChild(key_cell);

    // Append the row to the settings div
    DOMElements.settings.appendChild(row);

    // Create a new table cell for the input
    const input_cell = document.createElement("td");
    const input = document.createElement("input");

    // Set the input type based on the value type (number or checkbox)
    input.setAttribute("type", typeof value === "number" ? "number" : "checkbox");
    input.setAttribute("id", key); // Set input ID to the key

    // Set the input value or checked attribute based on the value
    if (typeof value == "boolean" && value) {
      input.setAttribute("checked", "true");
    } else {
      input.setAttribute("value", value.toString());
    }

    // Add event listener to handle input changes
    input.addEventListener("change", handle_change);

    // Append the input cell to the row
    row.appendChild(input_cell);
    input_cell.appendChild(input);

    // Append the row to the settings div
    DOMElements.settings.appendChild(row);

    // Check for config changes
    check_config_changes(simulation, config, key);
  }
}
