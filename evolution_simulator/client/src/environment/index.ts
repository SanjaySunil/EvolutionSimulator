import { SimulationConfig } from "../config/simulation.config";
import Canvas from "../controllers/canvas.controller";
import { select_and_crossover, sort_and_calculate_fitness } from "../math/GeneticAlgorithm";
import Gene from "../models/Gene";
import Organism from "../models/Organism";
import { Coordinate } from "../models/types/Coordinate";
import { add_vector } from "../utils/geometry";
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
  constructor(canvas_id: string, config: typeof SimulationConfig) {
    super(canvas_id, config);
    this.population = [];
    this.ticks = 0;
    this.generation = 1;
    this.best_fitness = config.GRID_SIZE;
    this.overall_fitness = config.GRID_SIZE;
    this.alive = 0;
    this.oldest_organism = 0;
  }

  // Adds an Organism to the environment and configures knowledge.
  public add_organism(gene_data: Gene[], coordinate?: Coordinate): boolean {
    if (this.population.length > this.config.POPULATION) {
      alert("Population size cannot be greater than Grid size squared.");
      return false;
    }
    if (!coordinate) coordinate = this.grid.fetch_empty_cell();
    const organism = new Organism(coordinate, gene_data, this);
    this.grid.set_cell_owner(coordinate, organism);
    this.population.push(organism);
    return true;
  }

  // Initialises a new Environment.
  public init(): void {
    while (this.population.length != this.config.POPULATION) {
      const data: Gene[] = [];
      for (let i = 0; i < this.config.NUMBER_OF_GENES; i++) {
        data.push(new Gene(this.config.NUMBER_OF_NEURONS));
      }
      this.add_organism(data);
    }
  }

  // Updates the Environment.
  public update(): void {
    if (this.ticks > this.config.TICKS_PER_GENERATION) {
      // Calculate fitness of all individuals.
      this.population = sort_and_calculate_fitness(this.population, this.goal_coordinates);

      let best_found = false;
      let fitness_sum = 0;

      for (const organism of this.population) {
        if (organism.alive) fitness_sum += organism.fitness!;
        if (!best_found && organism.alive) {
          this.best_fitness = organism.fitness!;
          best_found = true;
        }
        this.grid.clear_cell_state(organism.coordinate);
      }

      this.overall_fitness = this.alive > 0 ? fitness_sum / this.alive : 0;

      // Select and Crossover individuals.
      this.population = select_and_crossover(this.population, this.config);

      // Reset tick count and increment generation count.
      this.ticks = 0;
      this.generation++;
    } else {
      // Iterate through Organism list and perform action.
      this.alive = 0;

      for (const organism of this.population) {
        if (organism.alive) {
          this.alive++;
          const offset = organism.action();
          const new_coordinate = add_vector(organism.coordinate, offset);
          if (this.grid.is_valid_cell_at(new_coordinate) && this.grid.is_cell_empty(new_coordinate)) {
            // Update direction
            organism.direction = offset;
            organism.coordinate = new_coordinate;
          } else if (this.grid.is_valid_cell_at(new_coordinate) && this.grid.get_cell_at(new_coordinate).state == CellStates.RADIOACTIVE) {
            // Clear Cell.
            this.grid.clear_cell_state(organism.coordinate);
            organism.alive = false;
            this.alive--;
          }
        }
      }
    }
    this.ticks++;
  }

  public render(): void {
    for (const cell of this.renderer.to_clear) {
      if (!cell.is_selected) this.renderer.clear_cell(cell);
      else this.renderer.fill_cell(cell);
    }

    for (const cell of this.renderer.to_fill) {
      this.renderer.fill_cell(cell);
    }

    this.renderer.to_clear.clear();
    this.renderer.to_fill.clear();
  }
}