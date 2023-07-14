import Grid from './Environment/Grid';

// Register event listener
window.addEventListener('load', function() {
  console.log('Evolution Simulator page has loaded.');
  const canvas = new Grid({
    // Canvas Size must be divisible by grid size for clean pixels.
    canvas_size: 768,
    grid_size: 128,
    canvas_id: 'canvas',
  });
  console.log(canvas);
});
