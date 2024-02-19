import { DefaultSimulationConfig } from "../config/simulation.config";
import Gene from "../models/Gene";
import Organism from "../models/Organism";
import { Coordinate } from "../types/Coordinate";
import { euclidean_distance } from "../utils/geometry";

// Define the type for coordinate parameters used in fitness calculation.
type CoordinateParameters = {
  goal_coordinates: Coordinate[];
  max_distances_to_goal: number[];
};

/**
 * Merges two sorted arrays of organisms into a single sorted array.
 * @param left - the left array of organisms.
 * @param right - the right array of organisms.
 * @returns - A single sorted array of organisms.
 */
export function merge(left: Organism[], right: Organism[]): Organism[] {
  // Create an empty array to store the merged result.
  const array_of_organisms: Organism[] = [];
  // Define indices for the left and right of the arrays.
  let left_index = 0;
  let right_index = 0;

  // Iterate through both arrays and merge them while maintaining sorting.
  while (left_index < left.length && right_index < right.length) {
    // Compare the fitness of the organisms.
    if (left[left_index].fitness! < right[right_index].fitness!) {
      array_of_organisms.push(left[left_index]);
      left_index++;
    } else {
      array_of_organisms.push(right[right_index]);
      right_index++;
    }
  }

  // Concatenate remaining elements from both arrays into the result.
  return array_of_organisms.concat(left.slice(left_index)).concat(right.slice(right_index));
}

/**
 * Performs merge sort on an array of organisms.
 * @param arr - The array of organisms to be sorted.
 * @returns - A sorted array of organisms.
 */
export function merge_sort(arr: Organism[]): Organism[] {
  // Return the array if it contains only one element or is empty.
  if (arr.length <= 1) return arr;

  // Calculate the middle index of the array.
  const middle = Math.floor(arr.length / 2);

  // Recursively divide the array into two halves and perform merge sort on each half.
  const left = merge_sort(arr.slice(0, middle));
  const right = merge_sort(arr.slice(middle));

  // Merge the sorted halves using the 'merge' function and return the result.
  return merge(left, right);
}

/**
 * Calculates the fitness value of an organism based on the specified goal and parameters.
 * @param organism - The organism for which fitness is being calculated.
 * @param goal - The goal of the simulation.
 * @param coordinate_parameters - Parameters containing goal coordinates and maximum distances to goal for fitness calculation.
 * @returns - The calculated fitness value based on the organism's proximity to the goal coordinates or energy level.
 */
export function calculate_fitness(organism: Organism, goal: string, coordinate_parameters?: CoordinateParameters): number {
  // Use the specified goal to calculate the fitness value for the organism.
  if (goal === "food") {
    // Calculate fitness based on the organism's energy level.
    return calculate_fitness_by_food(organism);
  } else if (goal === "coord" && coordinate_parameters) {
    // Calculate fitness based on the organism's proximity to the goal coordinates.
    return calculate_fitness_by_coord(organism, coordinate_parameters);
  } else {
    // Throw an error if an invalid goal type is specified.
    throw new Error("Invalid goal type specified.");
  }
}

/**
 * Sorts an array of organisms based on their fitness and calculates their fitness values.
 * @param population - The array of organisms to be sorted.
 * @param goal - The goal of the simulation.
 * @param coordinate_parameters - Parameters containing goal coordinates and maximum distances to goal for fitness calculation.
 * @returns - A sorted array of organisms.
 */
export function calculate_and_sort_fitness(population: Organism[], goal: string, coordinate_parameters?: CoordinateParameters): Organism[] {
  // Calculate fitness values for organisms based on the specified goal.
  for (const organism of population) {
    organism.fitness = calculate_fitness(organism, goal, coordinate_parameters);
  }
  // Sort the population based on fitness using merge sort algorithm and return the sorted population.
  return merge_sort(population);
}

/**
 * Calculates the fitness value of an organism based on its energy level.
 * @param organism - The organism for which fitness is being calculated.
 * @returns - The calculated fitness value based on the organism's energy level.
 */
export function calculate_fitness_by_food(organism: Organism): number {
  // Normalize fitness score by dividing the energy level by the maximum energy.
  return 1 - organism.energy / organism.config.MAX_ENERGY;
}

/**
 * Calculates the fitness value of an organism based on its proximity to specified coordinates.
 * @param organism - The organism for which fitness is being calculated.
 * @param coordinate_parameters - Parameters containing goal coordinates and maximum distances to goal for fitness calculation.
 * @returns - The calculated fitness value based on the organism's proximity to the goal coordinates.
 */
export function calculate_fitness_by_coord(organism: Organism, coordinate_parameters: CoordinateParameters): number {
  // Create an array to store distances between the organism's coordinate and each goal coordinate.
  const distances_to_goal_coordinates: number[] = [];

  // Calculate euclidean distance between the organism's coordinate and each goal coordinate.
  for (const coordinate of coordinate_parameters.goal_coordinates) {
    distances_to_goal_coordinates.push(euclidean_distance(organism.coordinate, coordinate));
  }

  // Find the minimum distance index to determine the maximum distance to normalize fitness
  const min_index = distances_to_goal_coordinates.indexOf(Math.min(...distances_to_goal_coordinates));
  const distance = distances_to_goal_coordinates[min_index];
  // Get the maximum distance to normalize fitness.
  const max_distance = coordinate_parameters.max_distances_to_goal[min_index];

  // Normalize fitness score by dividing the distance by the maximum distance
  return distance / max_distance;
}

/**
 * Selects organisms for crossover and creates a new generation based on the provided population and configuration.
 * @param population - The array of organisms from which selection for crossover is performed.
 * @param config - The configuration object defining parameters for selection and crossover.
 * @returns - A new generation of organisms created through crossover and reproduction.
 */
export function select_and_crossover(population: Organism[], config: typeof DefaultSimulationConfig): Organism[] {
  // Create an array to store the new generation of organisms
  const new_generation: Organism[] = [];
  // Calculate the number of organisms to be selected for elitism
  const elitism_size: number = Math.floor((config.ELITISM_PERCENT * population.length) / 100);

  // Perform elitism by selecting the top organisms from the current population
  new_generation.push(...population.slice(0, elitism_size));

  // Generate new coordinates for the selected organisms
  for (const organism of new_generation) {
    const random_coord = organism.grid.fetch_empty_cell();
    organism.coordinate = random_coord;
  }

  // Calculate the number of organisms to be selected for mating
  const mating_size: number = Math.floor(((100 - config.ELITISM_PERCENT) * population.length) / 100);

  // Perform crossover by randomly selecting parents and creating offspring
  for (let i = 0; i < mating_size; i++) {
    // Select two random parents from the top organisms in the population and mate them.
    const parent1: Organism = population[Math.floor(Math.random() * ((config.TOP_PERCENT_TO_REPRODUCE / 100) * population.length))];
    const parent2: Organism = population[Math.floor(Math.random() * ((config.TOP_PERCENT_TO_REPRODUCE / 100) * population.length))];
    const child: Organism = mate(parent1, parent2);
    // Add the child organism to the new generation.
    new_generation.push(child);
  }

  // Return the new generation of organisms created through crossover and reproduction.
  return new_generation;
}

/**
 * Mates with another organism to produce a child organism.
 * @param parent - The first parent organism.
 * @param partner - The second parent organism.
 * @param id - The ID of the child organism.
 * @returns - A new child organism resulting from the mating process of the parent organisms.
 */
function mate(parent, partner: Organism): Organism {
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
      child_genome[i] = new Gene();
    }
  }

  // Get a random empty cell coordinate on the grid
  const random_coord = parent.grid.fetch_empty_cell();

  // Create and return a new organism with the generated genome and a random empty cell coordinate
  return new Organism(random_coord, child_genome, parent.grid, parent.config);
}
