import { SimulationConfig } from "../config";
import Organism from "../organism";
import get_random_vector from "../utils/get_random_vector";
import { euclidean_distance } from "./Coordinate";

// Function to calculate the absolute difference between two values
export function optimise_to_side(organism_coord_component, point_component): number {
  return (Math.max(organism_coord_component, point_component) - Math.min(organism_coord_component, point_component));
}

// Function to calculate the fitness of an organism based on its coordinate and a target point
export function calculate_fitness(coord, point): number {
  return euclidean_distance(coord, point);
}

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
export function sort_and_calculate_fitness(population: Organism[], coordinate): Organism[] {
  for (const organism of population) {
    organism.fitness = calculate_fitness(organism.coordinate, coordinate);
  }

  // Sort the population based on fitness using merge sort
  // population.sort((a, b) => a.fitness! - b.fitness!);
  population = merge_sort(population);
  return population;
}

// Function to select organisms for crossover and create a new generation
export function select_and_crossover(population: Organism[], config: typeof SimulationConfig): Organism[] {
  const new_generation: Organism[] = [];
  const elitism_size: number = Math.floor((config.ELITISM_PERCENT * population.length) / 100);

  // Perform elitism by selecting the top organisms from the current population
  new_generation.push(...population.slice(0, elitism_size));

  // Generate new coordinates for the selected organisms
  for (const organism of new_generation) {
    let random_coord = get_random_vector(0, 0, config.GRID_SIZE - 1, config.GRID_SIZE - 1);

    // Find an empty cell in the environment grid for the organism
    while (!organism.environment.grid.is_cell_empty(random_coord)) {
      random_coord = get_random_vector(0, 0, config.GRID_SIZE - 1, config.GRID_SIZE - 1);
    }

    organism.coordinate = random_coord;
  }

  const mating_size: number = Math.floor(((100 - config.ELITISM_PERCENT) * population.length) / 100);

  // Perform crossover by randomly selecting parents and creating offspring
  for (let i = 0; i < mating_size; i++) {
    const parent1: Organism = population[Math.floor(Math.random() * 50)];
    const parent2: Organism = population[Math.floor(Math.random() * 50)];
    const child: Organism = parent1.mate(parent2);
    new_generation.push(child);
  }

  return new_generation;
}
