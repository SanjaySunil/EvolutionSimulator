import Gene from "../models/Gene";
import { OutputNeuronSymbols } from "../constants/OutputNeurons";
import { InputNeuronSymbols } from "../constants/InputNeurons";
import { Neurons } from "../models/Neurons";
import { DOMElements } from "./DOMElements";

// This class is responsible for drawing the neural network diagram.
export default class NeuralNetDiagram {
  public node_radius = 20;
  public node_spacing = 10;
  public svg = DOMElements.neural_network_svg;
  public input_neurons: object = {};
  public output_neurons: object = {};
  public hidden_neurons: object = {};
  public last_input_neuron_coord: number = 0;
  public last_output_neuron_coord: number = 0;
  public last_hidden_neuron_coord: number = 0;

  // Private function to create an SVG element with specific attributes.
  private create_element_ns(element_type: string, attributes: Record<string, string>): SVGElement {
    // Create an SVG element with the specified element type.
    const element = document.createElementNS("http://www.w3.org/2000/svg", element_type);

    // Iterate through the key value pairs in the attributes object and set each attribute to the element.
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }

    // Return the element.
    return element;
  }

  // Private function to create an SVG text element with specific attributes.
  private create_text(x: number, y: number, text: string, fill: string): SVGElement {
    // Create an object with the attributes for the text element.
    const attributes = {
      x: x.toString(),
      y: y.toString(),
      "text-anchor": "middle",
      dy: ".3em",
      fill: fill,
    };

    // Create the text element and set its text content.
    const text_element = this.create_element_ns("text", attributes);
    text_element.textContent = text;

    // Return the text element.
    return text_element;
  }

  // Private method to connect two nodes with a line.
  private connect_nodes(source: number[], sink: number[], weight: number, is_positive: boolean): void {
    // Define attributes for the line connecting the source and sink nodes.
    const attributes = {
      // X-coordinate of the source node.
      x1: source[0].toString(),
      // Y-coordinate of the source node.
      y1: source[1].toString(),
      // X-coordinate of the sink node.
      x2: sink[0].toString(),
      // Y-coordinate of the sink node.
      y2: sink[1].toString(),
      // Colour of the line based on weight.
      stroke: is_positive ? "green" : "red",
      // Width of the line based on weight.
      "stroke-width": weight.toString(),
    };

    // Create a line SVG element with the defined attributes.
    const line = this.create_element_ns("line", attributes);

    // Append the line to the SVG canvas.
    this.svg.appendChild(line);

    // Define properties for the circles representing the source and sink nodes.
    const circle_radius = 3;

    // Fill colour of the circles.
    const circle_fill = is_positive ? "green" : "red";

    // Create circle SVG elements representing the source and sink nodes.
    const source_node = this.create_circle(source[0], source[1], circle_radius, circle_fill);
    const sink_node = this.create_circle(sink[0], sink[1], circle_radius, circle_fill);

    // Append the source and sink node to the SVG.
    this.svg.appendChild(source_node);
    this.svg.appendChild(sink_node);
  }

  // Define a private function to create an SVG circle element.
  private create_circle(x: number, y: number, r: number, fill: string): SVGElement {
    // Define attributes for the circle element.
    const attributes = {
      // X-coordinate of the centre of the circle.
      cx: x.toString(),
      // Y-coordinate of the centre of the circle.
      cy: y.toString(),
      // Radius of the circle.
      r: r.toString(),
      // Fill colour of the circle.
      fill: fill,
    };

    // Create a circle SVG element with the defined attributes.
    const circle = this.create_element_ns("circle", attributes);

    // Return the created circle element.
    return circle;
  }

  private create_node(node_type: string, node_id: number): void {
    const group = this.create_element_ns("g", {});
    let circle, text_elem;
    if (node_type == "SENSOR") {
      let prev;
      if (Object.keys(this.input_neurons).length == 0) {
        prev = this.node_spacing + this.node_radius;
      } else {
        prev = this.last_input_neuron_coord + (this.node_spacing + 2 * this.node_radius);
      }
      this.input_neurons[node_id] = [50, prev];
      this.last_input_neuron_coord = prev;
      circle = this.create_circle(50, prev, this.node_radius, "black");
      text_elem = this.create_text(50, prev, InputNeuronSymbols[node_id], "white");
    } else if (node_type == "ACTION") {
      let prev;
      if (Object.keys(this.output_neurons).length == 0) {
        prev = this.node_spacing + this.node_radius;
      } else {
        prev = this.last_output_neuron_coord + (this.node_spacing + 2 * this.node_radius);
      }
      this.output_neurons[node_id] = [350, prev];
      this.last_output_neuron_coord = prev;
      circle = this.create_circle(350, prev, this.node_radius, "black");
      text_elem = this.create_text(350, prev, OutputNeuronSymbols[node_id], "white");
    } else if (node_type == "NEURON") {
      let prev;
      if (Object.keys(this.hidden_neurons).length == 0) {
        prev = this.node_spacing + this.node_radius;
      } else {
        prev = this.last_hidden_neuron_coord + (this.node_spacing + 2 * this.node_radius);
      }
      this.hidden_neurons[node_id] = [200, prev];
      this.last_hidden_neuron_coord = prev;
      circle = this.create_circle(200, prev, this.node_radius, "black");
      text_elem = this.create_text(200, prev, node_id.toString(), "white");
    }

    group.appendChild(circle);
    group.appendChild(text_elem);

    this.svg.appendChild(group);
  }

  public draw(connections: Gene[]): void {
    const height = Math.max(this.last_input_neuron_coord, this.last_output_neuron_coord, this.last_hidden_neuron_coord + this.node_spacing);
    this.node_spacing + this.node_radius;
    this.svg.innerHTML = `<svg width='400' height='${height}' id='neural-network-svg'></svg>`;

    for (const connection of connections) {
      let source;
      let sink;

      if (connection.source_type == Neurons.INPUT) {
        if (this.input_neurons[connection.source_id]) {
          source = this.input_neurons[connection.source_id];
        } else {
          this.create_node(connection.source_type == 0 ? "NEURON" : "SENSOR", connection.source_id);
          source = this.input_neurons[connection.source_id];
        }
      } else if (connection.source_type == Neurons.HIDDEN) {
        if (this.hidden_neurons[connection.source_id]) {
          source = this.hidden_neurons[connection.source_id];
        } else {
          this.create_node(connection.source_type == 0 ? "NEURON" : "SENSOR", connection.source_id);
          source = this.hidden_neurons[connection.source_id];
        }
      }

      if (connection.sink_type == Neurons.OUTPUT) {
        if (this.output_neurons[connection.sink_id]) {
          sink = this.output_neurons[connection.sink_id];
        } else {
          this.create_node(connection.sink_type == 0 ? "NEURON" : "ACTION", connection.sink_id);
          sink = this.output_neurons[connection.sink_id];
        }
      } else if (connection.sink_type == Neurons.HIDDEN) {
        if (this.hidden_neurons[connection.sink_id]) {
          sink = this.hidden_neurons[connection.sink_id];
        } else {
          this.create_node(connection.sink_type == 0 ? "NEURON" : "ACTION", connection.sink_id);
          sink = this.hidden_neurons[connection.sink_id];
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
