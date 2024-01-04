import Gene from "../organism/Gene";
import { ActionNeuronSymbols, NeuronTypes, SensorNeuronSymbols } from "../organism/Neurons";

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

  create_text(x, y, text, fill): SVGTextElement {
    const textElem = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textElem.setAttribute("x", x);
    textElem.setAttribute("y", y);
    textElem.setAttribute("text-anchor", "middle");
    textElem.setAttribute("dy", ".3em");
    textElem.setAttribute("fill", fill);
    textElem.textContent = text;
    return textElem;
  }

  connect_nodes(source, sink, weight, isPositive): void {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", source[0]);
    line.setAttribute("y1", source[1]);
    line.setAttribute("x2", sink[0]);
    line.setAttribute("y2", sink[1]);
    line.setAttribute("stroke", isPositive ? "green" : "red");
    line.setAttribute("stroke-width", weight);

    this.svg.appendChild(line);
  }

  create_circle(x, y, r, fill): SVGCircleElement {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x.toString());
    circle.setAttribute("cy", y.toString());
    circle.setAttribute("r", r.toString());
    circle.setAttribute("fill", fill);
    return circle;
  }

  create_node(node_type, node_id): void {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    let circle, textElem;
    if (node_type == "SENSOR") {
      if (Object.keys(this.sensor_neurons).length == 0) {
        let prev = this.spacing + this.radius;
        if (this.max_nodes != this.inputs) prev += (this.max_height - this.total_input_height) / 2;
        this.sensor_neurons[node_id] = [50, prev];
        this.last_sensor_y = prev;
        circle = this.create_circle(50, prev, this.radius, "black");
        textElem = this.create_text(50, prev, SensorNeuronSymbols[node_id], "white");
      } else {
        const prev = this.last_sensor_y + (this.spacing + 2 * this.radius);
        this.sensor_neurons[node_id] = [50, prev];
        this.last_sensor_y = prev;
        circle = this.create_circle(50, prev, this.radius, "black");
        textElem = this.create_text(50, prev, SensorNeuronSymbols[node_id], "white");
      }
    } else if (node_type == "ACTION") {
      if (Object.keys(this.action_neurons).length == 0) {
        let prev = this.spacing + this.radius;
        if (this.max_nodes != this.outputs) prev += (this.max_height - this.total_output_height) / 2;
        this.action_neurons[node_id] = [350, prev];
        this.last_action_y = prev;
        circle = this.create_circle(350, prev, this.radius, "black");
        textElem = this.create_text(350, prev, ActionNeuronSymbols[node_id], "white");
      } else {
        const prev = this.last_action_y + (this.spacing + 2 * this.radius);
        this.action_neurons[node_id] = [350, prev];
        this.last_action_y = prev;
        circle = this.create_circle(350, prev, this.radius, "black");
        textElem = this.create_text(350, prev, ActionNeuronSymbols[node_id], "white");
      }
    } else if (node_type == "NEURON") {
      if (Object.keys(this.internal_neurons).length == 0) {
        let prev = this.spacing + this.radius;
        if (this.max_nodes != this.internal) prev += (this.max_height - this.total_internal_height) / 2;
        console.log(this.max_height, this.total_internal_height);
        this.internal_neurons[node_id] = [200, prev];
        this.last_internal_y = prev;
        circle = this.create_circle(200, prev, this.radius, "black");
        textElem = this.create_text(200, prev, node_id, "white");
      } else {
        const prev = this.last_internal_y + (this.spacing + 2 * this.radius);
        this.internal_neurons[node_id] = [200, prev];
        this.last_internal_y = prev;
        circle = this.create_circle(200, prev, this.radius, "black");
        textElem = this.create_text(200, prev, node_id, "white");
      }
    }

    group.appendChild(circle);
    group.appendChild(textElem);

    this.svg.appendChild(group);
  }

  draw(sensor_neurons, internal_neurons, action_neurons, inc, connections: Gene[]): void {
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

    console.log(this.inputs, this.internal, this.outputs);
    console.log(this.total_input_height, this.total_internal_height, this.total_output_height);

    for (const conn of connections) {
      let source;
      let sink;
      if (conn.source_type == NeuronTypes.SENSOR) {
        if (this.sensor_neurons[conn.source_id]) {
          source = this.sensor_neurons[conn.source_id];
        } else {
          this.create_node(conn.source_type == 0 ? "NEURON" : "SENSOR", conn.source_id);
          source = this.sensor_neurons[conn.source_id];
        }
      } else if (conn.source_type == NeuronTypes.NEURON) {
        if (this.internal_neurons[conn.source_id]) {
          source = this.internal_neurons[conn.source_id];
        } else {
          this.create_node(conn.source_type == 0 ? "NEURON" : "SENSOR", conn.source_id);
          source = this.internal_neurons[conn.source_id];
        }
      }

      if (conn.sink_type == NeuronTypes.ACTION) {
        if (this.action_neurons[conn.sink_id]) {
          sink = this.action_neurons[conn.sink_id];
        } else {
          this.create_node(conn.sink_type == 0 ? "NEURON" : "ACTION", conn.sink_id);
          sink = this.action_neurons[conn.sink_id];
        }
      } else if (conn.sink_type == NeuronTypes.NEURON) {
        if (this.internal_neurons[conn.sink_id]) {
          sink = this.internal_neurons[conn.sink_id];
        } else {
          this.create_node(conn.sink_type == 0 ? "NEURON" : "ACTION", conn.sink_id);
          sink = this.internal_neurons[conn.sink_id];
        }
      }

      let thickness;
      const max_thickness = 2.5;
      const min_thickness = 0.5;

      if (conn.weight >= 0) thickness = (conn.weight / 0x7fff) * max_thickness;
      else thickness = (Math.abs(conn.weight) / 0x8000) * max_thickness;

      if (thickness < min_thickness) thickness = min_thickness;

      this.connect_nodes(source, sink, thickness, conn.weight >= 0);
    }

    const height = Math.max(this.last_action_y, this.last_internal_y, this.last_sensor_y) + 2 * this.spacing;
    this.svg.setAttribute("height", `${height}px`);
  }
}
