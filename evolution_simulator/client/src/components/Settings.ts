import Renderer from "../controllers/renderer.controller";
import Simulation from "../controllers/simulation.controller";
import { Grid } from "../environment/Grid";
import { DOMElements } from "./DOMElements";

// Function to check for changes in the config object
function check_config_changes(simulation, config, key) {
  if (key === "GRID_SIZE") {
    simulation.environment.pixel_size = (config[key] * 15) / config[key];
    simulation.environment.canvas.width = simulation.environment.canvas.height = config[key] * 15;
    simulation.environment.canvas.style.transform = `scale(${simulation.environment.zoom_level})`;
    simulation.environment.renderer = new Renderer(
      simulation.environment.canvas,
      simulation.environment.ctx,
      simulation.environment.pixel_size
    );
    simulation.environment.grid = new Grid(config[key], simulation.environment.renderer);
    simulation.environment.renderer.pixel_size = simulation.environment.pixel_size;
    simulation.environment.renderer.clear_canvas();
  }
}

// Function to render the frames per second (fps) element
export function render_fps_element(element: HTMLElement, fps: number): void {
  element.innerHTML = Math.round(fps).toString();
}

// Function to render the settings based on the provided config object
export function render_settings(simulation: Simulation, config: object): void {
  const keys = Object.keys(config);

  DOMElements.settings.innerHTML = "";

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = config[key];

    // Create a new table row
    const row = document.createElement("tr");

    // Create a new table cell for the key
    const key_cell = document.createElement("td");
    key_cell.textContent = key.replaceAll("_", " ");

    // Append the key cell to the row
    row.appendChild(key_cell);

    // Append the row to the settings div
    DOMElements.settings.appendChild(row);

    // Create a new table cell for the input
    const input_cell = document.createElement("td");
    const input = document.createElement("input");

    // Set the input type based on the value type
    input.setAttribute("type", typeof value === "number" ? "number" : "checkbox");
    input.setAttribute("id", key);

    // Set the input value or checked attribute based on the value
    if (typeof value == "boolean" && value) {
      input.setAttribute("checked", "true");
    } else {
      input.setAttribute("value", value.toString());
    }

    const inputs = document.querySelectorAll("input");

    for (const input of inputs) {
      input.addEventListener("change", handle_change);
    }

    // Function to handle changes in the input
    function handle_change(e: Event) {
      const target = e.target as HTMLInputElement;
      const key = target.id;
      const value = target.value;

      // Update the config object based on the input type
      if (typeof config[key] === "number") {
        config[key] = parseInt(value);
      } else if (typeof config[key] === "boolean") {
        config[key] = target.checked;
      }

      check_config_changes(simulation, config, key);
    }

    // Append the input cell to the row
    row.appendChild(input_cell);
    input_cell.appendChild(input);

    // Append the row to the settings div
    DOMElements.settings.appendChild(row);

    // Check config changes.
    check_config_changes(simulation, config, key);
  }
}
