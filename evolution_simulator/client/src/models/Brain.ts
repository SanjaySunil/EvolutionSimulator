import { cloneDeep } from "lodash";
import Directions from "../constants/Directions";
import { InputNeurons } from "../constants/InputNeurons";
import { AllCellStates } from "../environment/Grid";
import weight_as_float from "../utils/connection2float";
import { add_vector, euclidean_distance } from "../utils/geometry";
import Gene from "./Gene";
import { Neuron, Neurons } from "./Neurons";
import Organism from "./Organism";
import { Coordinate } from "./types/Coordinate";

type ConnectionArray = Array<Gene>;
type HiddenNeuronMap = Map<number, HiddenNeuron>;

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
  public owner: Organism;
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

  constructor(owner, num_input_neurons: number, num_hidden_neurons: number, num_output_neurons: number) {
    this.owner = owner;
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

  // Converts an organism's genome into a neural network brain.
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
    let current_vector = { x: this.owner.coordinate.x, y: this.owner.coordinate.y };
    let vector: Coordinate;

    if (direction == InputNeurons.LOOK_NORTH) vector = Directions.NORTH;
    else if (direction == InputNeurons.LOOK_EAST) vector = Directions.EAST;
    else if (direction == InputNeurons.LOOK_SOUTH) vector = Directions.SOUTH;
    else if (direction == InputNeurons.LOOK_WEST) vector = Directions.WEST;
    else {
      throw Error("Direction not correct.");
    }

    current_vector = add_vector(current_vector, vector);

    if (this.owner.grid.is_valid_cell_at(current_vector)) {
      const cell = this.owner.grid.get_cell_at(current_vector);
      return cell.state / AllCellStates.length;
    }

    // No observation found.
    return 0.0;
  }

  // Allows the organism to obtain information about its current coordinates.
  public coordinate_sensor(sensor: number): number {
    if (sensor == InputNeurons.X_COORDINATE && this.owner.grid.grid_size) {
      return this.owner.coordinate.x / this.owner.grid.grid_size;
    } else if (sensor == InputNeurons.Y_COORDINATE && this.owner.grid.grid_size) {
      return this.owner.coordinate.y / this.owner.grid.grid_size;
    } else if (sensor == InputNeurons.BOUNDARY_NORTH) {
      return euclidean_distance(this.owner.coordinate, { x: this.owner.coordinate.x, y: 0 }) / this.owner.grid.grid_size;
    } else if (sensor == InputNeurons.BOUNDARY_WEST) {
      return euclidean_distance(this.owner.coordinate, { x: 0, y: this.owner.coordinate.y }) / this.owner.grid.grid_size;
    } else if (sensor == InputNeurons.BOUNDARY_EAST) {
      return (
        euclidean_distance(this.owner.coordinate, { x: this.owner.grid.grid_size, y: this.owner.coordinate.y }) /
        this.owner.grid.grid_size
      );
    } else if (sensor == InputNeurons.BOUNDARY_SOUTH) {
      return (
        euclidean_distance(this.owner.coordinate, { x: this.owner.coordinate.x, y: this.owner.grid.grid_size }) /
        this.owner.grid.grid_size
      );
    } else {
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
      return this.coordinate_sensor(sensor_id);
    } else if ([InputNeurons.LOOK_NORTH, InputNeurons.LOOK_EAST, InputNeurons.LOOK_SOUTH, InputNeurons.LOOK_WEST].includes(sensor_id)) {
      return this.observation_sensor(sensor_id);
    }
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
    const connection_array: ConnectionArray = [];

    if (this.owner.genome.data) {
      for (const gene of this.owner.genome.data) {
        // Renumber the source neuron or sensor using modulo operator.
        if (gene.source_type === Neurons.HIDDEN) {
          gene.source_id %= this.num_hidden_neurons;
        } else {
          gene.source_id %= this.num_input_neurons;
        }

        // Renumber the sink neuron or action using modulo operator.
        if (gene.sink_type === Neurons.HIDDEN) {
          gene.sink_id %= this.num_hidden_neurons;
        } else {
          gene.sink_id %= this.num_output_neurons;
        }

        // Add the renumbered gene to the connection list.
        connection_array.push(gene);
      }
    }

    return connection_array;
  }

  // Creates a map of neurons and their corresponding input and output counts.
  public create_hidden_neuron_map(connection_array: ConnectionArray): HiddenNeuronMap {
    // List of neurons and their number of inputs and outputs.
    const hidden_neuron_map: HiddenNeuronMap = new Map();

    for (const connection of connection_array) {
      // If the sink type is a hidden neuron.
      if (connection.sink_type === Neurons.HIDDEN) {
        const self_input = connection.source_type == Neurons.HIDDEN && connection.source_id == connection.sink_id;
        if (hidden_neuron_map.has(connection.sink_id)) {
          const node = hidden_neuron_map.get(connection.sink_id);
          if (node) {
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

      // If the source type is a hidden neuron.
      if (connection.source_type === Neurons.HIDDEN) {
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

    return hidden_neuron_map;
  }

  // Removes connections to a specific neuron from the connection list and updates the node map accordingly.
  public remove_connections_to_neuron(connection_array: ConnectionArray, hidden_neuron_map: HiddenNeuronMap, neuron_number: number): void {
    for (let i = 0; i < connection_array.length; ) {
      const neuron = connection_array[i];
      if (neuron.sink_type == Neurons.HIDDEN && neuron.sink_id === neuron_number) {
        // Remove the connection here. If the connection source is from another neuron, decrement the other neuron's number of outputs.
        if (neuron.source_type == Neurons.HIDDEN) {
          const node = hidden_neuron_map.get(neuron.source_id);
          if (node) node.outputs--;
        }
        // Remove element from connection list.
        connection_array.splice(i, 1);
      } else {
        i++;
      }
    }
  }

  // Removes useless connections from the connection list and updates the node map accordingly.
  public prune_connections(connections: ConnectionArray, hidden_neuron_map: HiddenNeuronMap): any {
    let connections_pruned = false;
    while (!connections_pruned) {
      connections_pruned = true;

      for (const node_number of hidden_neuron_map.keys()) {
        const node = hidden_neuron_map.get(node_number);
        // Look for neurons with zero outputs, or neurons that feed themselves.
        if (node && node.outputs == node.self_inputs) {
          connections_pruned = false;
          this.remove_connections_to_neuron(connections, hidden_neuron_map, node_number);
          hidden_neuron_map.delete(node_number);
        }
      }
    }
  }

  // Creates a renumbered connection list based on the node map.
  public create_connections(connection_array: ConnectionArray, hidden_neuron_map: HiddenNeuronMap): void {
    let new_number = 0;
    for (const node of hidden_neuron_map.values()) {
      node.identifer = new_number++;
    }

    for (const connection of connection_array) {
      if (connection.sink_type == Neurons.HIDDEN) {
        const new_connection = cloneDeep(connection);

        // Fix the destination neuron number.
        const node = hidden_neuron_map.get(new_connection.sink_id);
        if (node) new_connection.sink_id = node.identifer;

        // If the source is a neuron, fix its number too.
        if (new_connection.source_type === Neurons.HIDDEN) {
          const node = hidden_neuron_map.get(new_connection.source_id);
          if (node) new_connection.source_id = node.identifer;
        }

        this.connections.push(new_connection);
      }
    }

    // Last the connections from sensor/neuron to an action.
    for (const connection of connection_array) {
      if (connection.sink_type == Neurons.OUTPUT) {
        const new_conn = cloneDeep(connection);

        // If the source is a neuron, fix its number too.
        if (new_conn.source_type === Neurons.HIDDEN) {
          const node = hidden_neuron_map.get(new_conn.source_id);
          if (node) new_conn.source_id = node.identifer;
        }

        this.connections.push(new_conn);
      }

      // Push sensor neurons, internal neurons, and action neurons to each set.
      if (connection.source_type == Neurons.INPUT) this.inputs[connection.source_id] = undefined;
      else this.hidden[connection.source_id] = undefined;

      if (connection.sink_type == Neurons.OUTPUT) this.outputs[connection.sink_id] = undefined;
      else this.hidden[connection.sink_id] = undefined;
    }
  }

  // Creates a hidden neuron array based on the node map.
  public create_hidden_neuron_array(hidden_neuron_map: HiddenNeuronMap): Neuron[] {
    for (const node of hidden_neuron_map.values()) {
      const neuron = new Neuron();
      neuron.output = 0.5;
      neuron.driven = node.inputs !== 0;
      this.hidden_neurons.push(neuron);
    }
    return this.hidden_neurons;
  }
}
