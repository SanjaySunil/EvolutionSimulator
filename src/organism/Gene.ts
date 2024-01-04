import get_random_number from "../utils/get_random_number";

// Each gene specifies one synaptic connection in a neural network.
export default class Gene {
  // Source of the connection is either an input sensory neuron/internal neuron.
  public source_type: number;
  // Identifer of which input sensory neuron/internal neuron.
  public source_id: number;
  // Sink of the connection is either an output action neuron/internal neuron
  public sink_type: number;
  // Identifier of which output action neuron/internal neuron.
  public sink_id: number;
  // The weight of the connection.
  public weight: number;

  // Builds a new gene.
  constructor(NUMBER_OF_NEURONS: number) {
    this.source_type = get_random_number(0, 1);
    this.source_id = get_random_number(0, 0x7fff) % NUMBER_OF_NEURONS;
    this.sink_type = get_random_number(0, 1);
    this.sink_id = get_random_number(0, 0x7fff) % NUMBER_OF_NEURONS;
    this.weight = Math.round(Math.random() * 0xffff) - 0x8000;
  }

  // Mutates the gene at index.
  public mutate_gene(): void {
    const bitMask = 1 << get_random_number(0, 15);
    const chance = Math.random();

    if (chance < 0.2) {
      this.source_type ^= 1;
    } else if (chance < 0.4) {
      this.sink_type ^= 1;
    } else if (chance < 0.6) {
      this.source_id ^= bitMask;
    } else if (chance < 0.8) {
      this.sink_id ^= bitMask;
    } else {
      this.weight ^= bitMask;
    }
  }
}
