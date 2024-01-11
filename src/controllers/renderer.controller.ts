import ThemeConfig from "../config/theme.config";
import { CellStates, GridCell } from "../environment/Grid";
import Queue from "../structures/Queue";
import { to_angle } from "../utils/geometry";

// Class to handle rendering of the simulation.
export default class Renderer {
  public canvas;
  public ctx;
  public pixel_size;
  public to_fill: Queue;
  public to_clear: Queue;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, pixel_size: number) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.pixel_size = pixel_size;
    this.to_fill = new Queue();
    this.to_clear = new Queue();
  }

  // Renders a specific cell in the grid.
  private draw(cell: GridCell, x: number, y: number, width: number, height: number, colour: string): void {
    // Set the fill style to the specified colour.
    this.ctx.fillStyle = colour;

    // Fill a rectangle on the canvas representing the cell.
    this.ctx.fillRect(cell.coordinate.x * 15 + x, cell.coordinate.y * 15 + y, width, height);
  }

  // Renders an organism with rotation degrees specified.
  public render_organism_cell(cell, rotationDegrees): void {
    const cell_x = cell.coordinate.x * this.pixel_size;
    const cell_y = cell.coordinate.y * this.pixel_size;

    this.ctx.save();

    // Translate to the center of the cell.
    this.ctx.translate(cell_x + this.pixel_size / 2, cell_y + this.pixel_size / 2);
    // Rotate the entire cell by rotationDegrees.
    this.ctx.rotate((rotationDegrees * Math.PI) / 180);
    // Draw a rectangle centered at (0, 0) to represent the organism.

    this.ctx.fillRect(-this.pixel_size / 2, -this.pixel_size / 2, this.pixel_size, this.pixel_size); // Draw a rectangle centered at (0, 0)
    // Colours used for drawing shapes.

    const colour = cell.owner.genome.colour;
    const transparent = "#282a36";
    const black = "#000";
    // Drawing various shapes to represent the organism.

    this.draw_sub_shape(0, 0, 15, 15, black);
    this.draw_sub_shape(0, 0, 3, 3, transparent);
    this.draw_sub_shape(6, 0, 3, 2, transparent);
    this.draw_sub_shape(12, 0, 3, 3, transparent);
    this.draw_sub_shape(2, 2, 2, 2, transparent);
    this.draw_sub_shape(11, 2, 2, 2, transparent);
    this.draw_sub_shape(4, 1, 1, 1, colour);
    this.draw_sub_shape(10, 1, 1, 1, colour);
    this.draw_sub_shape(5, 2, 1, 1, colour);
    this.draw_sub_shape(9, 2, 1, 1, colour);
    this.draw_sub_shape(5, 3, 5, 1, colour);
    this.draw_sub_shape(4, 4, 7, 1, colour);
    this.draw_sub_shape(3, 5, 9, 1, colour);
    this.draw_sub_shape(2, 6, 3, 5, colour);
    this.draw_sub_shape(10, 6, 3, 5, colour);
    this.draw_sub_shape(6, 6, 3, 5, colour);
    this.draw_sub_shape(2, 9, 11, 2, colour);
    this.draw_sub_shape(4, 11, 2, 2, colour);
    this.draw_sub_shape(9, 11, 2, 2, colour);
    this.draw_sub_shape(7, 12, 1, 1, transparent);
    this.draw_sub_shape(3, 13, 1, 1, colour);
    this.draw_sub_shape(11, 13, 1, 1, colour);
    this.draw_sub_shape(6, 13, 3, 1, transparent);
    this.draw_sub_shape(4, 14, 7, 1, transparent);
    this.draw_sub_shape(0, 7, 1, 4, transparent);
    this.draw_sub_shape(0, 11, 2, 4, transparent);
    this.draw_sub_shape(14, 7, 1, 4, transparent);
    this.draw_sub_shape(13, 11, 2, 4, transparent);
    this.draw_sub_shape(1, 4, 1, 3, colour);
    this.draw_sub_shape(13, 4, 1, 3, colour);
    this.ctx.restore();
  }

  // Function to draw a sub-shape within a grid cell
  public draw_sub_shape(x, y, width, height, colour): void {
    // Set the fill colour for the sub-shape
    this.ctx.fillStyle = colour;
    // Draw the sub-shape starting from the top-left corner
    this.ctx.fillRect(x - this.pixel_size / 2, y - this.pixel_size / 2, width, height);
  }

  // Renders a food cell.
  public render_food_cell(cell: GridCell): void {
    const transparent = "#282a36";
    const food = "#44475a";

    // Render the food cell with specific shapes and colours at various positions within the cell
    this.draw(cell, 0, 0, 15, 15, transparent);
    this.draw(cell, 6, 3, 3, 9, food);
    this.draw(cell, 4, 4, 2, 7, food);
    this.draw(cell, 9, 4, 2, 7, food);
    this.draw(cell, 3, 6, 1, 3, food);
    this.draw(cell, 11, 6, 1, 3, food);
  }

  // Renders a radioactive cell.
  public render_radioactive_cell(cell: GridCell): void {
    // Render the radioactive cell with a specific colour defined in the ThemeConfig
    this.draw(cell, 0, 0, 15, 15, ThemeConfig.RADIOACTIVE);
  }

  // Define a method named 'render_wall_cell' that takes a 'cell' parameter of type 'GridCell'
  public render_wall_cell(cell: GridCell): void {
    // Call the 'draw' method with the provided parameters to render a wall cell
    this.draw(cell, 0, 0, 15, 15, ThemeConfig.WALL);
  }

  // Define a method named 'render_empty_cell' that takes a 'cell' parameter of type 'GridCell'
  public render_empty_cell(cell: GridCell): void {
    // Call the 'draw' method with the provided parameters to render an empty cell
    this.draw(cell, 0, 0, 15, 15, ThemeConfig.EMPTY);
  }

  // Define a method named 'fill_cell' that takes a 'cell' parameter of type 'GridCell'
  public fill_cell(cell: GridCell): void {
    // Check if the cell is highlighted and, if so, call the 'highlight_cell' method and return
    if (cell.is_highlighted) return this.highlight_cell(cell);

    // Check if the cell is selected and, if so, call the 'select_cell' method and return
    if (cell.is_selected) return this.select_cell(cell);

    // Check if the cell contains an organism
    if (cell.state == CellStates.ORGANISM) {
      // Check if the organism's owner is alive before rendering the organism cell
      if (cell.owner && cell.owner.alive) {
        // Calculate the rotation angle based on the owner's direction
        let rotation = to_angle(cell.owner.direction);

        // Adjust rotation to handle specific angles (needs improvement)
        if (rotation == 315 || rotation == 0 || rotation == 45) rotation = 0;
        else if (rotation == 90) rotation = 90;
        else if (rotation == 135 || rotation == 180 || rotation == 225) rotation = 180;
        else if (rotation == 270) rotation == 270;

        // Render the organism cell with the adjusted rotation
        this.render_organism_cell(cell, rotation);
      }
    } else if (cell.state == CellStates.EMPTY) {
      // Render an empty cell if the cell state is 'EMPTY'
      this.render_empty_cell(cell);
    } else if (cell.state == CellStates.FOOD) {
      // Render a food cell if the cell state is 'FOOD'
      this.render_food_cell(cell);
    } else if (cell.state == CellStates.RADIOACTIVE) {
      // Render a radioactive cell if the cell state is 'RADIOACTIVE'
      this.render_radioactive_cell(cell);
    } else if (cell.state == CellStates.WALL) {
      // Render a wall cell if the cell state is 'WALL'
      this.render_wall_cell(cell);
    }
  }

  // Define a method named 'highlight_cell' that takes a 'cell' parameter of type 'GridCell'
  public highlight_cell(cell: GridCell): void {
    // Set the fill style to a yellow colour
    this.ctx.fillStyle = "#f1fa8c";
    // Fill the cell with the specified colour at the cell's coordinates using the pixel size
    this.ctx.fillRect(cell.coordinate.x * this.pixel_size, cell.coordinate.y * this.pixel_size, this.pixel_size, this.pixel_size);
  }

  // Define a method named 'select_cell' that takes a 'cell' parameter of type 'GridCell'
  public select_cell(cell: GridCell): void {
    // Set the fill style to white
    this.ctx.fillStyle = "white";
    // Fill the cell with the specified colour at the cell's coordinates using the pixel size
    this.ctx.fillRect(cell.coordinate.x * this.pixel_size, cell.coordinate.y * this.pixel_size, this.pixel_size, this.pixel_size);
  }

  // Define a method named 'clear_cell' that takes a 'cell' parameter of type 'GridCell'
  public clear_cell(cell: GridCell): void {
    // Set the fill style to a dark colour
    this.ctx.fillStyle = "#282a36";
    // Fill the cell with the specified colour at the cell's coordinates using the pixel size
    this.ctx.fillRect(cell.coordinate.x * this.pixel_size, cell.coordinate.y * this.pixel_size, this.pixel_size, this.pixel_size);
  }

  // Define a method named 'clear_canvas'
  public clear_canvas(): void {
    // Set the fill style to a dark colour
    this.ctx.fillStyle = "#282a36";
    // Fill the entire canvas with the specified colour
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
