import ThemeConfig from "../config/theme.config";
import { CellStates, GridCell } from "../environment/Grid";
import { to_angle } from "../math/Coordinate";

export default class RendererController {
  public canvas;
  public ctx;
  public pixel_size;
  public to_fill: Set<GridCell>;
  public to_clear: Set<GridCell>;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, pixel_size: number) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.pixel_size = pixel_size;
    this.to_fill = new Set();
    this.to_clear = new Set();
  }

  private draw(cell: GridCell, x: number, y: number, width: number, height: number, colour: string): void {
    this.ctx.fillStyle = colour;
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
    this.ctx.fillRect(-this.pixel_size / 2, -this.pixel_size / 2, this.pixel_size, this.pixel_size); // Draw a rectangle centered at (0, 0)
    const colour = cell.owner.genome.colour;
    const transparent = "#282a36";
    const black = "#000";
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
  public draw_sub_shape(x, y, width, height, color): void {
    this.ctx.fillStyle = color; // Set the fill color for the sub-shape
    this.ctx.fillRect(x - this.pixel_size / 2, y - this.pixel_size / 2, width, height); // Draw the sub-shape starting from the top-left corner
  }

  // public render_food_cell(cell: GridCell): void {
  //   // Temporary fix: when this if statement is removed, some empty cells on the map have 0 energy.
  //   // This may be caused due to set_cell_state being set to food in another place other than the
  //   // organism kill method.
  //   if (cell.energy <= 0) return this.render_empty_cell(cell);
  //   else {
  //     const transparent = "#282a36";
  //     const food = "#44475a";
  //     this.draw(cell, 0, 0, 15, 15, transparent);
  //     this.draw(cell, 6, 3, 3, 9, food);
  //     this.draw(cell, 4, 4, 2, 7, food);
  //     this.draw(cell, 9, 4, 2, 7, food);
  //     this.draw(cell, 3, 6, 1, 3, food);
  //     this.draw(cell, 11, 6, 1, 3, food);
  //   }
  // }

  public render_radioactive_cell(cell: GridCell): void {
    this.draw(cell, 0, 0, 15, 15, ThemeConfig.RADIOACTIVE);
  }

  public render_wall_cell(cell: GridCell): void {
    this.draw(cell, 0, 0, 15, 15, ThemeConfig.WALL);
  }

  public render_empty_cell(cell: GridCell): void {
    this.draw(cell, 0, 0, 15, 15, "#282a36");
  }

  public fill_cell(cell: GridCell): void {
    if (cell.is_highlighted) return this.highlight_cell(cell);
    if (cell.is_selected) return this.select_cell(cell);
    if (cell.state == CellStates.ORGANISM) {
      if (cell.owner && cell.owner.alive) {
        let rotation = to_angle(cell.owner.direction);

        // Ugly solution, needs improvement.
        if (rotation == 315 || rotation == 0 || rotation == 45) rotation = 0;
        else if (rotation == 90) rotation = 90;
        else if (rotation == 135 || rotation == 180 || rotation == 225) rotation = 180;
        else if (rotation == 270) rotation == 270;

        this.render_organism_cell(cell, rotation);
      }
    } else if (cell.state == CellStates.EMPTY) { this.render_empty_cell(cell); }
    else if (cell.state == CellStates.RADIOACTIVE) this.render_radioactive_cell(cell);
    else if (cell.state == CellStates.WALL) this.render_wall_cell(cell);
    else {
      this.ctx.fillRect(cell.coordinate.x * this.pixel_size, cell.coordinate.y * this.pixel_size, this.pixel_size, this.pixel_size);
    }
  }

  public highlight_cell(cell: GridCell): void {
    this.ctx.fillStyle = "#f1fa8c";
    this.ctx.fillRect(cell.coordinate.x * this.pixel_size, cell.coordinate.y * this.pixel_size, this.pixel_size, this.pixel_size);
  }

  public select_cell(cell: GridCell): void {
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(cell.coordinate.x * this.pixel_size, cell.coordinate.y * this.pixel_size, this.pixel_size, this.pixel_size);
  }

  public clear_cell(cell: GridCell): void {
    this.ctx.fillStyle = "#282a36";
    this.ctx.fillRect(cell.coordinate.x * this.pixel_size, cell.coordinate.y * this.pixel_size, this.pixel_size, this.pixel_size);
  }

  public clear_canvas(): void {
    this.ctx.fillStyle = "#282a36";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
