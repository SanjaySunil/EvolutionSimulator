import Renderer from "../controllers/renderer.controller";
import Simulation from "../controllers/simulation.controller";
import { Grid } from "../environment/Grid";
import { DOMElements } from "./DOMElements";

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
  function handle_change(e: Event): void {
    const target = e.target as HTMLInputElement;
    const key = target.id;
    const value = target.value;

    // Update the config object based on the input type
    if (typeof config[key] === "number") {
      config[key] = parseInt(value);
    } else if (typeof config[key] === "boolean") {
      config[key] = target.checked;
    }

    // Trigger function to check and apply config changes
    check_config_changes(simulation, config, key);
  }

  // Retrieve all keys from the config object
  const keys = Object.keys(config);

  // Clear the innerHTML of the settings element
  DOMElements.settings.innerHTML = "";

  // Iterate through each key in the config object
  for (let i = 0; i < keys.length; i++) {
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
