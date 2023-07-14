import get_style from '../Utils/get_style';
import Mouse from './Mouse';

export default class Canvas {
  constructor({canvas_id, canvas_size, grid_size}) {
    this.canvas = document.getElementById(canvas_id);
    this.ctx = this.canvas.getContext('2d');
    this.canvas_size = canvas_size;
    this.canvas.width = this.canvas_size;
    this.canvas.height = this.canvas_size;
    this.grid_size = grid_size;
    this.pixel_size = this.canvas_size / this.grid_size;
    this.mouse = new Mouse({
      pixel_size: this.pixel_size,
    });
    this.zoom = 1;
    this.zoom_speed = 0.25;
    this.pan_amount = 50;
    this.register_mouse_events();
    this.clear_canvas();
  }
  register_mouse_events() {
    this.canvas.addEventListener('mousemove', (e) => {
      this.mouse.mouse_move(e);
      this.handle_mouse_move();
      this.check_mouse_events();
    });
    this.canvas.addEventListener('mouseup', (e) => {
      this.mouse.mouse_up(e);
    });
    this.canvas.addEventListener('mousedown', (e) => {
      this.mouse.mouse_down(e);
      this.check_mouse_events();
    });
    this.canvas.addEventListener('mouseenter', (e) => {
      this.mouse.mouse_enter(e);
      this.handle_mouse_move();
    });
    this.canvas.addEventListener('mouseleave', (e) => {
      this.mouse.mouse_leave(e);
    });
    this.canvas.addEventListener('wheel', (e) => {
      this.handle_mouse_wheel(e);
    });
    window.addEventListener('keydown', (e) => {
      this.handle_key_down(e);
    });
  }

  handle_key_down(event) {
    const canvas_top = parseInt(get_style('canvas', 'top'));
    const canvas_left = parseInt(get_style('canvas', 'left'));
    if (event.code == 'ArrowRight') {
      this.canvas.style.left = canvas_left - this.pan_amount + 'px';
    } else if (event.code == 'ArrowLeft') {
      this.canvas.style.left = canvas_left + this.pan_amount + 'px';
    } else if (event.code == 'ArrowDown') {
      this.canvas.style.top = canvas_top - this.pan_amount + 'px';
    } else if (event.code == 'ArrowUp') {
      this.canvas.style.top = canvas_top + this.pan_amount + 'px';
    }
  }

  check_mouse_events() {
    if (this.mouse.middle_click) {
      const canvas_top = parseInt(get_style('canvas', 'top'));
      const canvas_left = parseInt(get_style('canvas', 'left'));
      this.canvas.style.top =
        canvas_top +
        (this.mouse.cursor.y - this.mouse.cursor.clicked_y) * this.zoom +
        'px';
      this.canvas.style.left =
        canvas_left +
        (this.mouse.cursor.x - this.mouse.cursor.clicked_x) * this.zoom +
        'px';
    }
  }

  handle_mouse_wheel(event) {
    const sign = -Math.sign(event.deltaY);
    const scale = Math.max(0.5, this.zoom + sign * this.zoom_speed);

    const canvas_top = parseInt(get_style('canvas', 'top'));
    const canvas_left = parseInt(get_style('canvas', 'left'));

    const dx =
      (this.canvas.width / 2 - this.mouse.cursor.x) * (scale - this.zoom);
    const dy =
      (this.canvas.height / 2 - this.mouse.cursor.y) * (scale - this.zoom);

    this.canvas.style.top = canvas_top + dy + 'px';
    this.canvas.style.left = canvas_left + dx + 'px';

    this.zoom = scale;
    this.canvas.style.transform = `scale(${this.zoom})`;
  }

  handle_mouse_move() {
    this.clear(this.mouse.cursor.prev_grid_x, this.mouse.cursor.prev_grid_y);
    this.highlight(this.mouse.cursor.grid_x, this.mouse.cursor.grid_y);
  }

  clear(x, y) {
    this.ctx.fillStyle = '#282a36';
    this.ctx.fillRect(
        x * this.pixel_size,
        y * this.pixel_size,
        this.pixel_size,
        this.pixel_size,
    );
  }

  clear_canvas() {
    this.ctx.fillStyle = '#282a36';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  highlight(x, y) {
    this.ctx.fillStyle = '#f1fa8c';
    this.ctx.fillRect(
        x * this.pixel_size,
        y * this.pixel_size,
        this.pixel_size,
        this.pixel_size,
    );
  }
}
