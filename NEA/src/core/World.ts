import { SimulationConfig } from "../config/simulation.config";
import { CellStates } from "../constants/CellStates";
import CanvasController from "../controllers/canvas.controller";
import ChartController from "../controllers/chart.controller";
import { NodeType, OrganismController } from "../controllers/organism.controller";
import Vector from "../math/vector.math";
import Organism from "../models/Organism";
import get_random_vector from "../utils/get_random_vector";
import { Genome } from "../models/Genome";
/** World Class */
export default class World extends CanvasController {
  public organism_manager: OrganismController;
  public entities: any;
  public ticks: number;
  public first_organism: any;
  public species: number;
  public world_initialized: boolean;
  public organism_data_points: any[];
  public species_data_points: any[];
  public statistics: any;
  public dead_data_points: any[];
  public dead: number;
  public reproduction_queue: any[];
  public switch_region: boolean;

  /** Initializes a new world. */
  constructor(canvas_id: string, canvas_size: number, grid_size: number) {
    super(canvas_id, canvas_size, grid_size);
    this.organism_manager = new OrganismController();
    this.ticks = 0;
    this.species = 0;
    this.dead = 0;
    this.world_initialized = false;
    this.organism_data_points = [];
    this.species_data_points = [];
    this.dead_data_points = [];
    this.statistics = new ChartController("organism_chart");
    this.statistics.add_config("Organisms", "Ticks", "Organisms", this.organism_data_points);
    this.statistics.add_config("Species", "Ticks", "Species", this.species_data_points);
    this.statistics.add_config("Dead", "Ticks", "Dead", this.dead_data_points);
    this.reproduction_queue = [];
    this.statistics.switch_chart(0);
    this.switch_region = false;
  }

  /**
   * Add an organism to the environment, ensuring number of organisms does not
   * exceed max organisms.
   */
  public add_organism(organism: Organism): void {
    if (this.organism_manager.size < SimulationConfig.MAX_ORGANISMS) {
      this.organism_manager.insert_at_tail(organism);
    } else {
      console.log("could not insert org");
    }
  }

  /** Drop food at a specified vector. */
  public drop_food(v: Vector): void {
    /** Is empty cell. */
    if (this.grid.get_cell_at(v).state == CellStates.EMPTY) {
      this.grid.set_cell_at(v, CellStates.FOOD);
    }
  }

  /** Origin of life. */
  public initalize(): void {
    if (this.grid_size % 2 == 0) {
      alert("Grid size must be an odd number.");
      throw Error("odd number required for grid size");
    }

    /** Initial Food Population * */
    for (let i = 0; i < SimulationConfig.INITIAL_FOOD_POPULATION * this.grid.number_of_cells; ) {
      /** Throws an error is grid is full. */
      if (this.grid.is_full()) {
        alert("Grid size capacity exceeded! Too much food.");
        throw Error("Grid size capacity exceeded.");
      }

      const v = get_random_vector(0, 0, SimulationConfig.GRID_SIZE - 1, SimulationConfig.GRID_SIZE - 1);

      if (!this.grid.is_cell_occupied(v)) {
        this.drop_food(v);
        i++;
      }
    }

    /** Initial Organism Population */
    for (let i = 0; i < SimulationConfig.INITIAL_ORG_POPULATION; ) {
      /** Throws an error is grid is full. */
      if (this.grid.is_full()) {
        alert("Grid size capacity exceeded! Too many organisms.");
        throw Error("Grid size capacity exceeded.");
      }

      const v = get_random_vector(0, 0, SimulationConfig.GRID_SIZE - 1, SimulationConfig.GRID_SIZE - 1);

      if (!this.grid.is_cell_occupied(v)) {
        const org = new Organism(v.x, v.y, this, null);
        this.add_organism(org);
        i++;
      }
    }

    this.world_initialized = true;
  }

  /** Update tick and organism count. */
  public update_tick_and_organism_count(): void {
    const tick_count = document.getElementById("tick_count") as HTMLSpanElement;
    tick_count.innerHTML = this.ticks.toString();
    const organism_count = document.getElementById("organism_count") as HTMLSpanElement;
    organism_count.innerHTML = this.organism_manager.size.toString();
    const number_of_species = document.getElementById("number_of_species") as HTMLSpanElement;
    number_of_species.innerHTML = this.species.toString();

    if (this.ticks == 0 || this.ticks % 100 == 0) {
      this.organism_data_points.push({
        x: this.ticks,
        y: this.organism_manager.size,
      });

      this.species_data_points.push({
        x: this.ticks,
        y: this.species,
      });

      this.dead_data_points.push({
        x: this.ticks,
        y: this.dead,
      });

      this.dead = 0;

      this.statistics.chart.render();
    }
  }

  /** Update environment method. */
  public update(): void {
    if (this.organism_manager.head) {
      let next_node: NodeType = this.organism_manager.head;
      const species = new Set<string>();
      let alive = 0;

      while (next_node) {
        const current_node = next_node;
        next_node = current_node.next;

        if (current_node) {
          /** Perform organism function. */
          current_node.organism.function();
          current_node.organism.energy -= Math.pow(current_node.organism.coord.x, 0.0095 * current_node.organism.coord.x) - 1;
          if (this.ticks % 500 == 0) {
            this.switch_region = !this.switch_region;
          }
          if (this.switch_region) {
            current_node.organism.energy -= Math.pow(current_node.organism.coord.x, 0.0095 * current_node.organism.coord.x) - 1;
          } else {
            current_node.organism.energy -= Math.pow(current_node.organism.coord.x, 0.0095 * current_node.organism.coord.x) - 1;
          }
          // if (this.ticks % 500 == 0) {
          //   this.switch_region = !this.switch_region;
          //   if (this.switch_region) {
          //     current_node.organism.energy -= Math.pow(2, 0.05 * current_node.organism.coord.x) * 10;
          //   } else {
          //     current_node.organism.energy -= Math.pow(2, 0.05 * current_node.organism.coord.x) * 10;
          //   }
          // }
          /** Check if organism is alive, and add to species list. */
          if (current_node.organism.alive) {
            species.add(current_node.organism.genome.colour);
            alive++;
          } else {
            this.dead++;
            /** This function has a linked list issue. */
            // this.organism_manager.delete(current_node);
          }
        }
      }

      this.organism_manager.size = alive;
      this.species = species.size;

      while (this.reproduction_queue.length >= 2) {
        const first = this.reproduction_queue[0];
        const second = this.reproduction_queue[1];
        first.is_in_reproduction_queue = false;
        second.is_in_reproduction_queue = false;
        console.log(first.id, second.id);
        this.reproduction_queue.splice(0, 2);

        let org = new Organism(first.coord.x, first.coord.y, this, first);
        // console.log(first.genome.data.length, second.genome.data.length);
        let half = Math.ceil(first.length / 2);
        let genome = new Genome(org, first.genome.data.slice(0, half).concat(second.genome.data.slice(half)));
        console.log(genome);
        // /** Push to world. */
        org.genome = genome;
        this.add_organism(org);

        org = new Organism(second.coord.x, second.coord.y, this, second);
        // console.log(second.genome.data.length, second.genome.data.length);
        half = Math.ceil(second.length / 2);
        genome = new Genome(org, second.genome.data.slice(0, half).concat(first.genome.data.slice(half)));
        console.log(genome);
        // /** Push to world. */
        org.genome = genome;
        this.add_organism(org);
      }
    }

    /** Scatter [SimulationConfig.FOOD_DROP_PER_TICK] food per tick. */
    for (let i = 0; i < SimulationConfig.FOOD_DROP_PER_TICK; ) {
      /** Check if the grid is full before placing food. */
      if (this.grid.is_full()) {
        console.log("could not place any more food.");
        break;
      }

      const center = (SimulationConfig.GRID_SIZE - 1) / 2;

      const v = get_random_vector(0, 0, SimulationConfig.GRID_SIZE - 1, SimulationConfig.GRID_SIZE - 1);

      if (!this.grid.is_cell_occupied(v)) {
        this.drop_food(v);
        i++;
      }
    }

    /** Increment tick count. */
    this.ticks++;
    this.update_tick_and_organism_count();
  }

  public render(): void {
    for (const cell of this.renderer.to_clear) {
      this.renderer.clear_cell(cell);
    }

    for (const cell of this.renderer.to_fill) {
      this.renderer.fill_cell(cell);
    }

    this.renderer.to_clear.clear();
    this.renderer.to_fill.clear();
  }
}
