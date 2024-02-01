import ThemeConfig from "../config/theme.config";
import { CellStates, GridCell } from "../environment/Grid";
import Queue from "../structures/Queue";
import { to_angle } from "../utils/geometry";

/** This class is used to create a renderer that can be used to render the simulation. */
export default class Renderer {
  public canvas;
  public ctx;
  public pixel_size;
  public to_clear: Queue;
  public to_fill: Queue;
  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, pixel_size: number) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.pixel_size = pixel_size;
    this.to_fill = new Queue();
    this.to_clear = new Queue();
  }

  /**
   * Draws a cell on the canvas.
   * @param cell - The cell to render.
   * @param colour - The colour to render the cell with.
   */
  private draw_cell(cell: GridCell, colour): void {
    // Set the fill style to a yellow colour
    this.ctx.fillStyle = colour;
    // Fill the cell with the specified colour at the cell's coordinates using the pixel size
    this.ctx.fillRect(cell.coordinate.x * this.pixel_size, cell.coordinate.y * this.pixel_size, this.pixel_size, this.pixel_size);
  }

  /**
   * Draws a rectangle on the canvas.
   * @param cell - The cell to render.
   * @param x - The x-coordinate to start drawing from.
   * @param y - The y-coordinate to start drawing from.
   * @param width - The width the component to draw.
   * @param height - The height of the component to draw.
   * @param colour - The colour of the component to draw.
   */
  private draw_rect(cell: GridCell, x: number, y: number, width: number, height: number, colour: string): void {
    // Set the fill style to the specified colour.
    this.ctx.fillStyle = colour;

    // Fill a rectangle on the canvas representing the cell.
    this.ctx.fillRect(cell.coordinate.x * 15 + x, cell.coordinate.y * 15 + y, width, height);
  }

  /**
   * Draws a sub-shape within a grid cell.
   * @param x - The x-coordinate of the sub-shape.
   * @param y - The y-coordinate of the sub-shape.
   * @param width - The width of the sub-shape.
   * @param height - The height of the sub-shape.
   * @param colour - The colour of the sub-shape.
   */
  private draw_sub_shape(x, y, width, height, colour): void {
    // Set the fill colour for the sub-shape
    this.ctx.fillStyle = colour;
    // Draw the sub-shape starting from the top-left corner
    this.ctx.fillRect(x - this.pixel_size / 2, y - this.pixel_size / 2, width, height);
  }

  /**
   * Renders a food cell.
   * @param cell - The cell to render.
   */
  private render_food_cell(cell: GridCell): void {
    const transparent = "#282a36";
    const food = "#44475a";

    // Render the food cell with specific shapes and colours at various positions within the cell
    this.draw_rect(cell, 0, 0, 15, 15, transparent);
    this.draw_rect(cell, 6, 3, 3, 9, food);
    this.draw_rect(cell, 4, 4, 2, 7, food);
    this.draw_rect(cell, 9, 4, 2, 7, food);
    this.draw_rect(cell, 3, 6, 1, 3, food);
    this.draw_rect(cell, 11, 6, 1, 3, food);
  }

  /**
   * Renders an organism with rotation degrees specified.
   * @param cell - The cell to render.
   * @param degrees_to_rotate - The rotation degrees of the organism.
   */
  private render_organism_cell(cell, degrees_to_rotate): void {
    const cell_x = cell.coordinate.x * this.pixel_size;
    const cell_y = cell.coordinate.y * this.pixel_size;

    this.ctx.save();

    // Translate to the center of the cell.
    this.ctx.translate(cell_x + this.pixel_size / 2, cell_y + this.pixel_size / 2);
    // Rotate the entire cell by rotationDegrees.
    this.ctx.rotate((degrees_to_rotate * Math.PI) / 180);
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

  /** Clears the canvas. */
  public clear_canvas(): void {
    // Set the fill style to a dark colour
    this.ctx.fillStyle = "#282a36";
    // Fill the entire canvas with the specified colour
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Clears a cell on the canvas.
   * @param cell - The cell to clear.
   */
  public clear_cell(cell: GridCell): void {
    this.draw_cell(cell, ThemeConfig.EMPTY);
  }

  /**
   * Renders a cell.
   * @param cell - The cell to render.
   */
  public render_cell(cell: GridCell): void {
    // Check if the cell is highlighted and, if so, call the 'highlight_cell' method and return
    if (cell.is_highlighted) this.draw_cell(cell, ThemeConfig.HIGHLIGHTED);
    // Check if the cell is selected and, if so, call the 'select_cell' method and return
    else if (cell.is_selected) this.draw_cell(cell, ThemeConfig.SELECTED);
    // Check if the cell contains an organism
    else if (cell.state == CellStates.ORGANISM) {
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
      this.draw_cell(cell, ThemeConfig.EMPTY);
    } else if (cell.state == CellStates.FOOD) {
      // Render a food cell if the cell state is 'FOOD'
      this.render_food_cell(cell);
    } else if (cell.state == CellStates.RADIOACTIVE) {
      // Render a radioactive cell if the cell state is 'RADIOACTIVE'
      this.draw_cell(cell, ThemeConfig.RADIOACTIVE);
    } else if (cell.state == CellStates.WALL) {
      // Render a wall cell if the cell state is 'WALL'
      this.draw_cell(cell, ThemeConfig.WALL);
    }
  }
}
