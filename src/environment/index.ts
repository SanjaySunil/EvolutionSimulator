import { calculate_and_sort_fitness, select_and_crossover } from "../algorithms/GeneticAlgorithm";
import { DOMElements } from "../components/DOMElements";
import { DefaultSimulationConfig } from "../config/simulation.config";
import Canvas from "../controllers/canvas.controller";
import ChartController from "../controllers/chart.controller";
import Gene from "../models/Gene";
import Organism from "../models/Organism";
import { Coordinate } from "../types/Coordinate";
import { add_vector } from "../utils/geometry";
import get_random_vector from "../utils/get_random_vector";
import { CellStates } from "./Grid";

/** This class represents the environment in which the organisms exist and interact. */
export class Environment extends Canvas {
  public alive: number;
  public best_fitness_data_points: Coordinate[];
  public chart: ChartController;
  public generation: number;
  public number_of_species_data_points: Coordinate[];
  public overall_fitness_data_points: Coordinate[];
  public population: Organism[];
  public species: Set<string>;
  public ticks: number;

  /**
   * Instantiates a new Environment.
   * @param canvas_id - The ID of the canvas to render the environment on.
   * @param config - The configuration to use for the environment.
   */
  constructor(canvas_id: string, config: typeof DefaultSimulationConfig) {
    super(canvas_id, config);
    this.population = [];
    this.ticks = 0;
    this.generation = 0;
    this.alive = 0;
    this.best_fitness_data_points = [];
    this.overall_fitness_data_points = [];
    this.number_of_species_data_points = [];
    this.species = new Set();
    this.chart = new ChartController("chart");
    this.chart.add_config("Best Fitness", "Generation", "Best Fitness", this.best_fitness_data_points, 1);
    this.chart.add_config("Overall Fitness", "Generation", "Overall Fitness", this.overall_fitness_data_points, 1);
    this.chart.add_config("Number of Species", "Generation", "Number of Species", this.number_of_species_data_points);
    this.chart.switch_chart(0);
  }

  /**
   * Adds an Organism to the simulation environnment.
   * @param gene_data - The gene data to be used to create the organism.
   * @param coordinate - The coordinate to place the organism at.
   * @returns Whether the organism was succesfully added.
   */
  public add_organism(gene_data: Gene[], coordinate?: Coordinate): boolean {
    // Check if the population size has exceeded the configured limit.
    if (this.population.length > this.config.POPULATION) {
      // Display an alert if the population size limit is exceeded.
      alert("Population size cannot be greater than Grid size squared.");
      // Return false as the organism was not added.
      return false;
    }

    // If no coordinate is provided, fetch an empty cell from the grid.
    if (!coordinate) coordinate = this.grid.fetch_empty_cell();

    // Create a new Organism instance with the provided gene data, grid, configuration, and population index.
    const organism = new Organism(coordinate, gene_data, this.grid, this.config);

    // Set the cell owner as the newly created organism.
    this.grid.set_cell_owner(coordinate, organism);

    // Add the new organism to the population array.
    this.population.push(organism);

    // Return true to indicate that the organism was succesfully added.
    return true;
  }

  /** Drops food randomly within a defined area in the grid. */
  private drop_food(): void {
    // Loop to drop food 1000 times.
    for (let i = 0; i < 1000; i++) {
      // Calculate the center of the grid.
      const center = Math.floor(this.config.GRID_SIZE / 2);
      // Set a cell state to FOOD at a randomly generated coordinate within a specified range around the center.
      this.grid.set_cell_state(get_random_vector(center - 10, center - 10, center + 10, center + 10), CellStates.FOOD);
    }
  }

  /** Updates the simulation chart. */
  private update_charts(best_fitness: number, overall_fitness: number, species_count: number): void {
    // Adds data points to the chart.
    this.best_fitness_data_points.push({
      x: this.generation,
      y: best_fitness,
    });
    this.overall_fitness_data_points.push({
      x: this.generation,
      y: overall_fitness,
    });
    this.number_of_species_data_points.push({
      x: this.generation,
      y: species_count,
    });
    // Updates and renders the chart.
    this.chart.chart.render();
  }

  /** Initializes the environment. */
  public init(): void {
    // Populate the environment until the desired population size is reached.
    while (this.population.length != this.config.POPULATION) {
      const data: Gene[] = [];
      // Generate genes for each organism.
      for (let i = 0; i < this.config.NUMBER_OF_GENES; i++) {
        data.push(new Gene());
      }
      // Add an organism with generated genes to the environment.
      this.add_organism(data);
    }

    // If the configuration specifies to drop food, distribute food within the environment.
    if (this.config.GOAL_FOOD) {
      this.drop_food();
    }
  }

  /** Resets the environment for the next generation. */
  private next_generation(): void {
    let best_fitness;

    // Calculate fitness of all individuals based on the configured goals.
    if (this.config.GOAL_COORD) {
      this.population = calculate_and_sort_fitness(this.population, "coord", {
        goal_coordinates: this.goal_coordinates,
        max_distances_to_goal: this.max_distances_to_goal,
      });
    } else if (this.config.GOAL_FOOD) {
      this.population = calculate_and_sort_fitness(this.population, "food");
    }

    // Initialize variables to track the best individual and the fitness sum.
    let best_found = false;
    let fitness_sum = 0;

    // Find the best individual and calculate the fitness sum, which is to be used to calculate the overall fitness.
    for (const organism of this.population) {
      // Add the organism's colour to the species set.
      if (organism.genome.colour) this.species.add(organism.genome.colour);
      if (organism.alive) fitness_sum += organism.fitness!;
      if (!best_found && organism.alive) {
        best_fitness = organism.fitness!;
        best_found = true;
      }
      this.grid.clear_cell_state(organism.coordinate);
    }
    // Calculate the overall fitness of the population.
    const overall_fitness = this.alive > 0 ? fitness_sum / this.alive : 0;

    // Select and crossover individuals based on the configured genetic algorithm.
    this.population = select_and_crossover(this.population, this.config);

    // Reset tick count and increment generation count.
    const species_count = this.species.size;
    this.update_charts(best_fitness, overall_fitness, species_count);
    this.ticks = 0;
    this.generation++;

    // Update HTML elements with simulation data.
    DOMElements.best_fitness.innerHTML = best_fitness.toPrecision(3).toString();
    DOMElements.overall_fitness.innerHTML = overall_fitness.toPrecision(3).toString();
    DOMElements.number_of_species_count.innerHTML = species_count.toString();

    // Clear the species set.
    this.species = new Set();

    // If the fitness function goal is to obtain food, drop food in the environment.
    if (this.config.GOAL_FOOD) {
      this.drop_food();
    }
  }

  /** Updates the environment based on the configured goals and conditions. */
  public update(): void {
    // Check if the number of ticks has reached the configured number of ticks per generation.
    if (this.ticks == this.config.TICKS_PER_GENERATION) {
      // Proceed to the next generation if the number of ticks has reached the configured limit.
      this.next_generation();
    } else {
      // Reset organisms alive to 0.
      this.alive = 0;

      // Iterate through the list of organisms and perform actions based on the environment's rules.
      for (const organism of this.population) {
        // If the organsim is alive, increment the alive count and perform actions.
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

            // If the organism's energy is 0, consume food and increment energy.
            if (organism.energy == 0) {
              const previous_energy = organism.energy;
              organism.energy = organism.energy + this.config.ENERGY_FROM_FOOD;
              if (organism.energy != previous_energy) {
                this.grid.get_cell_at(new_coordinate).energy -= 1;
              }
            }

            // Update the direction the organism is facing and the coordinate.
            organism.direction = offset;
            organism.coordinate = new_coordinate;
          }
        }
      }
    }

    // Increment the tick count.
    this.ticks++;
  }

  /** Renders the environment on the canvas. */
  public render(): void {
    // Clear cells that are to be cleared based on the to_clear list.
    let cell = this.renderer.to_clear.dequeue();

    // Iterate through the linked list of cells to clear until a null pointer is reached.
    while (cell != null) {
      if (!cell.is_selected) this.renderer.clear_cell(cell);
      else this.renderer.render_cell(cell);
      cell = this.renderer.to_clear.dequeue();
    }

    // Render cells that are to be filled based on the to_fill list.
    cell = this.renderer.to_fill.dequeue();

    // Iterate through the linked list of cells to fill until a null pointer is reached.
    while (cell != null) {
      this.renderer.render_cell(cell);
      cell = this.renderer.to_fill.dequeue();
    }
  }
}
