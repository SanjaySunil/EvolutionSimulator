/** Identifiers for each type of neuron. */
export const NeuronTypes = {
  SENSOR: 1,
  ACTION: 1,
  NEURON: 0,
};

/** A computational unit for the neural network. */
export class Neuron {
  /** Output value of the neuron. */
  public output: number;
  /** Undriven neurons have fixed output values. */
  public driven: boolean;
  /** Builds a new neuron. */
  constructor() {
    this.output = 0.0;
    this.driven = false;
  }
}
