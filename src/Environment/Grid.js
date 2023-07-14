import Canvas from '../UserInterface/Canvas';

export default class Grid extends Canvas {
  constructor({canvas_id, canvas_size, grid_size}) {
    super({canvas_id, canvas_size, grid_size});
    this.grid = [];
    for (let x = 0; x < this.grid_size; x++) {
      const column = [];
      for (let y = 0; y < this.grid_size; y++) {
        column.push(0);
      }
      this.grid.push(column);
    }
    this.render();
  }

  render() {
    this.ctx.fillStyle = 'white';
    for (let x = 0; x < this.grid_size; x++) {
      for (let y = 0; y < this.grid_size; y++) {
        if (this.grid[x][y] == 1) {
          this.ctx.fillRect(
              x * this.pixel_size,
              y * this.pixel_size,
              this.pixel_size,
              this.pixel_size,
          );
        }
      }
    }
  }
}
