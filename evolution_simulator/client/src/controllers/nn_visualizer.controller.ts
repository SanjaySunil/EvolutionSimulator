import Gene from "../models/Gene";
import { OutputNeuronSymbols } from "../constants/OutputNeurons";
import { InputNeuronSymbols } from "../constants/InputNeurons";
import { NeuronTypes } from "../models/Neurons";

/** Neural Network Visualiser Class */
export default class NeuralNetDiagram {
  public radius = 20;
  public spacing = 10;
  public svg = document.getElementById("neural-network-svg")!;
  public input_neurons: object;
  public output_neurons: object;
  public internal_neurons: object;
  public last_input_neuron_coord: number;
  public last_output_neuron_coord: number;
  public last_internal_neuron_coord: number;

  constructor() {
    // Used to store the coordinates of each neuron.
    this.input_neurons = {};
    this.output_neurons = {};
    this.internal_neurons = {};

    // Used to fetch the last y coordinate of each type of neuron.
    this.last_input_neuron_coord = 0;
    this.last_output_neuron_coord = 0;
    this.last_internal_neuron_coord = 0;
  }

  private create_element_ns(element_type: string, attributes: Record<string, string>): SVGElement {
    const element = document.createElementNS("http://www.w3.org/2000/svg", element_type);
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
    return element;
  }

  private create_text(x: number, y: number, text: string, fill: string): SVGElement {
    const attributes = {
      x: x.toString(),
      y: y.toString(),
      "text-anchor": "middle",
      dy: ".3em",
      fill: fill,
    };
    const text_elem = this.create_element_ns("text", attributes);
    text_elem.textContent = text;
    return text_elem;
  }

  private connect_nodes(source: number[], sink: number[], weight: number, is_positive: boolean): void {
    const attributes = {
      x1: source[0].toString(),
      y1: source[1].toString(),
      x2: sink[0].toString(),
      y2: sink[1].toString(),
      stroke: is_positive ? "green" : "red",
      "stroke-width": weight.toString(),
    };
    const line = this.create_element_ns("line", attributes);
    this.svg.appendChild(line);

    const circle_radius = 3;
    const circle_fill = is_positive ? "green" : "red";
    const source_circle = this.create_circle(source[0], source[1], circle_radius, circle_fill);
    const sink_circle = this.create_circle(sink[0], sink[1], circle_radius, circle_fill);
    this.svg.appendChild(source_circle);
    this.svg.appendChild(sink_circle);
  }

  private create_circle(x: number, y: number, r: number, fill: string): SVGElement {
    const attributes = {
      cx: x.toString(),
      cy: y.toString(),
      r: r.toString(),
      fill: fill,
    };
    const circle = this.create_element_ns("circle", attributes);
    return circle;
  }

  private create_node(node_type: string, node_id: number): void {
    const group = this.create_element_ns("g", {});
    let circle, text_elem;
    if (node_type == "SENSOR") {
      const prev =
        Object.keys(this.input_neurons).length == 0
          ? this.spacing + this.radius
          : this.last_input_neuron_coord + (this.spacing + 2 * this.radius);
      this.input_neurons[node_id] = [50, prev];
      this.last_input_neuron_coord = prev;
      circle = this.create_circle(50, prev, this.radius, "black");
      text_elem = this.create_text(50, prev, InputNeuronSymbols[node_id], "white");
    } else if (node_type == "ACTION") {
      const prev =
        Object.keys(this.output_neurons).length == 0
          ? this.spacing + this.radius
          : this.last_output_neuron_coord + (this.spacing + 2 * this.radius);
      this.output_neurons[node_id] = [350, prev];
      this.last_output_neuron_coord = prev;
      circle = this.create_circle(350, prev, this.radius, "black");
      text_elem = this.create_text(350, prev, OutputNeuronSymbols[node_id], "white");
    } else if (node_type == "NEURON") {
      const prev =
        Object.keys(this.internal_neurons).length == 0
          ? this.spacing + this.radius
          : this.last_internal_neuron_coord + (this.spacing + 2 * this.radius);
      this.internal_neurons[node_id] = [200, prev];
      this.last_internal_neuron_coord = prev;
      circle = this.create_circle(200, prev, this.radius, "black");
      text_elem = this.create_text(200, prev, node_id.toString(), "white");
    }

    group.appendChild(circle);
    group.appendChild(text_elem);

    this.svg.appendChild(group);
  }

  public draw(connections: Gene[]): void {
    this.svg.innerHTML = "<svg width='400' height='400' id='neural-network-svg'></svg>";

    for (const connection of connections) {
      let source;
      let sink;

      if (connection.source_type == NeuronTypes.SENSOR) {
        if (this.input_neurons[connection.source_id]) {
          source = this.input_neurons[connection.source_id];
        } else {
          this.create_node(connection.source_type == 0 ? "NEURON" : "SENSOR", connection.source_id);
          source = this.input_neurons[connection.source_id];
        }
      } else if (connection.source_type == NeuronTypes.NEURON) {
        if (this.internal_neurons[connection.source_id]) {
          source = this.internal_neurons[connection.source_id];
        } else {
          this.create_node(connection.source_type == 0 ? "NEURON" : "SENSOR", connection.source_id);
          source = this.internal_neurons[connection.source_id];
        }
      }

      if (connection.sink_type == NeuronTypes.ACTION) {
        if (this.output_neurons[connection.sink_id]) {
          sink = this.output_neurons[connection.sink_id];
        } else {
          this.create_node(connection.sink_type == 0 ? "NEURON" : "ACTION", connection.sink_id);
          sink = this.output_neurons[connection.sink_id];
        }
      } else if (connection.sink_type == NeuronTypes.NEURON) {
        if (this.internal_neurons[connection.sink_id]) {
          sink = this.internal_neurons[connection.sink_id];
        } else {
          this.create_node(connection.sink_type == 0 ? "NEURON" : "ACTION", connection.sink_id);
          sink = this.internal_neurons[connection.sink_id];
        }
      }

      const max_thickness = 2.5;
      const min_thickness = 0.5;
      const thickness = Math.max(
        connection.weight >= 0 ? (connection.weight / 0x7fff) * max_thickness : (Math.abs(connection.weight) / 0x8000) * max_thickness,
        min_thickness
      );

      this.connect_nodes(source, sink, thickness, connection.weight >= 0);
    }
  }
}