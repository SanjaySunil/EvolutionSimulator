import { cloneDeep } from "lodash";
import Organism from ".";
import Directions from "../constants/Directions";
import { Coordinate, add_vector, euclidean_distance } from "../math/Coordinate";
import Gene from "./Gene";
import { Neuron, NeuronTypes, SensorNeurons } from "./Neurons";
import weight_as_float from "../utils/connection2float";
import { AllCellStates } from "../environment/Grid";

type ConnectionList = Array<Gene>;
type NodeMap = Map<number, Node>;

/**
 * This class represents a neuron in the neural network.
 */
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
  /** The organism that owns the brain. */
  public owner: Organism;
  /** Neurons used for sensing. */
  public sensor_neurons: object;
  /** Neurons used for taking actions. */
  public action_neurons: object;
  /** Internal neurons of the organism. */
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

    if (direction == SensorNeurons.LOOK_NORTH) vector = Directions.NORTH;
    else if (direction == SensorNeurons.LOOK_EAST) vector = Directions.EAST;
    else if (direction == SensorNeurons.LOOK_SOUTH) vector = Directions.SOUTH;
    else if (direction == SensorNeurons.LOOK_WEST) vector = Directions.WEST;
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
    if (sensor == SensorNeurons.X_COORDINATE && this.owner.environment.grid.grid_size) {
      return this.owner.coordinate.x / this.owner.environment.grid.grid_size;
    } else if (sensor == SensorNeurons.Y_COORDINATE && this.owner.environment.grid.grid_size) {
      return this.owner.coordinate.y / this.owner.environment.grid.grid_size;
    } else if (sensor == SensorNeurons.BOUNDARY_NORTH) {
      return euclidean_distance(this.owner.coordinate, { x: this.owner.coordinate.x, y: 0 }) / this.owner.environment.grid.grid_size;
    } else if (sensor == SensorNeurons.BOUNDARY_WEST) {
      return euclidean_distance(this.owner.coordinate, { x: 0, y: this.owner.coordinate.y }) / this.owner.environment.grid.grid_size;
    } else if (sensor == SensorNeurons.BOUNDARY_EAST) {
      return euclidean_distance(this.owner.coordinate, { x: this.owner.environment.grid.grid_size, y: this.owner.coordinate.y }) / this.owner.environment.grid.grid_size;
    } else if (sensor == SensorNeurons.BOUNDARY_SOUTH) {
      return euclidean_distance(this.owner.coordinate, { x: this.owner.coordinate.x, y: this.owner.environment.grid.grid_size }) / this.owner.environment.grid.grid_size;
    } else {
      return 0.0;
    }
  }

  /**
   * Obtain value from a specific sensor. Sensors produce a value between 0.0
   * and 1.0.
   */
  public get_sensor(sensor_id: number): number {
    if ([
      SensorNeurons.X_COORDINATE,
      SensorNeurons.Y_COORDINATE,
      SensorNeurons.BOUNDARY_NORTH,
      SensorNeurons.BOUNDARY_EAST,
      SensorNeurons.BOUNDARY_SOUTH,
      SensorNeurons.BOUNDARY_WEST
    ].includes(sensor_id)) {
      return this.sensor_coordinate(sensor_id);
    } else if ([
      SensorNeurons.LOOK_NORTH,
      SensorNeurons.LOOK_EAST,
      SensorNeurons.LOOK_SOUTH,
      SensorNeurons.LOOK_WEST,
    ].includes(sensor_id)
    ) {
      return this.sensor_look(sensor_id);
    } return 0.0;
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
      if (connection.sink_type == NeuronTypes.ACTION && !neuron_outputs_computed) {
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
      if (connection.source_type == NeuronTypes.SENSOR) {
        // Read the sensor data using the sensor identifier.
        input_val = this.get_sensor(connection.source_id);
      } else {
        input_val = this.neurons[connection.source_id].output;
      }

      // Weight the connection's value and add it to the accumulator of the corresponding neuron or action.
      if (connection.sink_type == NeuronTypes.ACTION) {
        action_levels[connection.sink_id] += input_val * weight_as_float(connection.weight);
      } else {
        neuron_accumulators[connection.sink_id] += input_val * weight_as_float(connection.weight);
      }
    }
    return action_levels;
  }

  /**
   * [done] Converts the organism's genome into a renumbered connection list.
   * Neurons are renumbered uniquely using the modulo operator.
   */
  public create_connection_list(): any[] {
    /** List of synaptic connections, strictly `Constants.NUMBER_OF_GENES`. */
    const connection_list: ConnectionList = [];

    /** Release empty connection list if number of neurons is zero. */
    // if (this.NUMBER_OF_NEURONS === 0) return connection_list;

    if (this.owner.genome.data) {
      for (const gene of this.owner.genome.data) {
        if (gene.source_type === NeuronTypes.NEURON) {
          gene.source_id %= this.NUMBER_OF_NEURONS;
        } else {
          gene.source_id %= this.NUMBER_OF_SENSORS;
        }

        if (gene.sink_type === NeuronTypes.NEURON) {
          gene.sink_id %= this.NUMBER_OF_NEURONS;
        } else {
          gene.sink_id %= this.NUMBER_OF_ACTIONS;
        }

        connection_list.push(gene);
      }
    }

    return connection_list;
  }
  /**
   * [done] Scan each of the connections and make a list of all the neuron
   * numbers mentioned in the connections. Also keep track of how many input and
   * outputs each neuron has.
   */
  public create_node_map(connection_list: ConnectionList): NodeMap {
    /** List of neurons and their number of inputs and outputs. */
    const node_map: NodeMap = new Map();

    for (const gene of connection_list) {
      /** If sink type is a neuron. */
      if (gene.sink_type === NeuronTypes.NEURON) {
        const self_input = gene.source_type == NeuronTypes.NEURON && gene.source_id == gene.sink_id;

        if (node_map.has(gene.sink_id)) {
          const node = node_map.get(gene.sink_id);
          if (node) {
            if (self_input) node.self_inputs++;
            else node.inputs_from_sensors_or_neurons++;
          } else {
            node_map.set(gene.sink_id, {
              remapped_number: 0,
              outputs: 0,
              self_inputs: self_input ? 1 : 0,
              inputs_from_sensors_or_neurons: self_input ? 0 : 1,
            });
          }
        }
      }

      /** If source type is a neuron. */
      if (gene.source_type === NeuronTypes.NEURON) {
        if (node_map.has(gene.source_id)) {
          const node = node_map.get(gene.source_id);
          if (node) node.outputs++;
        } else {
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

  /**
   * [done] Find and remove connections from sensors or other neurons to this
   * neuron.
   */
  public remove_connections_to_neuron(connection_list: ConnectionList, node_map: NodeMap, neuron_number: number): void {
    for (let i = 0; i < connection_list.length;) {
      const neuron = connection_list[i];
      if (neuron.sink_type == NeuronTypes.NEURON && neuron.sink_id === neuron_number) {
        /**
         * Remove the connection here. If the connection source is from another
         * neuron, decrement the other neuron's number of outputs.
         */
        if (neuron.source_type == NeuronTypes.NEURON) {
          const node = node_map.get(neuron.source_id);
          if (node) node.outputs--;
        }
        /** Remove element from connection list. */
        connection_list.splice(i, 1);
      } else {
        i++;
      }
    }
  }
  /**
   * [done] Find and remove any neurons that don't feed anything or only feed
   * themselves. This process is reiterative because after we remove a
   * connection to a useless neuron, it may result in a different neuron having
   * no outputs.
   */
  public remove_useless_connections(connection_list: ConnectionList, node_map: NodeMap): any {
    let all_checked = false;
    while (!all_checked) {
      all_checked = true;

      for (const node_number of node_map.keys()) {
        const node = node_map.get(node_number);
        /** Look for neurons with zero outputs, or neurons that feed themselves. */
        if (node && node.outputs == node.self_inputs) {
          all_checked = false;
          this.remove_connections_to_neuron(connection_list, node_map, node_number);
          node_map.delete(node_number);
        }
      }
    }
  }

  /**
   * [done] Creates the organism's connection list in two passes. First the
   * connections to neurons, then the connections to the actions. This ordering
   * optimizes the feed-forward function.
   */
  public create_renumbered_connection_list(connection_list: ConnectionList, node_map: NodeMap): void {
    let new_number = 0;
    for (const node of node_map.values()) {
      node.remapped_number = new_number++;
    }

    for (const connection of connection_list) {
      if (connection.sink_type == NeuronTypes.NEURON) {
        const new_conn = cloneDeep(connection);

        /** Fix the destination neuron number. */
        const node = node_map.get(new_conn.sink_id);
        if (node) new_conn.sink_id = node.remapped_number;

        /** If the source is a neuron, fix its number too. */
        if (new_conn.source_type === NeuronTypes.NEURON) {
          const node = node_map.get(new_conn.source_id);
          if (node) new_conn.source_id = node.remapped_number;
        }

        this.connections.push(new_conn);
      }
    }

    /** Last the connections from sensor/neuron to an action. */
    for (const connection of connection_list) {
      if (connection.sink_type == NeuronTypes.ACTION) {
        const new_conn = cloneDeep(connection);

        /** If the source is a neuron, fix its number too. */
        if (new_conn.source_type === NeuronTypes.NEURON) {
          const node = node_map.get(new_conn.source_id);
          if (node) new_conn.source_id = node.remapped_number;
        }

        this.connections.push(new_conn);
      }

      /** Push sensor neurons, internal neurons and action neurons to each set. */
      if (connection.source_type == NeuronTypes.SENSOR) this.sensor_neurons[connection.source_id] = undefined;
      else this.internal_neurons[connection.source_id] = undefined;
      if (connection.sink_type == NeuronTypes.ACTION) this.action_neurons[connection.sink_id] = undefined;
      else this.internal_neurons[connection.sink_id] = undefined;
    }
  }

  /** [done] Creates the organims's neural node list. */
  public create_neural_node_list(node_map: NodeMap): Neuron[] {
    // const neurons: Neuron[] = [];
    for (const node of node_map.values()) {
      const neuron = new Neuron();
      neuron.output = 0.5;
      neuron.driven = node.inputs_from_sensors_or_neurons !== 0;
      this.neurons.push(neuron);
    }
    return this.neurons;
  }
}
