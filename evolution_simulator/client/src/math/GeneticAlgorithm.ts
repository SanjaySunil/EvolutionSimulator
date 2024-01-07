import { SimulationConfig } from "../config/simulation.config";
import Organism from "../models/Organism";
import { euclidean_distance } from "../utils/geometry";

// Function to calculate the absolute difference between two values
export function optimise_to_side(organism_coord_component, point_component): number {
  return Math.max(organism_coord_component, point_component) - Math.min(organism_coord_component, point_component);
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
export function sort_and_calculate_fitness(population: Organism[], goal_coordinates, max_distances_to_goal): Organism[] {
  for (const organism of population) {
    const results: number[] = [];

    for (const coordinate of goal_coordinates) {
      results.push(euclidean_distance(organism.coordinate, coordinate));
    }

    const index = results.indexOf(Math.min(...results));
    const distance = Math.min(...results);
    const max_distance = max_distances_to_goal[index];
    const normalized_distance = 1 - distance / max_distance;
    const normalized_energy = organism.energy / organism.config.MAX_ENERGY;
    organism.fitness = 1 - (0.5 * normalized_distance + 0.5 * normalized_energy);
  }

  // population.sort((a, b) => a.fitness! - b.fitness!);

  // Sort the population based on fitness using merge sort
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
    let random_coord = organism.environment.grid.fetch_empty_cell();
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
