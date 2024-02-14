import { DOMElements } from "../components/DOMElements";
import { FixedDefaults } from "../config/simulation.config";
import { InputNeuronSymbols } from "../constants/InputNeurons";
import { OutputNeuronSymbols } from "../constants/OutputNeurons";
import Gene from "../models/Gene";
import { Neurons } from "../models/Neurons";

/**
 * Creates an SVG element with specific attributes.
 * @param element_type - The type of SVG element to be created.
 * @param attributes - The attributes of the SVG element.
 * @returns - The created SVG element.
 */
function create_element_ns(element_type: string, attributes: Record<string, string>): SVGElement {
  // Create an SVG element with the specified element type.
  const element = document.createElementNS("http://www.w3.org/2000/svg", element_type);

  // Iterate through the key value pairs in the attributes object and set each attribute to the element.
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }

  // Return the element.
  return element;
}

/**
 * Creates an SVG text element with specific attributes.
 * @param x - x-coordinate of the text element.
 * @param y - y-coordinate of the text element.
 * @param text - Text content of the text element.
 * @param fill - Fill colour of the text element.
 * @returns - The created SVG text element.
 */
function create_text(x: number, y: number, text: string, fill: string): SVGElement {
  // Create an object with the attributes for the text element.
  const attributes = {
    x: x.toString(),
    y: y.toString(),
    "text-anchor": "middle",
    dy: ".3em",
    fill: fill,
  };

  // Create the text element and set its text content.
  const text_element = create_element_ns("text", attributes);
  text_element.textContent = text;

  // Return the text element.
  return text_element;
}

/**
 * Connects two nodes with a line.
 * @param source - The source node.
 * @param sink - The sink node.
 * @param weight - The weight of the connection.
 * @param is_positive - Whether the connection is positive or negative.
 */
function connect_nodes(source: number[], sink: number[], weight: number, is_positive: boolean): void {
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
  const line = create_element_ns("line", attributes);

  // Append the line to the SVG canvas.
  DOMElements.neural_network_svg.appendChild(line);

  // Define properties for the circles representing the source and sink nodes.
  const circle_radius = 3;

  // Fill colour of the circles.
  const circle_fill = is_positive ? "green" : "red";

  // Create circle SVG elements representing the source and sink nodes.
  const source_node = create_circle(source[0], source[1], circle_radius, circle_fill);
  const sink_node = create_circle(sink[0], sink[1], circle_radius, circle_fill);

  // Append the source and sink node to the SVG.
  DOMElements.neural_network_svg.appendChild(source_node);
  DOMElements.neural_network_svg.appendChild(sink_node);
}

/**
 * Creates an SVG circle element with specific attributes.
 * @param x - x-coordinate of the centre of the circle.
 * @param y - y-coordinate of the centre of the circle.
 * @param r - Radius of the circle.
 * @param fill - Fill colour of the circle.
 * @param stroke - Whether the circle has a stroke.
 * @returns - The created SVG circle element.
 */
function create_circle(x: number, y: number, r: number, fill: string, stroke = false): SVGElement {
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

  // If the circle has a stroke, set the stroke colour and width.
  if (stroke) {
    attributes["stroke"] = "black";
    attributes["stroke-width"] = "5px";
  }

  // Create a circle SVG element with the defined attributes.
  const circle = create_element_ns("circle", attributes);

  // Return the created circle element.
  return circle;
}

/**
 * Finds the y-coordinate of the previous node.
 * @param object - The object containing the nodes of the current type.
 * @param previous_node - The previous y-coordinate.
 * @returns - The y-coordinate of the previous node.
 */
function find_previous_node_y_coord(object, previous_node): number {
  // If the object is empty, there is no previous node, so return the node spacing plus the node radius as the initial y-coordinate.
  if (Object.keys(object).length == 0) {
    previous_node = FixedDefaults.node_spacing + FixedDefaults.FixedDefaults.FixedDefaults.node_radius;
  } else {
    // Otherwise, find the previous y-coordinate by adding the node spacing and the node radius to the previous y-coordinate.
    previous_node = previous_node + (FixedDefaults.node_spacing + 2 * FixedDefaults.FixedDefaults.FixedDefaults.node_radius);
  }
  return previous_node;
}

/**
 * Creates a node for the neural network diagram.
 * @param node_type - The type of node.
 * @param node_id - The ID of the node.
 * @param input_neurons - The input neurons.
 * @param hidden_neurons - The hidden neurons.
 * @param output_neurons - The output neurons.
 * @param last_input_neuron_coord - The last y-coordinate of the input neuron.
 * @param last_hidden_neuron_coord - The last y-coordinate of the hidden neuron.
 * @param last_output_neuron_coord - The last y-coordinate of the output neuron.
 * @returns - The updated input, hidden, and output neurons and their last coordinates.
 */
function create_node(
  node_type: string,
  node_id: number,
  input_neurons,
  hidden_neurons,
  output_neurons,
  last_input_neuron_coord,
  last_hidden_neuron_coord,
  last_output_neuron_coord
): [[], [], [], number, number, number] {
  // Create a new SVG group element.
  const group = create_element_ns("g", {});

  // Define x coord positions for different types of nodes.
  const input = 50;
  const hidden = 200;
  const output = 350;

  // Initialise variables for previous y-coordinate, x-coordinate, and node text.
  let previous_node_y_coord;
  let node_x_coord;
  let node_text;

  // Determine the y-coordinate and update neuron positions based on node type.
  if (node_type == "INPUT") {
    // Find the previous y-coordinate for the input neuron.
    previous_node_y_coord = find_previous_node_y_coord(input_neurons, last_input_neuron_coord);
    input_neurons[node_id] = [input, previous_node_y_coord];
    last_input_neuron_coord = previous_node_y_coord;
  } else if (node_type == "OUTPUT") {
    // Find the previous y-coordinate for the output neuron.
    previous_node_y_coord = find_previous_node_y_coord(output_neurons, last_output_neuron_coord);
    output_neurons[node_id] = [output, previous_node_y_coord];
    last_output_neuron_coord = previous_node_y_coord;
  } else if (node_type == "HIDDEN") {
    // Find the previous y-coordinate for the hidden neuron.
    previous_node_y_coord = find_previous_node_y_coord(hidden_neurons, last_hidden_neuron_coord);
    hidden_neurons[node_id] = [hidden, previous_node_y_coord];
    last_hidden_neuron_coord = previous_node_y_coord;
  }

  // Determine x-coordinate and node text based on the node type.
  if (node_type == "INPUT") {
    // Set the x-coordinate and node text for the input neuron.
    node_x_coord = input;
    node_text = InputNeuronSymbols[node_id];
  } else if (node_type == "OUTPUT") {
    // Set the x-coordinate and node text for the output neuron.
    node_x_coord = output;
    node_text = OutputNeuronSymbols[node_id];
  } else if (node_type == "HIDDEN") {
    // Set the x-coordinate and node text for the hidden neuron.
    node_x_coord = hidden;
    node_text = node_id.toString();
  }

  // Create circle and text elements for the node.
  const circle = create_circle(node_x_coord, previous_node_y_coord, FixedDefaults.FixedDefaults.FixedDefaults.node_radius, "white", true);
  const text_element = create_text(node_x_coord, previous_node_y_coord, node_text, "black");

  // Append the circle and text elements to the group element.
  group.appendChild(circle);
  group.appendChild(text_element);

  // Append the group element to the SVG.
  DOMElements.neural_network_svg.appendChild(group);

  // Return the updated input, hidden, and output neurons and their last coordinates.
  return [input_neurons, hidden_neurons, output_neurons, last_input_neuron_coord, last_hidden_neuron_coord, last_output_neuron_coord];
}

/**
 * Draws the neural network diagram based on the given connections.
 * @param connections - The connections between nodes in the neural network.
 */
export function draw_neural_net_brain(connections: Gene[]): void {
  // Lists to store the input, hidden, and output neurons.
  let input_neurons = [];
  let hidden_neurons = [];
  let output_neurons = [];
  // Variables to store the last y coordinates of the input, hidden, and output neurons.
  let last_input_neuron_coord = 0;
  let last_hidden_neuron_coord = 0;
  let last_output_neuron_coord = 0;
  // Variable to store the updated coordinates of the input, hidden, and output neurons plus their last coordinates.
  let updated_coordinates;
  // Set the initial height of the SVG.
  let height = 400;

  // Clear the SVG element and set its initial height.
  DOMElements.neural_network_svg.innerHTML = `<svg width='400px' height='${height}px' id='neural-network-svg'></svg>`;
  DOMElements.neural_network_svg.style.height = height.toString();

  // Iterate through each connection to draw lines between connected nodes.
  for (const connection of connections) {
    let source_node;
    let sink_node;

    // Determine the source node based on its type.
    if (connection.source_type == Neurons.INPUT || connection.source_type == Neurons.HIDDEN) {
      if (connection.source_type == Neurons.INPUT && input_neurons[connection.source_id]) {
        source_node = input_neurons[connection.source_id];
      } else if (connection.source_type == Neurons.HIDDEN && hidden_neurons[connection.source_id]) {
        source_node = hidden_neurons[connection.source_id];
      } else {
        // If the source node does not exist, create it.
        updated_coordinates = create_node(
          connection.source_type == 0 ? "HIDDEN" : "INPUT",
          connection.source_id,
          input_neurons,
          hidden_neurons,
          output_neurons,
          last_input_neuron_coord,
          last_hidden_neuron_coord,
          last_output_neuron_coord
        );

        if (connection.source_type == Neurons.INPUT) {
          source_node = input_neurons[connection.source_id];
        } else if (connection.source_type == Neurons.HIDDEN) {
          source_node = hidden_neurons[connection.source_id];
        }
      }
    }

    // Update the input, hidden, and output neurons and their last coordinates.
    input_neurons = updated_coordinates[0];
    hidden_neurons = updated_coordinates[1];
    output_neurons = updated_coordinates[2];
    last_input_neuron_coord = updated_coordinates[3];
    last_hidden_neuron_coord = updated_coordinates[4];
    last_output_neuron_coord = updated_coordinates[5];

    // Determine the sink node based on its type.
    if (connection.sink_type == Neurons.OUTPUT || connection.sink_type == Neurons.HIDDEN) {
      if (connection.sink_type == Neurons.OUTPUT && output_neurons[connection.sink_id]) {
        sink_node = output_neurons[connection.sink_id];
      } else if (connection.sink_type == Neurons.HIDDEN && hidden_neurons[connection.sink_id]) {
        sink_node = hidden_neurons[connection.sink_id];
      } else {
        // If the sink node does not exist, create it.
        updated_coordinates = create_node(
          connection.sink_type == 0 ? "HIDDEN" : "OUTPUT",
          connection.sink_id,
          input_neurons,
          hidden_neurons,
          output_neurons,
          last_input_neuron_coord,
          last_hidden_neuron_coord,
          last_output_neuron_coord
        );

        if (connection.sink_type == Neurons.OUTPUT) {
          sink_node = output_neurons[connection.sink_id];
        } else if (connection.sink_type == Neurons.HIDDEN) {
          sink_node = hidden_neurons[connection.sink_id];
        }
      }
    }

    // Update the input, hidden, and output neurons and their last coordinates.
    input_neurons = updated_coordinates[0];
    hidden_neurons = updated_coordinates[1];
    output_neurons = updated_coordinates[2];
    last_input_neuron_coord = updated_coordinates[3];
    last_hidden_neuron_coord = updated_coordinates[4];
    last_output_neuron_coord = updated_coordinates[5];

    // Define constants for line thickness calculation based on the weight of the connection.
    const max_thickness = 2.5;
    const min_thickness = 0.5;

    // The thickness is calculated by calculating the ratio of the weight to the maximum/minimum possible weight and multiplying it by the maximum/minimum thickness.
    const thickness = Math.max(
      connection.weight >= 0 ? (connection.weight / 0x7fff) * max_thickness : (Math.abs(connection.weight) / 0x8000) * max_thickness,
      min_thickness
    );

    // Draw connections between nodes based on their coordinates and connection weight.
    connect_nodes(source_node, sink_node, thickness, connection.weight >= 0);
  }

  // Obtain the number of input, hidden, and output neurons.
  const input_neurons_size = Object.keys(input_neurons).length;
  const output_neurons_size = Object.keys(output_neurons).length;
  const hidden_neurons_size = Object.keys(hidden_neurons).length;

  // Determine the height of the SVG based on the number of input, hidden, and output neurons.
  // The maximum of the three is used to determine the height of the SVG.
  if (Math.max(input_neurons_size, output_neurons_size, hidden_neurons_size) == input_neurons_size) {
    height = last_input_neuron_coord;
  } else if (Math.max(input_neurons_size, output_neurons_size, hidden_neurons_size) == output_neurons_size) {
    height = last_output_neuron_coord;
  } else if (Math.max(input_neurons_size, output_neurons_size, hidden_neurons_size) == hidden_neurons_size) {
    height = last_hidden_neuron_coord;
  }

  // Set the height of the SVG.
  DOMElements.neural_network_svg.style.height = (
    height +
    FixedDefaults.FixedDefaults.FixedDefaults.node_radius +
    FixedDefaults.node_spacing
  ).toString();
}
