import { cloneDeep } from "lodash";
import Directions from "../constants/Directions";
import { InputNeurons } from "../constants/InputNeurons";
import { AllCellStates, Grid } from "../environment/Grid";
import weight_as_float from "../utils/weight_as_float";
import { add_vector, euclidean_distance } from "../utils/geometry";
import Gene from "./Gene";
import { Neuron, Neurons } from "./Neurons";
import { Coordinate } from "./types/Coordinate";

type ConnectionArray = Array<Gene>;
type HiddenNeuronMap = Map<number, HiddenNeuron>;

// Class representing a HiddenNeuron in a neural network.
export class HiddenNeuron {
  // Unique identifier for the hidden neuron.
  public identifer;
  // Number of incoming connections that are from either sensors or other neurons.
  public inputs;
  // Number of outcoming connections from the neuron.
  public outputs;
  // Number of input connections that go back into the neuron.
  public self_inputs;
}

export default class Brain {
  public coordinate: Coordinate;
  public grid: Grid;
  public genome_data: Gene[];
  // Used temporarily to store the neural network's inputs, outputs, and hidden neurons.
  public inputs: object;
  public outputs: object;
  public hidden: object;
  // Complete list of hidden neurons.
  public hidden_neurons: Neuron[];
  // All neural network connections.
  public connections: Gene[];
  // Number of sensors, neurons and actions.
  public num_input_neurons: number;
  public num_hidden_neurons: number;
  public num_output_neurons: number;

  constructor(coordinate, grid, genome_data, num_input_neurons: number, num_hidden_neurons: number, num_output_neurons: number) {
    // References to the organism's coordinate and the grid.
    this.coordinate = coordinate;
    this.grid = grid;
    this.genome_data = genome_data;
    this.inputs = {};
    this.outputs = {};
    this.hidden = {};
    this.hidden_neurons = [];
    this.connections = [];
    this.num_input_neurons = num_input_neurons;
    this.num_hidden_neurons = num_hidden_neurons;
    this.num_output_neurons = num_output_neurons;
    this.wire_brain();
  }

  // Method to convert an organism's genome into a neural network brain.
  public wire_brain(): void {
    // List to store neural network connections.
    const connections: ConnectionArray = this.obtain_connections();

    // Map of neurons and their number of inputs and outputs.
    const hidden_neuron_map: HiddenNeuronMap = this.create_hidden_neuron_map(connections);

    // Remove connections to neurons with no outputs or neurons that feed themselves.
    this.prune_connections(connections, hidden_neuron_map);

    // Create a renumbered connection array based on the node map.
    this.create_connections(connections, hidden_neuron_map);
    this.create_hidden_neuron_array(hidden_neuron_map);
  }

  // Allows the organism to look in a specific direction and return the state of the cell.
  public observation_sensor(direction: number): number {
    let current_vector = { x: this.coordinate.x, y: this.coordinate.y };
    let vector: Coordinate;

    // Determine the vector based on the direction parameter.
    if (direction == InputNeurons.LOOK_NORTH) vector = Directions.NORTH;
    else if (direction == InputNeurons.LOOK_EAST) vector = Directions.EAST;
    else if (direction == InputNeurons.LOOK_SOUTH) vector = Directions.SOUTH;
    else if (direction == InputNeurons.LOOK_WEST) vector = Directions.WEST;
    else {
      throw Error("Direction not correct.");
    }

    // Update the current vector based on the determined direction.
    current_vector = add_vector(current_vector, vector);

    // Check if the updated vector represents a valid cell in the grid.
    if (this.grid.is_valid_cell_at(current_vector)) {
      // Retrieve the cell at the updated vector.
      const cell = this.grid.get_cell_at(current_vector);
      // Return the normalized state of the cell.
      return cell.state / AllCellStates.length;
    }

    // If no valid observation is found, return 0.
    return 0.0;
  }

  // Allows the organism to obtain information about its current coordinates.
  public coordinate_sensor(sensor: number): number {
    if (sensor == InputNeurons.X_COORDINATE && this.grid.grid_size) {
      // Calculate and return the normalized x-coordinate.
      return this.coordinate.x / this.grid.grid_size;
    } else if (sensor == InputNeurons.Y_COORDINATE && this.grid.grid_size) {
      // Calculate and return the normalized y-coordinate.
      return this.coordinate.y / this.grid.grid_size;
    } else if (sensor == InputNeurons.BOUNDARY_NORTH) {
      // Calculate and return the normalized distance to the northern boundary.
      return euclidean_distance(this.coordinate, { x: this.coordinate.x, y: 0 }) / this.grid.grid_size;
    } else if (sensor == InputNeurons.BOUNDARY_WEST) {
      // Calculate and return the normalized distance to the western boundary.
      return euclidean_distance(this.coordinate, { x: 0, y: this.coordinate.y }) / this.grid.grid_size;
    } else if (sensor == InputNeurons.BOUNDARY_EAST) {
      // Calculate and return the normalized distance to the eastern boundary.
      return euclidean_distance(this.coordinate, { x: this.grid.grid_size, y: this.coordinate.y }) / this.grid.grid_size;
    } else if (sensor == InputNeurons.BOUNDARY_SOUTH) {
      // Calculate and return the normalized distance to the southern boundary.
      return euclidean_distance(this.coordinate, { x: this.coordinate.x, y: this.grid.grid_size }) / this.grid.grid_size;
    } else {
      // Return 0.0 if the sensor doesn't match any predefined sensor type.
      return 0.0;
    }
  }

  // Obtain value from a specific sensor. Sensors produce a value between 0.0 and 1.0.
  public get_sensor(sensor_id: number): number {
    if (
      [
        InputNeurons.X_COORDINATE,
        InputNeurons.Y_COORDINATE,
        InputNeurons.BOUNDARY_NORTH,
        InputNeurons.BOUNDARY_EAST,
        InputNeurons.BOUNDARY_SOUTH,
        InputNeurons.BOUNDARY_WEST,
      ].includes(sensor_id)
    ) {
      // Call coordinate_sensor method for coordinate-related sensors and return the obtained value.
      return this.coordinate_sensor(sensor_id);
    } else if ([InputNeurons.LOOK_NORTH, InputNeurons.LOOK_EAST, InputNeurons.LOOK_SOUTH, InputNeurons.LOOK_WEST].includes(sensor_id)) {
      // Call observation_sensor method for direction observation sensors and return the obtained value.
      return this.observation_sensor(sensor_id);
    }
    // Return 0.0 for sensors that don't match any predefined type.
    return 0.0;
  }

  // Performs a feed-forward computation in the neural network. Returns an array of output levels for all action neurons.
  public feed_forward(): number[] {
    // This array stores the output levels for all of the action neurons.
    const action_levels = new Array(this.num_output_neurons).fill(0.0);

    // The weighted inputs to each neuron are accumulated in neuron_accumulators.
    const neuron_accumulators = new Array(this.hidden_neurons.length).fill(0.0);

    let neuron_outputs_computed = false;
    for (const connection of this.connections) {
      if (connection.sink_type == Neurons.OUTPUT && !neuron_outputs_computed) {
        // Compute the output of neurons in the range (-1.0..1.0) using the hyperbolic tangent function.
        for (let neuron_index = 0; neuron_index < this.hidden_neurons.length; neuron_index++) {
          if (this.hidden_neurons[neuron_index].driven) {
            this.hidden_neurons[neuron_index].output = Math.tanh(neuron_accumulators[neuron_index]);
          }
        }
        neuron_outputs_computed = true;
      }

      // Obtain the input value of the connection from a sensor neuron or another neuron.
      // The values are summed and later passed through a transfer function (hyperbolic tangent function).
      let input_val = 0.0;
      if (connection.source_type == Neurons.INPUT) {
        // Read the sensor data using the sensor identifier.
        input_val = this.get_sensor(connection.source_id);
      } else {
        input_val = this.hidden_neurons[connection.source_id].output;
      }

      // Weight the connection's value and add it to the accumulator of the corresponding neuron or action.
      if (connection.sink_type == Neurons.OUTPUT) {
        action_levels[connection.sink_id] += input_val * weight_as_float(connection.weight);
      } else {
        neuron_accumulators[connection.sink_id] += input_val * weight_as_float(connection.weight);
      }
    }
    return action_levels;
  }

  // Obtain a list of connections from the genome.
  public obtain_connections(): any[] {
    // Initialize an array to store connections.
    const connection_array: ConnectionArray = [];

    // Check if the genome data exists.
    if (this.genome_data) {
      // Iterate through the genome data to process each gene.
      for (const gene of this.genome_data) {
        // Renumber the source neuron or sensor using modulo operator based on the total number of input or hidden neurons.
        if (gene.source_type === Neurons.HIDDEN) {
          gene.source_id %= this.num_hidden_neurons;
        } else {
          gene.source_id %= this.num_input_neurons;
        }

        // Renumber the sink neuron or action using modulo operator based on the total number of output or hidden neurons.
        if (gene.sink_type === Neurons.HIDDEN) {
          gene.sink_id %= this.num_hidden_neurons;
        } else {
          gene.sink_id %= this.num_output_neurons;
        }

        // Add the renumbered gene to the connection list.
        connection_array.push(gene);
      }
    }

    // Return the obtained list of connections.
    return connection_array;
  }

  // Creates a map of neurons and their corresponding input and output counts.
  public create_hidden_neuron_map(connection_array: ConnectionArray): HiddenNeuronMap {
    // Initialize a map to store neurons and their input/output counts.
    const hidden_neuron_map: HiddenNeuronMap = new Map();

    // Iterate through the connection array to process each connection.
    for (const connection of connection_array) {
      // Check if the sink type is a hidden neuron.
      if (connection.sink_type === Neurons.HIDDEN) {
        // Check if the connection is a self-input to the hidden neuron.
        const self_input = connection.source_type == Neurons.HIDDEN && connection.source_id == connection.sink_id;

        // Check if the hidden neuron already exists in the map.
        if (hidden_neuron_map.has(connection.sink_id)) {
          const node = hidden_neuron_map.get(connection.sink_id);
          if (node) {
            // Update the input/output counts for the existing hidden neuron.
            if (self_input) node.self_inputs++;
            else node.inputs++;
          } else {
            // If the neuron is not in the node map, add it with the appropriate input/output values.
            hidden_neuron_map.set(connection.sink_id, {
              identifer: 0,
              outputs: 0,
              self_inputs: self_input ? 1 : 0,
              inputs: self_input ? 0 : 1,
            });
          }
        }
      }

      // Check if the source type is a hidden neuron.
      if (connection.source_type === Neurons.HIDDEN) {
        // Check if the hidden neuron already exists in the map.
        if (hidden_neuron_map.has(connection.source_id)) {
          const node = hidden_neuron_map.get(connection.source_id);
          if (node) node.outputs++;
        } else {
          // If the neuron is not in the node map, add it with the appropriate input/output values.
          hidden_neuron_map.set(connection.source_id, {
            identifer: 0,
            outputs: 1,
            self_inputs: 0,
            inputs: 0,
          });
        }
      }
    }

    // Return the created map of neurons with their input/output counts.
    return hidden_neuron_map;
  }

  // Removes connections to a specific neuron from the connection list and updates the node map accordingly.
  public remove_connections_to_neuron(connection_array: ConnectionArray, hidden_neuron_map: HiddenNeuronMap, neuron_number: number): void {
    // Loop through the connection array.
    for (let i = 0; i < connection_array.length; ) {
      const neuron = connection_array[i];
      // Check if the current connection's sink is the specified neuron.
      if (neuron.sink_type == Neurons.HIDDEN && neuron.sink_id === neuron_number) {
        // If the connection's sink is the specified neuron, handle the removal process.

        // Check if the source of the connection is also a hidden neuron.
        if (neuron.source_type == Neurons.HIDDEN) {
          // If the source is a hidden neuron, decrement the outputs of that neuron in the map.
          const node = hidden_neuron_map.get(neuron.source_id);
          if (node) node.outputs--;
        }

        // Remove the connection from the connection list.
        connection_array.splice(i, 1);
      } else {
        // Move to the next connection in the list.
        i++;
      }
    }
  }

  // Removes useless connections from the connection list and updates the node map accordingly.
  public prune_connections(connections: ConnectionArray, hidden_neuron_map: HiddenNeuronMap): void {
    // Flag to track if connections are pruned.
    let connections_pruned = false;

    // Loop until no more connections are pruned.
    while (!connections_pruned) {
      connections_pruned = true;

      // Iterate through hidden neurons in the map.
      for (const node_number of hidden_neuron_map.keys()) {
        // Retrieve the details of the current node from the map.
        const node = hidden_neuron_map.get(node_number);

        // Look for neurons with zero outputs or neurons that feed themselves.
        if (node && node.outputs === node.self_inputs) {
          // If found, set the flag to false to continue pruning.
          connections_pruned = false;

          // Remove connections leading to the identified neuron and delete it from the map.
          this.remove_connections_to_neuron(connections, hidden_neuron_map, node_number);
          hidden_neuron_map.delete(node_number);
        }
      }
    }
  }

  // Creates a renumbered connection list based on the node map.
  public create_connections(connection_array: ConnectionArray, hidden_neuron_map: HiddenNeuronMap): void {
    let new_number = 0;

    // Renumber neurons in the hidden_neuron_map.
    for (const node of hidden_neuron_map.values()) {
      node.identifer = new_number++;
    }

    // Iterate through connection_array to update connections with renumbered neuron IDs.
    for (const connection of connection_array) {
      if (connection.sink_type == Neurons.HIDDEN) {
        const new_connection = cloneDeep(connection);

        // Fix the destination neuron number using the updated node map.
        const node = hidden_neuron_map.get(new_connection.sink_id);
        if (node) new_connection.sink_id = node.identifer;

        // If the source is a neuron, fix its number too using the updated node map.
        if (new_connection.source_type === Neurons.HIDDEN) {
          const node = hidden_neuron_map.get(new_connection.source_id);
          if (node) new_connection.source_id = node.identifer;
        }

        // Add the modified connection to the updated connections array.
        this.connections.push(new_connection);
      }
    }

    // Process connections from sensor/neuron to an action.
    for (const connection of connection_array) {
      if (connection.sink_type == Neurons.OUTPUT) {
        const new_conn = cloneDeep(connection);

        // If the source is a hidden neuron, fix its number using the updated node map.
        if (new_conn.source_type === Neurons.HIDDEN) {
          const node = hidden_neuron_map.get(new_conn.source_id);
          if (node) new_conn.source_id = node.identifer;
        }

        // Add the modified connection to the updated connections array.
        this.connections.push(new_conn);
      }

      // Group input neurons, hidden neurons, and output neurons into their respective sets.
      if (connection.source_type == Neurons.INPUT) this.inputs[connection.source_id] = undefined;
      else this.hidden[connection.source_id] = undefined;

      if (connection.sink_type == Neurons.OUTPUT) this.outputs[connection.sink_id] = undefined;
      else this.hidden[connection.sink_id] = undefined;
    }
  }

  // Creates a hidden neuron array based on the node map.
  public create_hidden_neuron_array(hidden_neuron_map: HiddenNeuronMap): Neuron[] {
    // Loop through each node in the hidden_neuron_map.
    for (const node of hidden_neuron_map.values()) {
      // Create a new Neuron instance.
      const neuron = new Neuron();
      // Set the initial output to 0.5.
      neuron.output = 0.5;
      // Check if the neuron has inputs to drive its output.
      neuron.driven = node.inputs !== 0;
      // Add the newly created neuron to the hidden_neurons array.
      this.hidden_neurons.push(neuron);
    }
    // Return the updated hidden_neurons array.
    return this.hidden_neurons;
  }
}
