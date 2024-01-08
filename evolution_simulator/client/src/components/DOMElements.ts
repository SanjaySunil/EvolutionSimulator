export const DOMElements = {
  button: document.getElementById("open_sidebar") as HTMLButtonElement,
  export_neuralnet: document.getElementById("export_neuralnet") as HTMLButtonElement,
  rendering_enabled: document.getElementById("render_on_off") as HTMLButtonElement,
  sidebar: document.getElementById("sidebar") as HTMLDivElement,
  sim_restart: document.getElementById("sim_restart") as HTMLButtonElement,
  sim_start_stop: document.getElementById("sim_start_stop") as HTMLButtonElement,
  slider_label: document.getElementById("target_update_fps") as HTMLSpanElement,
  target_update_fps_slider: document.getElementById("target_update_fps_slider") as HTMLInputElement,
};
