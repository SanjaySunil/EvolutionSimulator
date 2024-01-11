import Gene from "../models/Gene";
import { OutputNeuronSymbols } from "../constants/OutputNeurons";
import { InputNeuronSymbols } from "../constants/InputNeurons";
import { Neurons } from "../models/Neurons";
import { DOMElements } from "../components/DOMElements";

// This class is responsible for drawing the neural network diagram.
export default class NeuralNetDiagram {
  public node_radius = 20;
  public node_spacing = 10;
  public svg = DOMElements.neural_network_svg;
  public input_neurons: object = {};
  public output_neurons: object = {};
  public hidden_neurons: object = {};
  public last_input_neuron_coord = 0;
  public last_output_neuron_coord = 0;
  public last_hidden_neuron_coord = 0;

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
  private create_circle(x: number, y: number, r: number, fill: string, stroke = false): SVGElement {
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

    if (stroke) {
      (attributes["stroke"] = "black"), (attributes["stroke-width"] = "5px");
    }

    // Create a circle SVG element with the defined attributes.
    const circle = this.create_element_ns("circle", attributes);

    // Return the created circle element.
    return circle;
  }

  // Private function to find the y-coordinate of the previous node.
  private find_previous_node_y_coord(object, previous): number {
    // If the object is empty, there is no previous node, so return the node spacing plus the node radius as the initial y-coordinate.
    if (Object.keys(object).length == 0) {
      previous = this.node_spacing + this.node_radius;
    } else {
      // Otherwise, find the previous y-coordinate by adding the node spacing and the node radius to the previous y-coordinate.
      previous = previous + (this.node_spacing + 2 * this.node_radius);
    }
    return previous;
  }

  // Private method to create a node for the neural network diagram.
  private create_node(node_type: string, node_id: number): void {
    // Create a new SVG group element.
    const group = this.create_element_ns("g", {});

    // Define x coord positions for different types of nodes.
    const input = 50;
    const hidden = 200;
    const output = 350;

    // Initialise variables for previous y-coordinate, x-coordinate, and node text.
    let previous_y_coord;
    let x_coord;
    let node_text;

    // Determine the y-coordinate and update neuron positions based on node type.
    if (node_type == "INPUT") {
      // Find the previous y-coordinate for the input neuron.
      previous_y_coord = this.find_previous_node_y_coord(this.input_neurons, this.last_input_neuron_coord);
      this.input_neurons[node_id] = [input, previous_y_coord];
      this.last_input_neuron_coord = previous_y_coord;
    } else if (node_type == "OUTPUT") {
      // Find the previous y-coordinate for the output neuron.
      previous_y_coord = this.find_previous_node_y_coord(this.output_neurons, this.last_output_neuron_coord);
      this.output_neurons[node_id] = [output, previous_y_coord];
      this.last_output_neuron_coord = previous_y_coord;
    } else if (node_type == "HIDDEN") {
      // Find the previous y-coordinate for the hidden neuron.
      previous_y_coord = this.find_previous_node_y_coord(this.hidden_neurons, this.last_hidden_neuron_coord);
      this.hidden_neurons[node_id] = [hidden, previous_y_coord];
      this.last_hidden_neuron_coord = previous_y_coord;
    }

    // Determine x-coordinate and node text based on the node type.
    if (node_type == "INPUT") {
      x_coord = input;
      node_text = InputNeuronSymbols[node_id];
    } else if (node_type == "OUTPUT") {
      x_coord = output;
      node_text = OutputNeuronSymbols[node_id];
    } else if (node_type == "HIDDEN") {
      x_coord = hidden;
      node_text = node_id.toString();
    }

    // Create circle and text elements for the node.
    const circle = this.create_circle(x_coord, previous_y_coord, this.node_radius, "white", true);
    const text_element = this.create_text(x_coord, previous_y_coord, node_text, "black");

    // Append the circle and text elements to the group element.
    group.appendChild(circle);
    group.appendChild(text_element);

    // Append the group element to the SVG.
    this.svg.appendChild(group);
  }

  // Public method to draw the neural network diagram.
  public draw(connections: Gene[]): void {
    // Calculate the height of the SVG canvas based on the maximum y-coordinates of different types of nodes.
    // const height = Math.max(this.last_input_neuron_coord, this.last_output_neuron_coord, this.last_hidden_neuron_coord);
    // Reset the HTML content of the SVG element with a specific width and calculated height.
    let height = 400;
    this.svg.innerHTML = `<svg width='400px' height='${height}px' id='neural-network-svg'></svg>`;
    this.svg.style.height = height.toString(); // Iterate through each connection to draw lines between connected nodes.

    for (const connection of connections) {
      let source;
      let sink;

      // Determine the source node based on its type.
      if (connection.source_type == Neurons.INPUT) {
        if (this.input_neurons[connection.source_id]) {
          source = this.input_neurons[connection.source_id];
        } else {
          this.create_node(connection.source_type == 0 ? "HIDDEN" : "INPUT", connection.source_id);
          source = this.input_neurons[connection.source_id];
        }
      } else if (connection.source_type == Neurons.HIDDEN) {
        if (this.hidden_neurons[connection.source_id]) {
          source = this.hidden_neurons[connection.source_id];
        } else {
          this.create_node(connection.source_type == 0 ? "HIDDEN" : "INPUT", connection.source_id);
          source = this.hidden_neurons[connection.source_id];
        }
      }

      // Determine the sink node based on its type.
      if (connection.sink_type == Neurons.OUTPUT) {
        if (this.output_neurons[connection.sink_id]) {
          sink = this.output_neurons[connection.sink_id];
        } else {
          this.create_node(connection.sink_type == 0 ? "HIDDEN" : "OUTPUT", connection.sink_id);
          sink = this.output_neurons[connection.sink_id];
        }
      } else if (connection.sink_type == Neurons.HIDDEN) {
        if (this.hidden_neurons[connection.sink_id]) {
          sink = this.hidden_neurons[connection.sink_id];
        } else {
          this.create_node(connection.sink_type == 0 ? "HIDDEN" : "OUTPUT", connection.sink_id);
          sink = this.hidden_neurons[connection.sink_id];
        }
      }

      // Define constants for line thickness calculation based on the weight of the connection.
      const max_thickness = 2.5;
      const min_thickness = 0.5;

      // The thickness is calculated by calculating the ratio of the weight to the maximum/minimum possible weight and multiplying it by the maximum/minimum thickness.
      const thickness = Math.max(
        connection.weight >= 0 ? (connection.weight / 0x7fff) * max_thickness : (Math.abs(connection.weight) / 0x8000) * max_thickness,
        min_thickness
      );

      // Draw connections between nodes based on their coordinates and connection weight.
      this.connect_nodes(source, sink, thickness, connection.weight >= 0);
    }

    const input_neurons_size = Object.keys(this.input_neurons).length;
    const output_neurons_size = Object.keys(this.output_neurons).length;
    const hidden_neurons_size = Object.keys(this.hidden_neurons).length;

    if (Math.max(input_neurons_size, output_neurons_size, hidden_neurons_size) == input_neurons_size) {
      height = this.last_input_neuron_coord;
    } else if (Math.max(input_neurons_size, output_neurons_size, hidden_neurons_size) == output_neurons_size) {
      height = this.last_output_neuron_coord;
    } else if (Math.max(input_neurons_size, output_neurons_size, hidden_neurons_size) == hidden_neurons_size) {
      height = this.last_hidden_neuron_coord;
    }

    this.svg.style.height = (height + this.node_radius + this.node_spacing).toString();
  }
}
