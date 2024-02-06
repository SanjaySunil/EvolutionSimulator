import { DefaultSimulationConfig } from "../config/simulation.config";
import Simulation from "../controllers/simulation.controller";
import { CellStates, Grid } from "../environment/Grid";
import Organism from "../models/Organism";
import export_object from "../utils/export_object";
import { read_file } from "../utils/read_file";
import { DOMElements } from "./DOMElements";
import { render_settings } from "./Settings";

/**
 * Exports all organisms in the simulation.
 * @param population - The population to be exported.
 * @param with_coordinates - Whether or not to export the coordinates of the organisms.
 * @returns An object containing the exported population.
 */
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
      organism_export["coordinates"] = [organism.coordinate.x, organism.coordinate.y];
      population_export.push(organism_export);
    } else {
      // Otherwise, only export the genome.
      population_export.push(organism.genome.data);
    }
  }

  // Return the exported population.
  return population_export;
}

/**
 * Exports the environment.
 * @param grid - The grid to export.
 * @returns - An array containing the obstacles in the grid.
 */
export function export_environment(grid: Grid): number[][] {
  // Create an array to store the obstacles.
  const obstacles: number[][] = [];

  // Iterate over all cells in the grid.
  for (let i = 0; i < grid.grid_size; i++) {
    for (let j = 0; j < grid.grid_size; j++) {
      // Get the state of the cell.
      const state = grid.get_cell_at({ x: i, y: j }).state;
      // If the cell is a wall or radioactive, push the cell to the obstacles array.
      if (state == CellStates.WALL || state == CellStates.RADIOACTIVE) {
        obstacles.push([i, j, state]);
      }
    }
  }

  return obstacles;
}

/**
 * Registers an event listener for the export population button.
 * @param simulation - The simulation object.
 */
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

/**
 * Registers an event listener for the export config button.
 * @param config - The simulation configuration.
 */
export function register_export_config_button(config: typeof DefaultSimulationConfig): void {
  // Register an event listener for the export config button.
  DOMElements.export_config.addEventListener("click", () => {
    // Export the simulation config.
    export_object({ file_type: "config_export", config: config }, "config");
  });
}

/**
 * Registers an event listener for the export simulation button.
 * @param simulation - The simulation object.
 * @param config - The simulation configuration.
 */
export function register_export_simulation_button(simulation: Simulation, config: typeof DefaultSimulationConfig): void {
  // Register an event listener for the export simulation button.
  DOMElements.export_simulation.addEventListener("click", () => {
    // Create an object to store the export.
    const simulation_export: any = {};

    // Assign the simulation config to the export object.
    simulation_export["simulation_config"] = config;

    // Get the population from the simulation.
    const population = simulation.environment.population;

    // If the population exists, export it.
    if (population) {
      const exported_population = export_population(population, true);
      simulation_export.population = exported_population;
    }

    // Exports the environment.
    const obstacles = export_environment(simulation.environment.grid);

    // Push the generation, ticks and file type to the export object.
    simulation_export["generation"] = simulation.environment.generation;
    simulation_export["ticks"] = simulation.environment.ticks;
    simulation_export["file_type"] = "simulation_export";
    simulation_export["obstacles"] = obstacles;

    // Export the simulation.
    export_object(simulation_export, "simulation");
  });
}

/**
 * Registers an event listener for the export environment button.
 * @param simulation - The simulation object.
 */
export function register_export_environment_button(simulation: Simulation): void {
  // Register an event listener for the export environment button.
  DOMElements.export_environment.addEventListener("click", () => {
    // Exports the environment.
    const obstacles = export_environment(simulation.environment.grid);

    // Export the obstacles.
    export_object({ file_type: "obstacles", obstacles: obstacles }, "obstacles");
  });
}

/**
 * Registers an event listener for the import config button.
 * @param simulation - The simulation object.
 */
export function register_import_config_button(simulation: Simulation): void {
  // Register an event listener for the import config button.
  DOMElements.import_config.addEventListener("change", (event: Event) => {
    // Read and parse the json file, then update the simulation config.
    read_file(event).then((data) => {
      // If the file is valid, update the simulation config.
      if (data.config && data.file_type == "config_export") {
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

/**
 * Registers an event listener for the import organisms button.
 * @param simulation - The simulation object.
 */
export function register_import_organisms_button(simulation: Simulation): void {
  // Register an event listener for the import organisms button.
  DOMElements.import_organisms.addEventListener("change", (event: Event) => {
    // Read and parse the json file, then add the organisms to the simulation.
    read_file(event).then((data) => {
      // If the file is valid, add the organisms to the simulation.
      if (data && data.file_type == "organism_export") {
        // Iterate over all organisms in the file.
        for (const genome of data.population) {
          // Add the organism to the simulation using its genome.
          const added_organism = simulation.environment.add_organism(genome);
          // If the organism was not added, alert the user.
          if (!added_organism) {
            alert("Failed to import all organisms.");
            return;
          }
        }
        // Alert the user that the organisms were successfully imported.
        alert("Successfully imported organisms.");
      } else {
        // Otherwise, alert the user that the file is invalid.
        alert("Invalid file.");
      }

      // Reset the file input element.
      DOMElements.import_organisms.value = "";
    });
  });
}

/**
 * Registers an event listener for the import simulation button.
 * @param simulation - The simulation object.
 */
export function register_import_simulation_button(simulation: Simulation): void {
  // Register an event listener for the import simulation button.
  DOMElements.import_simulation.addEventListener("change", (event: Event) => {
    // Read and parse the JSON file.
    read_file(event).then((data) => {
      // If the file is valid, import the simulation.
      if (data && data.file_type == "simulation_export") {
        // If simulation config exists, update the simulation config and render settings.
        if (data.simulation_config) {
          simulation.config = data.simulation_config;
          render_settings(simulation, simulation.config);
        } else {
          // Alert if simulation config is missing.
          alert("Failed to read simulation config from file.");
        }

        // If obstacles data exists, add obstacles to the simulation.
        if (data.obstacles) {
          for (const obstacle of data.obstacles) {
            simulation.environment.grid.set_cell_state({ x: obstacle[0], y: obstacle[1] }, obstacle[2]);
          }
        } else {
          // Alert if obstacles data is missing.
          alert("Failed to read obstacles from file.");
        }

        // If population data exists, add organisms to the simulation.
        if (data.population) {
          for (const organism of data.population) {
            const result = simulation.environment.add_organism(organism.genome, { x: organism.coordinates[0], y: organism.coordinates[1] });
            if (!result) {
              alert("Failed to import all organisms.");
              return;
            }
          }
        } else {
          // Alert if population data is missing.
          alert("Failed to read population from file.");
        }

        // Update generation count if available.
        if (data.generation) {
          simulation.environment.generation = data.generation;
        } else {
          // Alert if generation count is missing.
          alert("Failed to read generation from file.");
        }

        // Update ticks count if available.
        if (data.ticks) {
          simulation.environment.ticks = data.ticks;
        } else {
          // Alert if ticks count is missing.
          alert("Failed to read ticks from file.");
        }

        // Alert on successful import of the simulation.
        alert("Successfully imported simulation.");
      } else {
        // Alert if the file is invalid.
        alert("Invalid file.");
      }

      // Reset the file input element.
      DOMElements.import_simulation.value = "";
    });
  });
}

/**
 * Registers an event listener for the import environment button.
 * @param simulation - The simulation object.
 */
export function register_import_environment_button(simulation): void {
  // Event listener for import environment button.
  DOMElements.import_environment.addEventListener("change", (event: Event) => {
    // Read and parse the JSON file.
    read_file(event).then((data) => {
      // Check if obstacles data exists and the file type is obstacles.
      if (data.obstacles && data.file_type == "obstacles") {
        // Iterate over all obstacles in the file.
        for (const obstacle of data.obstacles) {
          // Set the cell state of the obstacle.
          simulation.environment.grid.set_cell_state({ x: obstacle[0], y: obstacle[1] }, obstacle[2]);
        }
        // Alert on successful import of environment.
        alert("Successfully imported environment.");
      } else {
        // Alert if obstacles data is missing or file type is incorrect.
        alert("Failed to read obstacles from file.");
      }

      // Reset the file input element.
      DOMElements.import_environment.value = "";
    });
  });
}
