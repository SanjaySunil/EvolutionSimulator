export const DOMElements = {
  button: document.getElementById("open_sidebar") as HTMLButtonElement,
  export_neuralnet: document.getElementById("export_neuralnet") as HTMLButtonElement,
  rendering_enabled: document.getElementById("render_on_off") as HTMLButtonElement,
  sidebar: document.getElementById("sidebar") as HTMLDivElement,
  sim_restart: document.getElementById("sim_restart") as HTMLButtonElement,
  sim_start_stop: document.getElementById("sim_start_stop") as HTMLButtonElement,
  slider_label: document.getElementById("target_update_fps") as HTMLSpanElement,
  
  target_update_fps_slider: document.getElementById("target_update_fps_slider") as HTMLInputElement,
  export_all_organisms: document.getElementById("export_all_organisms") as HTMLButtonElement,
  export_config: document.getElementById("export_config") as HTMLButtonElement,
  export_simulation: document.getElementById("export_simulation") as HTMLButtonElement,
  export_environment: document.getElementById("export_environment") as HTMLButtonElement,
  import_config: document.getElementById("import_config") as HTMLInputElement,
  import_organisms: document.getElementById("import_organisms") as HTMLInputElement,
  import_simulation: document.getElementById("import_simulation") as HTMLInputElement,
  import_environment: document.getElementById("import_environment") as HTMLInputElement,
};
