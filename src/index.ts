import SimulationController from "./controllers/simulation.controller";
import { SimulationConfig } from "./config/simulation.config";
import World from "./core/World";

let sidebar_enabled = false;

const simulation = new SimulationController(SimulationConfig);
const target_update_fps_slider = document.getElementById("target_update_fps_slider") as HTMLInputElement;

target_update_fps_slider.max = SimulationConfig.TARGET_UPDATE_MAX_FPS.toString();
target_update_fps_slider.value = SimulationConfig.TARGET_UPDATE_FPS.toString();

const sim_start_stop = document.getElementById("sim_start_stop") as HTMLButtonElement;
const sim_restart = document.getElementById("sim_restart") as HTMLButtonElement;
const rendering_enabled = document.getElementById("render_on_off") as HTMLButtonElement;

const sidebar = document.getElementById("sidebar") as HTMLDivElement;

const closeModalBtn = document.getElementById("close-modal-btn") as HTMLButtonElement;
const modal = document.getElementById("open-modal") as HTMLDivElement;
const closeOrganismModalBtn = document.getElementById("close-organism-modal-btn") as HTMLButtonElement;
const organismModal = document.getElementById("organismModal") as HTMLDivElement;
const organismChartButton = document.getElementById("organismChartButton") as HTMLButtonElement;
const switch_chart = document.getElementById("switch_graph") as HTMLInputElement;

/** Menu bar hide / show */
if (closeModalBtn && modal) {
  closeModalBtn.addEventListener("click", () => {
    modal.classList.remove("visible");
  });
}

/** Menu bar hide / show */
if (closeOrganismModalBtn && organismModal) {
  closeOrganismModalBtn.addEventListener("click", () => {
    organismModal.classList.remove("visible");
  });
}

/** Global Event Listeners */
sim_start_stop.addEventListener("click", () => {
  if (simulation.is_running) {
    simulation.stop();
    sim_start_stop.innerHTML = "START";
  } else {
    simulation.start();
    sim_start_stop.innerHTML = "STOP";
  }
});

organismChartButton?.addEventListener("click", () => {
  organismModal.classList.add("visible");
});

switch_chart.addEventListener("change", () => {
  const index = switch_chart.value;
  simulation.world.statistics.switch_chart(index);
});

rendering_enabled.addEventListener("click", () => {
  simulation.rendering_enabled = !simulation.rendering_enabled;
  rendering_enabled.innerHTML = "Rendering " + (simulation.rendering_enabled ? "ON" : "OFF");
  if (simulation.is_running) {
    simulation.stop();
    simulation.start();
  }
});

sim_restart.addEventListener("click", () => {
  const restart = confirm("Are you sure you would like to restart?");
  if (restart) simulation.world = new World("canvas", SimulationConfig.CANVAS_SIZE, SimulationConfig.GRID_SIZE);
});

function read_fps_slider(slider, label): void {
  const slider_label = document.getElementById(label) as HTMLSpanElement;
  let fps = 0;
  if (slider.value === slider.max) {
    slider_label.innerHTML = "MAX";
    fps = Number.MAX_SAFE_INTEGER;
  } else if (slider.value == slider.min) {
    slider_label.innerHTML = "1";
    fps = 1;
  } else {
    slider_label.innerHTML = slider.value;
    fps = parseInt(slider.value, 10);
  }
  simulation.target_update_fps = fps;
}

/** FPS slider. */
function slider(slider, label): void {
  if (simulation.is_running) {
    read_fps_slider(slider, label);
    simulation.restart();
  } else {
    read_fps_slider(slider, label);
  }
}

target_update_fps_slider.addEventListener("input", () => slider(target_update_fps_slider, "target_update_fps"));

/** Shortcut for sidebar. */
window.addEventListener("keydown", (event) => {
  if (event.code == "KeyE") {
    sidebar_enabled = !sidebar_enabled;
    if (sidebar_enabled) sidebar.style.display = "none";
    else sidebar.style.display = "block";
  }
});

/** Trigger target update fps slider. */
read_fps_slider(target_update_fps_slider, "target_update_fps");
