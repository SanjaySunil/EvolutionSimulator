import { SimulationConfig } from "../config/simulation.config";
import Simulation from "../controllers/simulation.controller";
import export_object from "../utils/export_object";

// Get references to HTML elements
const sim_start_stop = document.getElementById("sim_start_stop") as HTMLButtonElement;
const sim_restart = document.getElementById("sim_restart") as HTMLButtonElement;
const rendering_enabled = document.getElementById("render_on_off") as HTMLButtonElement;
const export_neuralnet = document.getElementById("export_neuralnet") as HTMLButtonElement;
const export_all_organisms = document.getElementById("export_all_organisms") as HTMLButtonElement;
const export_simulation = document.getElementById("export_simulation") as HTMLButtonElement;
const input = document.getElementById("file") as HTMLInputElement;

// Register event listener for the start/stop button
export function register_sim_start_stop_button(simulation: Simulation): void {
  sim_start_stop.addEventListener("click", () => {
    if (simulation.is_running) {
      simulation.stop();
      sim_start_stop.innerHTML = "START";
    } else {
      simulation.start();
      sim_start_stop.innerHTML = "STOP";
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
      simulation.stop();
      simulation.start();
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
    const as_text = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([as_text], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const window = open(url);
    window!.onload = (): void => {
      URL.revokeObjectURL(url);
    };
  });
}

// Register event listener for exporting all organisms
export function register_export_all_organisms_button(simulation: Simulation): void {
  export_all_organisms.addEventListener("click", () => {
    const population = simulation.environment.population;
    if (population) {
      const obj: any = { population: [] };
      for (const organism of simulation.environment.population) {
        obj.population.push({
          coordinate: organism.coordinate,
          genome: organism.genome.data
        });
      }
      export_object(obj, "population");
    }
    else window.alert("No organisms available to export.");
  });
}

// Register event listener for exporting the simulation
export function register_export_simulation_button(simulation: Simulation, config: typeof SimulationConfig): void {
  export_simulation.addEventListener("click", () => {
    const obj: any = { population: [], simulation_config: [], simulation_frames: [] };

    obj.simulation_config.push(config);

    if (simulation.started_simulation) {
      obj.simulation_frames.push(simulation.environment.frames);
    }

    export_object(obj, "simulation");
  });
}

// Register event listener for importing a file
export function register_import_button(simulation: Simulation): void {
  input.addEventListener("change", (event: Event) => {
    const input = event.target as HTMLInputElement;

    if (!input || !input.files || input.files.length === 0) throw Error("No file selected.");

    const file = input.files[0];
    const file_reader = new FileReader();

    if (input) {
      file_reader.onload = (event: ProgressEvent<FileReader>): void => {
        const target = event.target;

        if (!event || !event.target || !event.target.result) {
          console.error("Failed to read file.");
          return;
        }

        const content = event.target.result as string;

        if (target) {
          const data = JSON.parse(content);

          if (data["population"]) {
            simulation.cached_population = data.population;
          }

          // const org = new Organism(data.coordinate, data.genome, simulation.environment, simulation.environment.organism_config);
          // simulation.environment.population.push(org);
        }
      };

      file_reader.readAsText(file);
    }
  });
}
