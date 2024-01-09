// Identifiers for each type of neuron.
export const Neurons = {
  INPUT: 1,
  OUTPUT: 1,
  HIDDEN: 0,
};

export class Neuron {
  // Output value of the neuron.
  public output: number;
  // Undriven neurons have fixed output values.
  public driven: boolean;
  // Builds a new neuron.
  constructor() {
    this.output = 0.0;
    this.driven = false;
  }
}