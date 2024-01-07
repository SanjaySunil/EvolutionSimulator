// Import necessary modules and files
import { SimulationConfig } from "../config/simulation.config";
import Simulation from "../controllers/simulation.controller";
import Organism from "../models/Organism";
import export_object from "../utils/export_object";
import { render_settings } from "./Settings";
import { read_file } from "./FileReader";
import { CellStates } from "../environment/Grid";

// Get references to HTML elements
const export_all_organisms = document.getElementById("export_all_organisms") as HTMLButtonElement;
const export_config = document.getElementById("export_config") as HTMLButtonElement;
const export_simulation = document.getElementById("export_simulation") as HTMLButtonElement;
const export_environment = document.getElementById("export_environment") as HTMLButtonElement;
const import_config = document.getElementById("import_config") as HTMLInputElement;
const import_organisms = document.getElementById("import_organisms") as HTMLInputElement;
const import_simulation = document.getElementById("import_simulation") as HTMLInputElement;
const import_environment = document.getElementById("import_environment") as HTMLInputElement;

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
    const organisms = simulation.environment.population;
    if (organisms) {
      const population = export_population(organisms, false);
      export_object({ file_type: "organism_export", population }, "population");
    } else window.alert("No organisms available to export.");
  });
}

// Register event listener for exporting the config
export function register_export_config_button(config: typeof SimulationConfig): void {
  export_config.addEventListener("click", () => {
    export_object({ file_type: "config_export", config: config }, "config");
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

    obj["generation"] = simulation.environment.generation;
    obj["ticks"] = simulation.environment.ticks;
    obj["file_type"] = "simulation_export";
    export_object(obj, "simulation");
  });
}

export function register_export_environment_button(simulation: Simulation): void {
  export_environment.addEventListener("click", () => {
    let arr: number[][] = [];
    for (let i = 0; i < simulation.environment.grid_size; i++) {
      for (let j = 0; j < simulation.environment.grid_size; j++) {
        if (simulation.environment.grid.get_cell_at({ x: i, y: j }).state == CellStates.WALL) {
          arr.push([i, j]);
        }
      }
    }
    export_object({ file_type: "obstacles", obstacles: arr }, "obstacles");
  });
}

// Register event listener for importing the config
export function register_import_config_button(simulation: Simulation) {
  import_config.addEventListener("change", (event: Event) => {
    read_file(event).then((data) => {
      if (data.config && data.file_type == "config_export") {
        simulation.config = data.config;
        render_settings(simulation, simulation.config);
        alert("Successfully imported config.");
      } else {
        alert("Failed to read config from file.");
      }
      import_config.value = "";
    });
  });
}

// Register event listener for importing organisms
export function register_import_organisms_button(simulation: Simulation) {
  import_organisms.addEventListener("change", (event: Event) => {
    read_file(event).then((data) => {
      if (data && data.file_type == "organism_export") {
        for (const genome of data.population) {
          let result = simulation.environment.add_organism(genome);
          if (!result) {
            alert("Failed to import all organisms.");
            return;
          }
        }
        alert("Successfully imported organisms.");
      } else {
        alert("Invalid file.");
      }
      import_organisms.value = "";
    });
  });
}

// Register event listener for importing the simulation
export function register_import_simulation_button(simulation: Simulation) {
  import_simulation.addEventListener("change", (event: Event) => {
    read_file(event).then((data) => {
      if (data && data.file_type == "simulation_export") {
        if (data.simulation_config) {
          simulation.config = data.simulation_config;
          render_settings(simulation, simulation.config);
        } else alert("Failed to read simulation config from file.");

        if (data.population) {
          for (const organism of data.population) {
            let result = simulation.environment.add_organism(organism.genome, organism.coordinates);
            if (!result) {
              alert("Failed to import all organisms.");
              return;
            }
          }
        } else alert("Failed to read population from file.");

        if (data.generation) simulation.environment.generation = data.generation;
        else alert("Failed to read generation from file.");

        if (data.ticks) simulation.environment.ticks = data.ticks;
        else alert("Failed to read ticks from file.");

        alert("Successfully imported simulation.");
      } else {
        alert("Invalid file.");
      }
      import_simulation.value = "";
    });
  });
}

export function register_import_environment_button(simulation) {
  import_environment.addEventListener("change", (event: Event) => {
    read_file(event).then((data) => {
      if (data.obstacles && data.file_type == "obstacles") {
        for (const obstacle of data.obstacles) {
          simulation.environment.grid.set_cell_state({ x: obstacle[0], y: obstacle[1] }, CellStates.WALL);
        }
        alert("Successfully imported environment.");
      } else alert("Failed to read obstacles from file.");

      import_environment.value = "";
    });
  });
}