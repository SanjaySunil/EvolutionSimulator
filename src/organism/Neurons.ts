export const ActionNeurons = {
  MOVE_X: 0,
  MOVE_Y: 1,
  MOVE_NORTH: 2,
  MOVE_EAST: 3,
  MOVE_SOUTH: 4,
  MOVE_WEST: 5,
};

/** Abbreviations of Action Neuron Symbols. */
export const ActionNeuronSymbols = ["MX", "MY", "MN", "ME", "MS", "MW"];

export const SensorNeurons = {
  X_COORDINATE: 1,
  Y_COORDINATE: 2,
  BOUNDARY_NORTH: 3,
  BOUNDARY_EAST: 4,
  BOUNDARY_SOUTH: 5,
  BOUNDARY_WEST: 6,
  LOOK_NORTH: 7,
  LOOK_EAST: 8,
  LOOK_SOUTH: 9,
  LOOK_WEST: 10,
};

/** Abbreviations of Sensor Neuron Symbols. */
export const SensorNeuronSymbols = ["XC", "YC", "BN", "BE", "BS", "BW", "LN", "LE", "LS", "LW"];

/** Identifiers for each type of neuron. */
export const NeuronTypes = {
  SENSOR: 1,
  ACTION: 1,
  NEURON: 0,
};

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
