import { DefaultSimulationConfig } from "../config/simulation.config";
import Organism from "../models/Organism";
import { euclidean_distance } from "../utils/geometry";
import Gene from "../models/Gene";

// Function to merge two sorted arrays of organisms
export function merge(left: Organism[], right: Organism[]): Organism[] {
  const result: Organism[] = [];
  let left_index = 0;
  let right_index = 0;

  while (left_index < left.length && right_index < right.length) {
    if (left[left_index].fitness! < right[right_index].fitness!) {
      result.push(left[left_index]);
      left_index++;
    } else {
      result.push(right[right_index]);
      right_index++;
    }
  }

  return result.concat(left.slice(left_index)).concat(right.slice(right_index));
}

// Function to perform merge sort on an array of organisms
export function merge_sort(arr: Organism[]): Organism[] {
  if (arr.length <= 1) return arr;
  const middle = Math.floor(arr.length / 2);
  const left = merge_sort(arr.slice(0, middle));
  const right = merge_sort(arr.slice(middle));
  return merge(left, right);
}

// Function to sort the population of organisms based on their fitness and calculate their fitness values
export function calculate_and_sort_fitness(population: Organism[], goal, params?): Organism[] {
  if (goal == "food") {
    for (const organism of population) {
      organism.fitness = calculate_fitness_by_food(organism);
    }
  } else if (goal == "coord") {
    for (const organism of population) {
      organism.fitness = calculate_fitness_by_coord(organism, params);
    }
  }

  // Sort the population based on fitness using merge sort
  population = merge_sort(population);
  return population;
}

export function calculate_fitness_by_food(organism) {
  return 1 - organism.energy / organism.config.MAX_ENERGY;
}

export function calculate_fitness_by_coord(organism, params) {
  const results: number[] = [];

  for (const coordinate of params.goal_coordinates) {
    results.push(euclidean_distance(organism.coordinate, coordinate));
  }

  // Take the minimum of maximum distances to calculate the best fitness of the Organism.
  const min_index = results.indexOf(Math.min(...results));
  const distance = results[min_index];
  const max_distance = params.max_distances_to_goal[min_index];
  // Normalize fitness score by diving by the maximum distance.
  return distance / max_distance;
}

// Function to select organisms for crossover and create a new generation
export function select_and_crossover(population: Organism[], config: typeof DefaultSimulationConfig): Organism[] {
  const new_generation: Organism[] = [];
  const elitism_size: number = Math.floor((config.ELITISM_PERCENT * population.length) / 100);

  // Perform elitism by selecting the top organisms from the current population
  new_generation.push(...population.slice(0, elitism_size));

  // Generate new coordinates for the selected organisms
  for (const organism of new_generation) {
    let random_coord = organism.grid.fetch_empty_cell();
    organism.coordinate = random_coord;
  }

  const mating_size: number = Math.floor(((100 - config.ELITISM_PERCENT) * population.length) / 100);

  // Perform crossover by randomly selecting parents and creating offspring
  for (let i = 0; i < mating_size; i++) {
    const parent1: Organism = population[Math.floor(Math.random() * ((config.TOP_PERCENT_TO_REPRODUCE / 100) * population.length))];
    const parent2: Organism = population[Math.floor(Math.random() * ((config.TOP_PERCENT_TO_REPRODUCE / 100) * population.length))];
    const child: Organism = mate(parent1, parent2, population.length);
    new_generation.push(child);
  }

  return new_generation;
}

// Mates with another organism to produce a child organism.
function mate(parent, partner: Organism, id): Organism {
  const child_genome: Gene[] = new Array(parent.genome.data.length);

  for (let i = 0; i < parent.genome.data.length; i++) {
    const organism_gene: Gene = parent.genome.data[i];
    const partner_gene: Gene = partner.genome.data![i];
    const random_probability: number = Math.random();

    const selection_probability = (100 - parent.config.MUTATION_PERCENT) / 2 / 100;
    if (random_probability < selection_probability) {
      child_genome[i] = organism_gene;
    } else if (random_probability < selection_probability * 2) {
      child_genome[i] = partner_gene;
    } else {
      child_genome[i] = new Gene(parent.config.NUMBER_OF_HIDDEN_NEURONS);
    }
  }

  let random_coord = parent.grid.fetch_empty_cell();

  return new Organism(random_coord, child_genome, parent.grid, parent.config, id);
}
