// Import necessary modules and files
import { SimulationConfig } from "../config/simulation.config";
import Simulation from "../controllers/simulation.controller";
import Organism from "../models/Organism";
import export_object from "../utils/export_object";
import { render_settings } from "./Settings";

// Get references to HTML elements
const sim_start_stop = document.getElementById("sim_start_stop") as HTMLButtonElement;
const sim_restart = document.getElementById("sim_restart") as HTMLButtonElement;
const rendering_enabled = document.getElementById("render_on_off") as HTMLButtonElement;
const export_neuralnet = document.getElementById("export_neuralnet") as HTMLButtonElement;
const export_all_organisms = document.getElementById("export_all_organisms") as HTMLButtonElement;
const export_simulation = document.getElementById("export_simulation") as HTMLButtonElement;
const export_config = document.getElementById("export_config") as HTMLButtonElement;
const button = document.getElementById("open_sidebar") as HTMLButtonElement;
const sidebar = document.getElementById("sidebar") as HTMLDivElement;
const import_organisms = document.getElementById("import_organisms") as HTMLInputElement;
const import_simulation = document.getElementById("import_simulation") as HTMLInputElement;
const import_config = document.getElementById("import_config") as HTMLInputElement;

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

// Register event listener for the restart button
export function register_sim_restart_button(): void {
  sim_restart.addEventListener("click", () => {
    const restart = confirm("Are you sure you would like to restart?");
    if (restart) {
      window.location.reload();
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

// Register event listeners for the simulation
export function register_event_listeners(simulation: Simulation): void {
  sim_start_stop.addEventListener("click", () => register_sim_start_stop_button(simulation));
  sim_restart.addEventListener("click", () => register_sim_restart_button());
}

// Remove event listeners for the simulation
export function remove_event_listeners(simulation: Simulation): void {
  sim_start_stop.removeEventListener("click", () => register_sim_start_stop_button(simulation));
  sim_restart.removeEventListener("click", () => register_sim_restart_button());
}

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

// Export all organisms
export function export_population(population: Organism[], with_coordinates: boolean): object {
  const population_export: any = [];
  for (const organism of population) {
    if (with_coordinates) {
      const organism_export: any = {};
      organism_export["genome"] = organism.genome.data;
      organism_export["coordinates"] = organism.coordinate;
      population_export.push(organism_export);
    } else {
      population_export.push(organism.genome.data);
    }
  }
  return population_export;
}

// Register event listener for exporting all organisms
export function register_export_all_organisms_button(simulation: Simulation): void {
  export_all_organisms.addEventListener("click", () => {
    const population = simulation.environment.population;
    if (population) {
      const obj = export_population(population, false);
      obj["file_type"] = "organism_export";
      export_object(obj, "population");
    } else window.alert("No organisms available to export.");
  });
}

// Register event listener for exporting the simulation
export function register_export_simulation_button(simulation: Simulation, config: typeof SimulationConfig): void {
  export_simulation.addEventListener("click", () => {
    const obj: any = { simulation_config: [] };

    obj.simulation_config.push(config);

    const population = simulation.environment.population;
    if (population) {
      const exported_population = export_population(population, true);
      obj.population = exported_population;
    }

    obj["file_type"] = "simulation_export";
    export_object(obj, "simulation");
  });
}

// Register event listener for exporting the simulation
export function register_export_config(config: typeof SimulationConfig): void {
  export_config.addEventListener("click", () => {
    export_object({ file_type: "config_export", config: config }, "config");
  });
}

// Function to read a file
function read_file(event: Event): Promise<any> {
  return new Promise((resolve) => {
    const target = event.target as HTMLInputElement;
    const file = target.files![0];
    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = (event: Event): any => {
      const result = (event.target as FileReader).result as string;
      const data = JSON.parse(result);
      resolve(data);
    };
  });
}

export function no_cached_organisms(simulation): boolean {
  if (Object.keys(simulation.cached_organisms).length !== 0) {
    alert("Cannot overwrite cached organisms. Please restart the simulation to import new organisms.");
    return false;
  } else {
    return true;
  }
}

export function register_import_organisms(simulation: Simulation) {
  import_organisms.addEventListener("change", (event: Event) => {
    read_file(event).then((data) => {
      if (data) {
        if (no_cached_organisms(simulation)) {
          simulation.cached_organisms = data;
          alert("Successfully imported simulation.");
        }
      } else {
        alert("Invalid file.");
      }
      import_organisms.value = "";
    });
  });
}

/**
 * Registers an event listener for the import_simulation element and handles the import of a simulation.
 */
export function register_import_simulation(simulation: Simulation) {
  import_simulation.addEventListener("change", (event: Event) => {
    read_file(event).then((data) => {
      if (data) {
        if (!data.simulation_config) {
          alert("Failed to read simulation config from file.");
          return;
        }
        if (!data.population) {
          alert("Failed to read population from file.");
          return;
        }
        if (no_cached_organisms(simulation)) {
          simulation.cached_organisms = data;
          simulation.config = data.simulation_config;
          alert("Successfully imported simulation.");
        }
      } else {
        alert("Invalid file.");
      }
      import_simulation.value = "";
    });
  });
}

export function register_import_config(simulation: Simulation) {
  import_config.addEventListener("change", (event: Event) => {
    read_file(event).then((data) => {
      if (data) {
        if (!data.config) {
          alert("Failed to read simulation config from file.");
          return;
        }
        simulation.config = data.config;
        render_settings(simulation, simulation.config)
        alert("Successfully imported config.");
      } else {
        alert("Invalid file.");
      }
      import_config.value = "";
    });
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

// Function to read the FPS slider value
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

// Function to handle the FPS slider
function slider(simulation, config, slider, label): void {
  if (simulation.is_running) {
    read_fps_slider(config, slider, label);
    simulation.restart_engine();
  } else {
    read_fps_slider(config, slider, label);
  }
}

// Register event listener for the FPS sliders
export function register_fps_sliders(simulation, config) {
  const target_update_fps_slider = document.getElementById("target_update_fps_slider") as HTMLInputElement;
  target_update_fps_slider.max = config.TARGET_UPDATE_MAX_FPS.toString();
  target_update_fps_slider.value = config.TARGET_UPDATE_FPS.toString();
  target_update_fps_slider.addEventListener("input", () => slider(simulation, config, target_update_fps_slider, "target_update_fps"));
}
