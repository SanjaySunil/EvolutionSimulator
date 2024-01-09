import { DefaultSimulationConfig } from "../config/simulation.config";
import Canvas from "../controllers/canvas.controller";
import { select_and_crossover, calculate_and_sort_fitness } from "../math/GeneticAlgorithm";
import Gene from "../models/Gene";
import Organism from "../models/Organism";
import { Coordinate } from "../models/types/Coordinate";
import { add_vector } from "../utils/geometry";
import get_random_vector from "../utils/get_random_vector";
import { CellStates } from "./Grid";

// Environment Class.
export class Environment extends Canvas {
  public population: Organism[];
  public ticks: number;
  public generation: number;
  public overall_fitness: number;
  public best_fitness: number;
  public alive: number;
  public oldest_organism: number;

  // Builds a new Environment.
  constructor(canvas_id: string, config: typeof DefaultSimulationConfig) {
    super(canvas_id, config);
    this.population = [];
    this.ticks = 0;
    this.generation = 1;
    this.best_fitness = Infinity;
    this.overall_fitness = Infinity;
    this.alive = 0;
    this.oldest_organism = 0;
  }

  // Adds an Organism to the environment and configures knowledge.
  public add_organism(gene_data: Gene[], coordinate?: Coordinate): boolean {
    // Check if the population size has exceeded the configured limit.
    if (this.population.length > this.config.POPULATION) {
      // Display an alert if the population size limit is exceeded.
      alert("Population size cannot be greater than Grid size squared.");
      // Return false as the addition is not permitted.
      return false;
    }

    // If no coordinate is provided, fetch an empty cell from the grid.
    if (!coordinate) coordinate = this.grid.fetch_empty_cell();

    // Create a new Organism instance with the provided gene data, grid, configuration, and population index.
    const organism = new Organism(coordinate, gene_data, this.grid, this.config, this.population.length);

    // Set the cell owner as the newly created organism.
    this.grid.set_cell_owner(coordinate, organism);

    // Add the new organism to the population array.
    this.population.push(organism);

    // Return true to indicate successful addition of the organism.
    return true;
  }

  // Drops food randomly within a defined area in the grid.
  public drop_food(): void {
    // Loop to drop food 1000 times.
    for (let i = 0; i < 1000; i++) {
      // Calculate the center of the grid.
      const center = Math.floor(this.config.GRID_SIZE / 2);
      // Set a cell state to FOOD at a randomly generated coordinate within a specified range around the center.
      this.grid.set_cell_state(get_random_vector(center - 10, center - 10, center + 10, center + 10), CellStates.FOOD);
    }
  }

  // Initializes a new environment by populating it with organisms.
  public init(): void {
    // Populate the environment until the desired population size is reached.
    while (this.population.length != this.config.POPULATION) {
      const data: Gene[] = [];
      // Generate genes for each organism.
      for (let i = 0; i < this.config.NUMBER_OF_GENES; i++) {
        data.push(new Gene(this.config.NUMBER_OF_HIDDEN_NEURONS));
      }
      // Add an organism with generated genes to the environment.
      this.add_organism(data);
    }

    // If the configuration specifies to drop food, distribute food within the environment.
    if (this.config.GOAL_FOOD) {
      this.drop_food();
    }
  }

  // Updates the environment based on the configured goals and conditions.
  public update(): void {
    if (this.ticks > this.config.TICKS_PER_GENERATION) {
      // Calculate fitness of all individuals based on the configured goals.
      if (this.config.GOAL_COORD) {
        this.population = calculate_and_sort_fitness(this.population, "coord", {
          goal_coordinates: this.goal_coordinates,
          max_distances_to_goal: this.max_distances_to_goal,
        });
      } else if (this.config.GOAL_FOOD) {
        this.population = calculate_and_sort_fitness(this.population, "food");
      }

      let best_found = false;
      let fitness_sum = 0;

      // Calculate overall fitness and find the best individual.
      for (const organism of this.population) {
        if (organism.alive) fitness_sum += organism.fitness!;
        if (!best_found && organism.alive) {
          this.best_fitness = organism.fitness!;
          best_found = true;
        }
        this.grid.clear_cell_state(organism.coordinate);
      }

      this.overall_fitness = this.alive > 0 ? fitness_sum / this.alive : 0;

      // Select and crossover individuals based on the configured genetic algorithm.
      this.population = select_and_crossover(this.population, this.config);

      // Reset tick count and increment generation count.
      this.ticks = 0;
      this.generation++;

      // If the goal is to distribute food, do so within the environment.
      if (this.config.GOAL_FOOD) {
        this.drop_food();
      }
    } else {
      // Iterate through the list of organisms and perform actions based on the environment's rules.
      this.alive = 0;

      for (const organism of this.population) {
        if (organism.alive) {
          this.alive++;
          const offset = organism.action();
          const new_coordinate = add_vector(organism.coordinate, offset);

          if (this.grid.is_valid_cell_at(new_coordinate) && this.grid.is_cell_empty(new_coordinate)) {
            // Update coordinates if the new cell is empty.
            organism.direction = offset;
            organism.coordinate = new_coordinate;
          } else if (this.grid.is_valid_cell_at(new_coordinate) && this.grid.get_cell_at(new_coordinate).state == CellStates.RADIOACTIVE) {
            // Clear cell if it's radioactive, marking organism as dead.
            this.grid.clear_cell_state(organism.coordinate);
            organism.alive = false;
            this.alive--;
          } else if (this.grid.is_valid_cell_at(new_coordinate) && this.grid.get_cell_at(new_coordinate).state == CellStates.FOOD) {
            // Clear cell, consume food, and update coordinates if it's food.
            this.grid.clear_cell_state(organism.coordinate);

            if (organism.energy == 0) {
              this.grid.get_cell_at(new_coordinate).energy -= 1;
              organism.energy = 1;
            }

            organism.direction = offset;
            organism.coordinate = new_coordinate;
          }
        }
      }
    }
    this.ticks++;
  }

  // Renders the environment on the canvas.
  public render(): void {
    // Clear cells that are not selected and fill others based on to_clear and to_fill lists.
    for (const cell of this.renderer.to_clear) {
      if (!cell.is_selected) this.renderer.clear_cell(cell);
      else this.renderer.fill_cell(cell);
    }

    // Fill cells based on the to_fill list.
    for (const cell of this.renderer.to_fill) {
      this.renderer.fill_cell(cell);
    }

    // Clear both to_clear and to_fill lists after rendering.
    this.renderer.to_clear.clear();
    this.renderer.to_fill.clear();
  }
}