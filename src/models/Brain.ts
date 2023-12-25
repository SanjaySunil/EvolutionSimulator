import { cloneDeep } from "lodash";
import { Constants, SimulationConfig } from "../config/simulation.config";
import { AllCellStates } from "../constants/CellStates";
import { Directions } from "../constants/Directions";
import { SensorNeurons } from "../constants/SensorNeurons";
import Vector from "../math/vector.math";
import { Gene, Genome } from "./Genome";
import { Neuron, NeuronTypes } from "./Neuron";
import Organism from "./Organism";
type ConnectionList = Array<Gene>;
type NodeMap = Map<number, Node>;

/**
 * This structure is used while converting the connection list to the neural
 * network.
 */
export class Node {
  /** Unique identifier for the neuron. */
  public remapped_number;
  /** Number of output connections from the neuron. */
  public outputs;
  /** Number of output connections that are fed back into the neuron. */
  public self_inputs;
  /** Number of input connections that are from either sensor/other neurons. */
  public inputs_from_sensors_or_neurons;
}

/**
 * The brain is specified by a set of genes where each gene specifies one
 * connection in the neural network.
 */
export class Brain {
  /** The organism that the brain belongs to. */
  public owner: Organism;
  /** All neurons of the organism. */
  public neurons: Neuron[];
  /** All connections. */
  public connections: Gene[];
  /** Genome */
  public genome: Genome;
  /** Used sensor neurons */
  public sensor_neurons: object;
  public action_neurons: object;
  public internal_neurons: object;
  /** Builds a new brain. */
  constructor(owner: Organism, genome: Genome) {
    this.owner = owner;
    // this.genome = cloneDeep(genome);
    this.genome = genome;
    /** Neural network */
    this.connections = [];
    this.neurons = [];
    this.sensor_neurons = {};
    this.action_neurons = {};
    this.internal_neurons = {};
    this.configure_brain();
  }
  /**
   * When an organism is spawned, this function converts the organism's genome
   * into the organism's neural network.
   */
  public configure_brain(): void {
    this.connections = [];
    this.neurons = [];

    /** List of synaptic connections, strictly `Constants.NUMBER_OF_GENES`. */
    const connection_list: ConnectionList = this.create_connection_list();

    /** List of neurons and their number of inputs and outputs. */
    const node_map: NodeMap = this.create_node_map(connection_list);

    /** Remove any useless connections. */
    this.remove_useless_connections(connection_list, node_map);

    /**
     * Renumber the neurons starting at zero and build the proper connection and
     * neural node list.
     */
    this.create_renumbered_connection_list(connection_list, node_map);
    this.create_neural_node_list(node_map);
  }
  /** Organism look through with observation distance. */
  public sensor_look(direction: number): any {
    /**
     * Start of object performance test. Test to see whether new object
     * instantiation is affecting performance of simulation.
     */

    /** End of object performance test. */

    let current_vector = new Vector().copy(this.owner.coord);
    let vector: Vector;

    const angle = this.owner.direction.to_angle();

    if (direction == SensorNeurons.LOOK_NORTH) vector = Directions.NORTH;
    else if (direction == SensorNeurons.LOOK_EAST) vector = Directions.EAST;
    else if (direction == SensorNeurons.LOOK_SOUTH) vector = Directions.SOUTH;
    else if (direction == SensorNeurons.LOOK_WEST) vector = Directions.WEST;
    else if (direction == SensorNeurons.LOOK_FORWARD) vector = Directions.forward(angle);
    else if (direction == SensorNeurons.LOOK_BACKWARDS) vector = Directions.backward(angle);
    else if (direction == SensorNeurons.LOOK_LEFT) vector = Directions.left(angle);
    else if (direction == SensorNeurons.LOOK_RIGHT) vector = Directions.right(angle);
    else {
      throw Error("Direction not correct.");
    }

    current_vector = current_vector.add(vector);

    if (this.owner.world.grid.is_valid_cell_at(current_vector)) {
      const cell = this.owner.world.grid.get_cell_at(current_vector);
      return cell.state / AllCellStates.length;
    }

    // No observation found.
    return 0.0;
  }

  public sensor_coord(coord: number): number {
    if (coord == SensorNeurons.X_COORD) {
      return this.owner.coord.x / SimulationConfig.GRID_SIZE;
    } else if (coord == SensorNeurons.Y_COORD) {
      return this.owner.coord.y / SimulationConfig.GRID_SIZE;
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
        SensorNeurons.LOOK_NORTH,
        SensorNeurons.LOOK_EAST,
        SensorNeurons.LOOK_SOUTH,
        SensorNeurons.LOOK_WEST,
        SensorNeurons.LOOK_FORWARD,
        SensorNeurons.LOOK_BACKWARDS,
        SensorNeurons.LOOK_LEFT,
        SensorNeurons.LOOK_RIGHT,
      ].includes(sensor_id)
    ) {
      return this.sensor_look(sensor_id);
    } else if ([SensorNeurons.X_COORD, SensorNeurons.Y_COORD].includes(sensor_id)) {
      return this.sensor_coord(sensor_id);
    } else if ([SensorNeurons.ENERGY].includes(sensor_id)) {
      return this.owner.energy / this.owner.max_energy;
    } else return 0.0;
  }
  /**
   * Feed forward from the sensory input neurons through internal neurons and to
   * output action neurons.
   */
  public feed_forward(): number[] {
    /** This container is used to return values for all of the action outputs. */
    const action_levels = new Array(Constants.NUMBER_OF_ACTIONS).fill(0.0);

    /** Weighted inputs to each neuron are summed in neuron_accumulators. */
    const neuron_accumulators = new Array(this.neurons.length).fill(0.0);

    let neuron_outputs_computed = false;
    for (const connection of this.connections) {
      if (connection.sink_type == NeuronTypes.ACTION && !neuron_outputs_computed) {
        /**
         * Make neuron outputs to their proper range (-1.0..1.0) through the use
         * of the hyperbolic tangent function.
         */
        for (let neuron_index = 0; neuron_index < this.neurons.length; neuron_index++) {
          if (this.neurons[neuron_index].driven) {
            this.neurons[neuron_index].output = Math.tanh(neuron_accumulators[neuron_index]);
          }
        }
        neuron_outputs_computed = true;
      }

      /**
       * Obtain the connection's input value from a sensor neuron or other
       * neuron. The values are summed for now, later passed through a transfer
       * function (hyperbolic tangent function).
       */
      let input_val = 0.0;
      if (connection.source_type == NeuronTypes.SENSOR) {
        /** Read the sensor data using sensor identifier. */
        input_val = this.get_sensor(connection.source_id);
      } else {
        input_val = this.neurons[connection.source_id].output;
      }

      /**
       * Weight the connection's value and add to neuron accumulator or action
       * accumulator.
       */
      if (connection.sink_type == NeuronTypes.ACTION) {
        action_levels[connection.sink_id] += input_val * connection.weight_as_float();
      } else {
        neuron_accumulators[connection.sink_id] += input_val * connection.weight_as_float();
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
    // if (Constants.NUMBER_OF_NEURONS === 0) return connection_list;
    for (const gene of this.genome.data) {
      if (gene.source_type === NeuronTypes.NEURON) {
        gene.source_id %= Constants.NUMBER_OF_NEURONS;
      } else {
        gene.source_id %= Constants.NUMBER_OF_SENSORS;
      }

      if (gene.sink_type === NeuronTypes.NEURON) {
        gene.sink_id %= Constants.NUMBER_OF_NEURONS;
      } else {
        gene.sink_id %= Constants.NUMBER_OF_ACTIONS;
      }

      connection_list.push(gene);
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
    for (let i = 0; i < connection_list.length; ) {
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

    // console.log("after", this.sensor_neurons, this.action_neurons, this.internal_neurons);
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
