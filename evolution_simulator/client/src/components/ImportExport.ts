import Simulation from "../controllers/simulation.controller";
import Organism from "../models/Organism";
import export_object from "../utils/export_object";
import { render_settings } from "./Settings";
import { read_file } from "../utils/read_file";
import { CellStates } from "../environment/Grid";
import { DefaultSimulationConfig } from "../config/simulation.config";
import { DOMElements } from "./DOMElements";

// Function to export all organisms in the simulation.
export function export_population(population: Organism[], with_coordinates: boolean): object {
  // Create an array to store the exported population.
  const population_export: any = [];
  // Iterate over all organisms in the population.
  for (const organism of population) {
    // If the user wants to export the coordinates, export the genome and the coordinates.
    if (with_coordinates) {
      // Create an object to store the organism's genome and coordinates.
      const organism_export: any = {};
      organism_export["genome"] = organism.genome.data;
      organism_export["coordinates"] = organism.coordinate;
      population_export.push(organism_export);
    } else {
      // Otherwise, only export the genome.
      population_export.push(organism.genome.data);
    }
  }
  // Return the exported population.
  return population_export;
}

// Function to register an event listener for the export population button.
export function export_population_button(simulation: Simulation): void {
  // Register an event listener for the export population button.
  DOMElements.export_population.addEventListener("click", () => {
    // Get the population from the simulation.
    const organisms = simulation.environment.population;
    // If the population exists, export it.
    if (organisms) {
      const population = export_population(organisms, false);
      // Export the population
      export_object({ file_type: "organism_export", population }, "population");
    } else {
      // Otherwise, alert the user that there are no organisms to export.
      alert("No organisms available to export.");
    }
  });
}

// Function to register event listeners for the export config button.
export function register_export_config_button(config: typeof DefaultSimulationConfig): void {
  // Register an event listener for the export config button.
  DOMElements.export_config.addEventListener("click", () => {
    // Export the simulation config.
    export_object({ file_type: "config_export", config: config }, "config");
  });
}

// Function to register an event listener for the export simulation button.
export function register_export_simulation_button(simulation: Simulation, config: typeof DefaultSimulationConfig): void {
  // Register an event listener for the export simulation button.
  DOMElements.export_simulation.addEventListener("click", () => {
    // Create an object to store the export.
    const obj: any = { simulation_config: [] };
    // Push the simulation config to the export object.
    obj.simulation_config.push(config);

    // Get the population from the simulation.
    const population = simulation.environment.population;

    // If the population exists, export it.
    if (population) {
      const exported_population = export_population(population, true);
      obj.population = exported_population;
    }

    // Push the generation, ticks and file type to the export object.
    obj["generation"] = simulation.environment.generation;
    obj["ticks"] = simulation.environment.ticks;
    obj["file_type"] = "simulation_export";

    // Export the simulation.
    export_object(obj, "simulation");
  });
}

// Function to register an event listener for the export environment button.
export function register_export_environment_button(simulation: Simulation): void {
  // Register an event listener for the export environment button.
  DOMElements.export_environment.addEventListener("click", () => {
    // Create an array to store the obstacles.
    let obstacles: number[][] = [];
    // Iterate over all cells in the grid.
    for (let i = 0; i < simulation.environment.grid_size; i++) {
      for (let j = 0; j < simulation.environment.grid_size; j++) {
        // If the cell is a wall, push its coordinates to the obstacles array.
        if (simulation.environment.grid.get_cell_at({ x: i, y: j }).state == CellStates.WALL) {
          obstacles.push([i, j]);
        }
      }
    }
    // Export the obstacles.
    export_object({ file_type: "obstacles", obstacles: obstacles }, "obstacles");
  });
}

// Function to register an event listener for the import config button.
export function register_import_config_button(simulation: Simulation, config) {
  // Register an event listener for the import config button.
  DOMElements.import_config.addEventListener("change", (event: Event) => {
    // Read and parse the json file, then update the simulation config.
    read_file(event).then((data) => {
      // If the file is valid, update the simulation config.
      if (data.config && data.file_type == "config_export") {
        config = data.config;
        simulation.config = data.config;
        simulation.environment.config = data.config;
        render_settings(simulation, simulation.config);
        alert("Successfully imported config.");
      } else {
        // Otherwise, alert the user that the file is invalid.
        alert("Failed to read config from file.");
      }
      // Reset the file input element.
      DOMElements.import_config.value = "";
    });
  });
}

// Function to register an event listener for the import organisms button.
export function register_import_organisms_button(simulation: Simulation) {
  // Register an event listener for the import organisms button.
  DOMElements.import_organisms.addEventListener("change", (event: Event) => {
    // Read and parse the json file, then add the organisms to the simulation.
    read_file(event).then((data) => {
      // If the file is valid, add the organisms to the simulation.
      if (data && data.file_type == "organism_export") {
        // Iterate over all organisms in the file.
        for (const genome of data.population) {
          // Add the organism to the simulation using its genome.
          let added_organism = simulation.environment.add_organism(genome);
          // If the organism was not added, alert the user.
          if (!added_organism) {
            alert("Failed to import all organisms.");
            return;
          }
          // Alert the user that the organisms were successfully imported.
          alert("Successfully imported organisms.");
        }
      } else {
        // Otherwise, alert the user that the file is invalid.
        alert("Invalid file.");
      }
      // Reset the file input element.
      DOMElements.import_organisms.value = "";
    });
  });
}

// Function to register an event listener for the import simulation button.
export function register_import_simulation_button(simulation: Simulation) {
  DOMElements.import_simulation.addEventListener("change", (event: Event) => {
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
      DOMElements.import_simulation.value = "";
    });
  });
}

export function register_import_environment_button(simulation) {
  DOMElements.import_environment.addEventListener("change", (event: Event) => {
    read_file(event).then((data) => {
      if (data.obstacles && data.file_type == "obstacles") {
        for (const obstacle of data.obstacles) {
          simulation.environment.grid.set_cell_state({ x: obstacle[0], y: obstacle[1] }, CellStates.WALL);
        }
        alert("Successfully imported environment.");
      } else alert("Failed to read obstacles from file.");

      DOMElements.import_environment.value = "";
    });
  });
}
