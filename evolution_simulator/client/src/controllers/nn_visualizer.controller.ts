import Gene from "../models/Gene";
import { OutputNeuronSymbols } from "../constants/OutputNeurons";
import { InputNeuronSymbols } from "../constants/InputNeurons";
import { NeuronTypes } from "../models/Neurons";

/** Neural Network Visualiser Class */
export default class NeuralNetworkVisualizer {
  public svg: HTMLElement;
  public sensor_neurons: object;
  public action_neurons: object;
  public internal_neurons: object;
  public radius!: number;
  public spacing!: number;
  public total_input_height!: number;
  public inputs!: number;
  public total_internal_height!: number;
  public internal!: number;
  public total_output_height!: number;
  public max_nodes!: number;
  public max_height!: number;
  public group!: SVGGElement;
  public outputs!: number;
  public last_sensor_y: number;
  public last_action_y: number;
  public last_internal_y: number;

  constructor() {
    this.svg = document.getElementById("neural-network-svg")!;
    this.sensor_neurons = {};
    this.last_sensor_y = 0;
    this.action_neurons = {};
    this.last_action_y = 0;
    this.internal_neurons = {};
    this.last_internal_y = 0;
  }

  private create_element_ns(element_type: string, attributes: Record<string, string>): SVGElement {
    const element = document.createElementNS("http://www.w3.org/2000/svg", element_type);
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
    return element;
  }

  private create_text(x: number, y: number, text: string, fill: string): SVGTextElement {
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
  }

  private create_circle(x: number, y: number, r: number, fill: string): SVGCircleElement {
    const attributes = {
      cx: x.toString(),
      cy: y.toString(),
      r: r.toString(),
      fill: fill,
    };
    const circle = this.create_element_ns("circle", attributes);
    return circle;
  }

  private create_node(node_type: string, node_id: string): void {
    const group = this.create_element_ns("g", {});
    let circle, text_elem;
    if (node_type == "SENSOR") {
      const prev = Object.keys(this.sensor_neurons).length == 0 ? this.spacing + this.radius : this.last_sensor_y + (this.spacing + 2 * this.radius);
      this.sensor_neurons[node_id] = [50, prev];
      this.last_sensor_y = prev;
      circle = this.create_circle(50, prev, this.radius, "black");
      text_elem = this.create_text(50, prev, InputNeuronSymbols[node_id], "white");
    } else if (node_type == "ACTION") {
      const prev = Object.keys(this.action_neurons).length == 0 ? this.spacing + this.radius : this.last_action_y + (this.spacing + 2 * this.radius);
      this.action_neurons[node_id] = [350, prev];
      this.last_action_y = prev;
      circle = this.create_circle(350, prev, this.radius, "black");
      text_elem = this.create_text(350, prev, OutputNeuronSymbols[node_id], "white");
    } else if (node_type == "NEURON") {
      const prev = Object.keys(this.internal_neurons).length == 0 ? this.spacing + this.radius : this.last_internal_y + (this.spacing + 2 * this.radius);
      this.internal_neurons[node_id] = [200, prev];
      this.last_internal_y = prev;
      circle = this.create_circle(200, prev, this.radius, "black");
      text_elem = this.create_text(200, prev, node_id, "white");
    }

    group.appendChild(circle);
    group.appendChild(text_elem);

    this.svg.appendChild(group);
  }

  public draw(sensor_neurons: object, action_neurons: object, inc: number, connections: Gene[]): void {
    this.svg.innerHTML = "<svg width='400' height='400' id='neural-network-svg'></svg>";

    this.inputs = Object.keys(sensor_neurons).length;
    this.internal = inc;
    this.outputs = Object.keys(action_neurons).length;

    if (this.inputs < 0) throw Error("inputs neurons are empty");
    else if (this.internal < 0) throw Error("internal neurons are empty");
    else if (this.outputs < 0) throw Error("outputs neurons are empty");

    this.radius = 20;
    this.spacing = 10;

    this.total_input_height = 2 * this.radius * this.inputs + (this.inputs + 1) * this.spacing;
    this.total_internal_height = 2 * this.radius * this.internal + (this.internal + 1) * this.spacing;
    this.total_output_height = 2 * this.radius * this.outputs + (this.outputs + 1) * this.spacing;

    this.max_nodes = Math.max(this.inputs, this.internal, this.outputs);
    this.max_height = Math.max(this.total_input_height, this.total_internal_height, this.total_output_height);

    for (const conn of connections) {
      let source;
      let sink;
      if (conn.source_type == NeuronTypes.SENSOR) {
        source = this.sensor_neurons[conn.source_id] || (() => {
          this.create_node(conn.source_type == 0 ? "NEURON" : "SENSOR", conn.source_id);
          return this.sensor_neurons[conn.source_id];
        })();
      } else if (conn.source_type == NeuronTypes.NEURON) {
        source = this.internal_neurons[conn.source_id] || (() => {
          this.create_node(conn.source_type == 0 ? "NEURON" : "SENSOR", conn.source_id);
          return this.internal_neurons[conn.source_id];
        })();
      }

      if (conn.sink_type == NeuronTypes.ACTION) {
        sink = this.action_neurons[conn.sink_id] || (() => {
          this.create_node(conn.sink_type == 0 ? "NEURON" : "ACTION", conn.sink_id);
          return this.action_neurons[conn.sink_id];
        })();
      } else if (conn.sink_type == NeuronTypes.NEURON) {
        sink = this.internal_neurons[conn.sink_id] || (() => {
          this.create_node(conn.sink_type == 0 ? "NEURON" : "ACTION", conn.sink_id);
          return this.internal_neurons[conn.sink_id];
        })();
      }

      const max_thickness = 2.5;
      const min_thickness = 0.5;
      const thickness = Math.max(
        conn.weight >= 0 ? (conn.weight / 0x7fff) * max_thickness : (Math.abs(conn.weight) / 0x8000) * max_thickness,
        min_thickness
      );

      this.connect_nodes(source, sink, thickness, conn.weight >= 0);
    }

    const height = Math.max(this.last_action_y, this.last_internal_y, this.last_sensor_y) + 2 * this.spacing;
    this.svg.setAttribute("height", `${height}px`);
  }
}
