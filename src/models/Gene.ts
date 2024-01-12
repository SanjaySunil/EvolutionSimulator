import get_random_number from "../utils/get_random_number";

/** This class is used to create a gene that can be used to store information */
export default class Gene {
  // Source of the connection is either an input neuron/hidden neuron.
  public source_type: number;
  // Identifer of which input neuron/hidden neuron.
  public source_id: number;
  // Sink of the connection is either an output neuron/hidden neuron
  public sink_type: number;
  // Identifier of which output neuron/hidden neuron.
  public sink_id: number;
  // The weight of the connection.
  public weight: number;

  // Builds a new gene.
  constructor(NUMBER_OF_HIDDEN_NEURONS: number) {
    this.source_type = get_random_number(0, 1);
    this.source_id = get_random_number(0, 0x7fff) % NUMBER_OF_HIDDEN_NEURONS;
    this.sink_type = get_random_number(0, 1);
    this.sink_id = get_random_number(0, 0x7fff) % NUMBER_OF_HIDDEN_NEURONS;
    this.weight = Math.round(Math.random() * 0xffff) - 0x8000;
  }
}
