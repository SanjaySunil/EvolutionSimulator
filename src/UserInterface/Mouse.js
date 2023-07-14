export default class Mouse {
  constructor({pixel_size}) {
    this.cursor = {
      x: -1,
      y: -1,
      grid_x: -1,
      grid_y: -1,
      prev_grid_x: -1,
      prev_grid_y: -1,
      clicked_x: -1,
      clicked_y: -1,
    };
    this.middle_click = false;
    this.left_click = false;
    this.right_click = false;
    this.pixel_size = pixel_size;
  }

  mouse_move(event) {
    event.preventDefault();

    this.cursor.x = event.offsetX;
    this.cursor.y = event.offsetY;
    this.cursor.prev_grid_x = this.cursor.grid_x;
    this.cursor.prev_grid_y = this.cursor.grid_y;
    this.cursor.grid_x = Math.floor(this.cursor.x / this.pixel_size);
    this.cursor.grid_y = Math.floor(this.cursor.y / this.pixel_size);
  }

  mouse_up(event) {
    event.preventDefault();

    if (event.button == 0) this.left_click = false;
    if (event.button == 1) this.middle_click = false;
    if (event.button == 2) this.right_click = false;
  }

  mouse_down(event) {
    event.preventDefault();

    this.left_click = (event.button == 0);
    this.middle_click = (event.button == 1);
    this.right_click = (event.button == 2);

    this.cursor.clicked_x = this.cursor.x;
    this.cursor.clicked_y = this.cursor.y;
  }

  mouse_enter(event) {
    this.left_click = !!(event.buttons & 1);
    this.right_click = !!(event.buttons & 2);
    this.middle_click = !!(event.buttons & 4);

    this.cursor.clicked_x = this.cursor.x;
    this.cursor.clicked_y = this.cursor.y;
  }

  mouse_leave() {
    this.left_click = false;
    this.middle_click = false;
    this.right_click = false;
  }
}
