// documented

// DOM elements are stored in a single object to avoid polluting the global namespace.
export const DOMElements = {
  button: document.getElementById("open_sidebar") as HTMLButtonElement,
  export_neuralnet: document.getElementById("export_neuralnet") as HTMLButtonElement,
  rendering_enabled: document.getElementById("render_on_off") as HTMLButtonElement,
  sidebar: document.getElementById("sidebar") as HTMLDivElement,
  sim_restart: document.getElementById("sim_restart") as HTMLButtonElement,
  sim_start_stop: document.getElementById("sim_start_stop") as HTMLButtonElement,
  slider_label: document.getElementById("target_update_fps") as HTMLSpanElement,

  target_update_fps_slider: document.getElementById("target_update_fps_slider") as HTMLInputElement,
  export_population: document.getElementById("export_all_organisms") as HTMLButtonElement,
  export_config: document.getElementById("export_config") as HTMLButtonElement,
  export_simulation: document.getElementById("export_simulation") as HTMLButtonElement,
  export_environment: document.getElementById("export_environment") as HTMLButtonElement,
  import_config: document.getElementById("import_config") as HTMLInputElement,
  import_organisms: document.getElementById("import_organisms") as HTMLInputElement,
  import_simulation: document.getElementById("import_simulation") as HTMLInputElement,
  import_environment: document.getElementById("import_environment") as HTMLInputElement,
  neural_network_svg: document.getElementById("neural_network_svg") as HTMLElement,
  settings: document.getElementById("settings") as HTMLDivElement,
  mode: document.getElementById("mode") as HTMLSpanElement,
  organism_selected: document.getElementById("organism_selected") as HTMLParagraphElement,
  organism_selected_table: document.getElementById("export_neuralnet") as HTMLTableElement,

  target_update_fps: document.getElementById("target_update_fps") as HTMLInputElement,
  target_render_fps: document.getElementById("target_render_fps") as HTMLInputElement,
  current_update_fps: document.getElementById("current_update_fps") as HTMLInputElement,
  current_render_fps: document.getElementById("current_render_fps") as HTMLInputElement,
  tick_count: document.getElementById("tick_count") as HTMLSpanElement,
  generation: document.getElementById("generation") as HTMLSpanElement,
  best_fitness: document.getElementById("best_fitness") as HTMLSpanElement,
  overall_fitness: document.getElementById("overall_fitness") as HTMLSpanElement,
  organisms_alive: document.getElementById("organisms_alive") as HTMLSpanElement,
  organisms_dead: document.getElementById("organisms_dead") as HTMLSpanElement,
};
