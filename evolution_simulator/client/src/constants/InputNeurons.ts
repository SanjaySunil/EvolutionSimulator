// Constant object defining all the available input neurons.
export const InputNeurons = {
  X_COORDINATE: 1, // Input neuron for X-coordinate
  Y_COORDINATE: 2, // Input neuron for Y-coordinate
  BOUNDARY_NORTH: 3, // Input neuron for boundary - North
  BOUNDARY_EAST: 4, // Input neuron for boundary - East
  BOUNDARY_SOUTH: 5, // Input neuron for boundary - South
  BOUNDARY_WEST: 6, // Input neuron for boundary - West
  LOOK_NORTH: 7, // Input neuron for looking direction - North
  LOOK_EAST: 8, // Input neuron for looking direction - East
  LOOK_SOUTH: 9, // Input neuron for looking direction - South
  LOOK_WEST: 10, // Input neuron for looking direction - West
};

// Array of strings representing abbreviated symbols for Input Neurons
export const InputNeuronSymbols = ["XC", "YC", "BN", "BE", "BS", "BW", "LN", "LE", "LS", "LW"];
