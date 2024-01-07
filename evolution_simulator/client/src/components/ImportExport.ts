// Import necessary modules and files
import { SimulationConfig } from "../config/simulation.config";
import Simulation from "../controllers/simulation.controller";
import Organism from "../models/Organism";
import export_object from "../utils/export_object";
import { render_settings } from "./Settings";
import { read_file } from "./FileReader";

// Get references to HTML elements
const export_all_organisms = document.getElementById("export_all_organisms") as HTMLButtonElement;
const export_config = document.getElementById("export_config") as HTMLButtonElement;
const export_simulation = document.getElementById("export_simulation") as HTMLButtonElement;
const import_config = document.getElementById("import_config") as HTMLInputElement;
const import_organisms = document.getElementById("import_organisms") as HTMLInputElement;
const import_simulation = document.getElementById("import_simulation") as HTMLInputElement;

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

// Register event listener for exporting the config
export function register_export_config(config: typeof SimulationConfig): void {
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

// Register event listener for importing the config
export function register_import_config(simulation: Simulation) {
  import_config.addEventListener("change", (event: Event) => {
    read_file(event).then((data) => {
      if (data.config) {
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
export function register_import_organisms(simulation: Simulation) {
  import_organisms.addEventListener("change", (event: Event) => {
    read_file(event).then((data) => {
      if (data) {
        for (const genome of data) {
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
export function register_import_simulation(simulation: Simulation) {
  import_simulation.addEventListener("change", (event: Event) => {
    read_file(event).then((data) => {
      if (data) {
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
