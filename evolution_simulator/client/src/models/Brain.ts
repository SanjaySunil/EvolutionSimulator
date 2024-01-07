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

type ConnectionList = Array<Gene>;
type NodeMap = Map<number, Node>;

export class Node {
  /** Unique identifier for the neuron. */
  public remapped_number;
  /** Number of output connections from the neuron. */
  public outputs;
  /** Number of input connections that are fed back into the neuron. */
  public self_inputs;
  /** Number of input connections that are from either sensors or other neurons. */
  public inputs_from_sensors_or_neurons;
}

export default class Brain {
  public owner: Organism;
  public sensor_neurons: object;
  public action_neurons: object;
  public internal_neurons: object;
  /** All neurons in the organism's neural network. */
  public neurons: Neuron[];
  /** All connections in the neural network. */
  public connections: Gene[];
  /** Number of sensors in the neural network. */
  public NUMBER_OF_SENSORS: number;
  /** Number of neurons in the neural network. */
  public NUMBER_OF_NEURONS: number;
  /** Number of possible actions in the neural network. */
  public NUMBER_OF_ACTIONS: number;

  /** Builds a new brain. */
  constructor(owner, NUMBER_OF_SENSORS: number, NUMBER_OF_NEURONS: number, NUMBER_OF_ACTIONS: number) {
    this.owner = owner;
    this.sensor_neurons = {};
    this.action_neurons = {};
    this.internal_neurons = {};
    this.neurons = [];
    this.connections = [];
    this.NUMBER_OF_SENSORS = NUMBER_OF_SENSORS;
    this.NUMBER_OF_NEURONS = NUMBER_OF_NEURONS;
    this.NUMBER_OF_ACTIONS = NUMBER_OF_ACTIONS;
    this.configure_brain();
  }

  /**
   * This function is called when an organism is spawned.
   * It converts the organism's genome into its neural network.
   */
  public configure_brain(): void {
    this.connections = [];
    this.neurons = [];

    /** List of synaptic connections, with a length of `Constants.NUMBER_OF_GENES`. */
    const connection_list: ConnectionList = this.create_connection_list();

    /** Map of neurons and their number of inputs and outputs. */
    const node_map: NodeMap = this.create_node_map(connection_list);

    /** Remove any unnecessary connections. */
    this.remove_useless_connections(connection_list, node_map);

    /**
     * Renumber the neurons starting from zero and build the proper connection and
     * neural node list.
     */
    this.create_renumbered_connection_list(connection_list, node_map);
    this.create_neural_node_list(node_map);
  }

  public sensor_look(direction: number): number {
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

    if (this.owner.environment.grid.is_valid_cell_at(current_vector)) {
      const cell = this.owner.environment.grid.get_cell_at(current_vector);
      return cell.state / AllCellStates.length;
    }

    // No observation found.
    return 0.0;
  }

  public sensor_coordinate(sensor: number): number {
    if (sensor == InputNeurons.X_COORDINATE && this.owner.environment.grid.grid_size) {
      return this.owner.coordinate.x / this.owner.environment.grid.grid_size;
    } else if (sensor == InputNeurons.Y_COORDINATE && this.owner.environment.grid.grid_size) {
      return this.owner.coordinate.y / this.owner.environment.grid.grid_size;
    } else if (sensor == InputNeurons.BOUNDARY_NORTH) {
      return euclidean_distance(this.owner.coordinate, { x: this.owner.coordinate.x, y: 0 }) / this.owner.environment.grid.grid_size;
    } else if (sensor == InputNeurons.BOUNDARY_WEST) {
      return euclidean_distance(this.owner.coordinate, { x: 0, y: this.owner.coordinate.y }) / this.owner.environment.grid.grid_size;
    } else if (sensor == InputNeurons.BOUNDARY_EAST) {
      return (
        euclidean_distance(this.owner.coordinate, { x: this.owner.environment.grid.grid_size, y: this.owner.coordinate.y }) /
        this.owner.environment.grid.grid_size
      );
    } else if (sensor == InputNeurons.BOUNDARY_SOUTH) {
      return (
        euclidean_distance(this.owner.coordinate, { x: this.owner.coordinate.x, y: this.owner.environment.grid.grid_size }) /
        this.owner.environment.grid.grid_size
      );
    } else {
      return 0.0;
    }
  }

  /**
   * Obtain value from a specific sensor. Sensors produce a value between 0.0
   * and 1.0.
   */
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
      return this.sensor_coordinate(sensor_id);
    } else if ([InputNeurons.LOOK_NORTH, InputNeurons.LOOK_EAST, InputNeurons.LOOK_SOUTH, InputNeurons.LOOK_WEST].includes(sensor_id)) {
      return this.sensor_look(sensor_id);
    }
    return 0.0;
  }

  /**
   * Performs a feed-forward computation in the neural network.
   * Returns an array of output levels for all action neurons.
   */
  public feed_forward(): number[] {
    // This array stores the output levels for all of the action neurons.
    const action_levels = new Array(this.NUMBER_OF_ACTIONS).fill(0.0);

    // The weighted inputs to each neuron are accumulated in neuron_accumulators.
    const neuron_accumulators = new Array(this.neurons.length).fill(0.0);

    let neuron_outputs_computed = false;
    for (const connection of this.connections) {
      if (connection.sink_type == Neurons.OUTPUT && !neuron_outputs_computed) {
        // Compute the output of neurons in the range (-1.0..1.0) using the hyperbolic tangent function.
        for (let neuron_index = 0; neuron_index < this.neurons.length; neuron_index++) {
          if (this.neurons[neuron_index].driven) {
            this.neurons[neuron_index].output = Math.tanh(neuron_accumulators[neuron_index]);
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
        input_val = this.neurons[connection.source_id].output;
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

  public create_connection_list(): any[] {
    /** List of synaptic connections, strictly `Constants.NUMBER_OF_GENES`. */
    const connection_list: ConnectionList = [];

    if (this.owner.genome.data) {
      for (const gene of this.owner.genome.data) {
        // Renumber the source neuron or sensor using modulo operator.
        if (gene.source_type === Neurons.HIDDEN) {
          gene.source_id %= this.NUMBER_OF_NEURONS;
        } else {
          gene.source_id %= this.NUMBER_OF_SENSORS;
        }

        // Renumber the sink neuron or action using modulo operator.
        if (gene.sink_type === Neurons.HIDDEN) {
          gene.sink_id %= this.NUMBER_OF_NEURONS;
        } else {
          gene.sink_id %= this.NUMBER_OF_ACTIONS;
        }

        // Add the renumbered gene to the connection list.
        connection_list.push(gene);
      }
    }

    return connection_list;
  }

  // Creates a map of neurons and their corresponding input and output counts.
  public create_node_map(connection_list: ConnectionList): NodeMap {
    /** List of neurons and their number of inputs and outputs. */
    const node_map: NodeMap = new Map();

    for (const gene of connection_list) {
      /** If the sink type is a neuron. */
      if (gene.sink_type === Neurons.HIDDEN) {
        const self_input = gene.source_type == Neurons.HIDDEN && gene.source_id == gene.sink_id;

        if (node_map.has(gene.sink_id)) {
          const node = node_map.get(gene.sink_id);
          if (node) {
            if (self_input) node.self_inputs++;
            else node.inputs_from_sensors_or_neurons++;
          } else {
            // If the neuron is not in the node map, add it with the appropriate input/output values.
            node_map.set(gene.sink_id, {
              remapped_number: 0,
              outputs: 0,
              self_inputs: self_input ? 1 : 0,
              inputs_from_sensors_or_neurons: self_input ? 0 : 1,
            });
          }
        }
      }

      /** If the source type is a neuron. */
      if (gene.source_type === Neurons.HIDDEN) {
        if (node_map.has(gene.source_id)) {
          const node = node_map.get(gene.source_id);
          if (node) node.outputs++;
        } else {
          // If the neuron is not in the node map, add it with the appropriate input/output values.
          node_map.set(gene.source_id, {
            remapped_number: 0,
            outputs: 1,
            self_inputs: 0,
            inputs_from_sensors_or_neurons: 0,
          });
        }
      }
    }

    return node_map;
  }

  // Removes connections to a specific neuron from the connection list and updates the node map accordingly.
  public remove_connections_to_neuron(connection_list: ConnectionList, node_map: NodeMap, neuron_number: number): void {
    for (let i = 0; i < connection_list.length; ) {
      const neuron = connection_list[i];
      if (neuron.sink_type == Neurons.HIDDEN && neuron.sink_id === neuron_number) {
        // Remove the connection here. If the connection source is from another neuron, decrement the other neuron's number of outputs.
        if (neuron.source_type == Neurons.HIDDEN) {
          const node = node_map.get(neuron.source_id);
          if (node) node.outputs--;
        }
        // Remove element from connection list.
        connection_list.splice(i, 1);
      } else {
        i++;
      }
    }
  }

  // Removes useless connections from the connection list and updates the node map accordingly.
  public remove_useless_connections(connection_list: ConnectionList, node_map: NodeMap): any {
    let all_checked = false;
    while (!all_checked) {
      all_checked = true;

      for (const node_number of node_map.keys()) {
        const node = node_map.get(node_number);
        // Look for neurons with zero outputs, or neurons that feed themselves.
        if (node && node.outputs == node.self_inputs) {
          all_checked = false;
          this.remove_connections_to_neuron(connection_list, node_map, node_number);
          node_map.delete(node_number);
        }
      }
    }
  }

  // Creates a renumbered connection list based on the node map.
  public create_renumbered_connection_list(connection_list: ConnectionList, node_map: NodeMap): void {
    let new_number = 0;
    for (const node of node_map.values()) {
      node.remapped_number = new_number++;
    }

    for (const connection of connection_list) {
      if (connection.sink_type == Neurons.HIDDEN) {
        const new_conn = cloneDeep(connection);

        // Fix the destination neuron number.
        const node = node_map.get(new_conn.sink_id);
        if (node) new_conn.sink_id = node.remapped_number;

        // If the source is a neuron, fix its number too.
        if (new_conn.source_type === Neurons.HIDDEN) {
          const node = node_map.get(new_conn.source_id);
          if (node) new_conn.source_id = node.remapped_number;
        }

        this.connections.push(new_conn);
      }
    }

    // Last the connections from sensor/neuron to an action.
    for (const connection of connection_list) {
      if (connection.sink_type == Neurons.OUTPUT) {
        const new_conn = cloneDeep(connection);

        // If the source is a neuron, fix its number too.
        if (new_conn.source_type === Neurons.HIDDEN) {
          const node = node_map.get(new_conn.source_id);
          if (node) new_conn.source_id = node.remapped_number;
        }

        this.connections.push(new_conn);
      }

      // Push sensor neurons, internal neurons, and action neurons to each set.
      if (connection.source_type == Neurons.INPUT) this.sensor_neurons[connection.source_id] = undefined;
      else this.internal_neurons[connection.source_id] = undefined;
      if (connection.sink_type == Neurons.OUTPUT) this.action_neurons[connection.sink_id] = undefined;
      else this.internal_neurons[connection.sink_id] = undefined;
    }
  }

  // Creates a neural node list based on the node map.
  public create_neural_node_list(node_map: NodeMap): Neuron[] {
    for (const node of node_map.values()) {
      const neuron = new Neuron();
      neuron.output = 0.5;
      neuron.driven = node.inputs_from_sensors_or_neurons !== 0;
      this.neurons.push(neuron);
    }
    return this.neurons;
  }
}
