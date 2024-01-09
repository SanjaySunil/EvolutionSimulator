import { DefaultSimulationConfig } from "../config/simulation.config";
import Organism from "../models/Organism";
import { euclidean_distance } from "../utils/geometry";
import Gene from "../models/Gene";

// Merges two sorted arrays of organisms into a single sorted array.
export function merge(left: Organism[], right: Organism[]): Organism[] {
  const result: Organism[] = [];
  let left_index = 0;
  let right_index = 0;

  // Iterate through both arrays and merge them while maintaining sorting.
  while (left_index < left.length && right_index < right.length) {
    if (left[left_index].fitness! < right[right_index].fitness!) {
      result.push(left[left_index]);
      left_index++;
    } else {
      result.push(right[right_index]);
      right_index++;
    }
  }

  // Concatenate remaining elements from both arrays into the result.
  return result.concat(left.slice(left_index)).concat(right.slice(right_index));
}

// Performs merge sort on an array of organisms.
export function merge_sort(arr: Organism[]): Organism[] {
  if (arr.length <= 1) return arr;

  // Calculate the middle index of the array.
  const middle = Math.floor(arr.length / 2);

  // Recursively divide the array into two halves and perform merge sort on each half.
  const left = merge_sort(arr.slice(0, middle));
  const right = merge_sort(arr.slice(middle));

  // Merge the sorted halves using the 'merge' function and return the result.
  return merge(left, right);
}

// Function to sort the population of organisms based on their fitness and calculate their fitness values.
export function calculate_and_sort_fitness(population: Organism[], goal: string, params?: any): Organism[] {
  // Calculate fitness values for organisms based on the specified goal.
  if (goal === "food") {
    for (const organism of population) {
      organism.fitness = calculate_fitness_by_food(organism);
    }
  } else if (goal === "coord") {
    for (const organism of population) {
      organism.fitness = calculate_fitness_by_coord(organism, params);
    }
  }

  // Sort the population based on fitness using merge sort algorithm and return the sorted population.
  return merge_sort(population);
}

/**
 * Calculates the fitness value of an organism based on its energy level.
 * @param organism - The organism for which fitness is being calculated.
 * @returns The calculated fitness value based on the organism's energy level.
 */
export function calculate_fitness_by_food(organism: any): number {
  return 1 - organism.energy / organism.config.MAX_ENERGY;
}

/**
 * Calculates the fitness value of an organism based on its proximity to specified coordinates.
 * @param organism - The organism for which fitness is being calculated.
 * @param params - Parameters containing goal coordinates and maximum distances to goal for fitness calculation.
 * @returns The calculated fitness value based on the organism's proximity to the goal coordinates.
 */
export function calculate_fitness_by_coord(organism: any, params: any): number {
  const results: number[] = [];

  // Calculate distances between the organism's coordinate and each goal coordinate
  for (const coordinate of params.goal_coordinates) {
    results.push(euclidean_distance(organism.coordinate, coordinate));
  }

  // Find the minimum distance index to determine the maximum distance to normalize fitness
  const min_index = results.indexOf(Math.min(...results));
  const distance = results[min_index];
  const max_distance = params.max_distances_to_goal[min_index];

  // Normalize fitness score by dividing the distance by the maximum distance
  return distance / max_distance;
}

/**
 * Selects organisms for crossover and creates a new generation based on the provided population and configuration.
 * @param population - The array of organisms from which selection for crossover is performed.
 * @param config - The configuration object defining parameters for selection and crossover.
 * @returns A new generation of organisms created through crossover and reproduction.
 */
export function select_and_crossover(population: Organism[], config: typeof DefaultSimulationConfig): Organism[] {
  const new_generation: Organism[] = [];
  const elitism_size: number = Math.floor((config.ELITISM_PERCENT * population.length) / 100);

  // Perform elitism by selecting the top organisms from the current population
  new_generation.push(...population.slice(0, elitism_size));

  // Generate new coordinates for the selected organisms
  for (const organism of new_generation) {
    const random_coord = organism.grid.fetch_empty_cell();
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

/**
 * Mates with another organism to produce a child organism.
 * @param parent - The first parent organism.
 * @param partner - The second parent organism.
 * @param id - The ID of the child organism.
 * @returns A new child organism resulting from the mating process of the parent organisms.
 */
function mate(parent, partner: Organism, id): Organism {
  // Create an array to store the child organism's genome
  const child_genome: Gene[] = new Array(parent.genome.data.length);

  // Loop through each gene in the parent organisms' genomes
  for (let i = 0; i < parent.genome.data.length; i++) {
    // Retrieve genes from the parent organisms
    const organism_gene: Gene = parent.genome.data[i];
    const partner_gene: Gene = partner.genome.data![i];

    // Generate a random probability value
    const random_probability: number = Math.random();

    // Calculate the selection probability for choosing genes from parents
    const selection_probability = (100 - parent.config.MUTATION_PERCENT) / 2 / 100;

    // Decide which gene to select based on the random probability
    if (random_probability < selection_probability) {
      // Select the gene from the first parent
      child_genome[i] = organism_gene;
    } else if (random_probability < selection_probability * 2) {
      // Select the gene from the second parent
      child_genome[i] = partner_gene;
    } else {
      // If no gene is selected, create a new gene
      child_genome[i] = new Gene(parent.config.NUMBER_OF_HIDDEN_NEURONS);
    }
  }

  // Get a random empty cell coordinate on the grid
  const random_coord = parent.grid.fetch_empty_cell();

  // Create and return a new organism with the generated genome and a random empty cell coordinate
  return new Organism(random_coord, child_genome, parent.grid, parent.config, id);
}
