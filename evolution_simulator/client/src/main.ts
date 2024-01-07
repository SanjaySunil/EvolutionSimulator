import { SimulationConfig } from "./config/simulation.config";
import {
  register_download_neuralnet_button,
  register_export_all_organisms_button,
  register_export_simulation_button,
  register_rendering_enabled_button,
  register_sim_restart_button,
  register_sim_start_stop_button,
  register_sidebar_button,
  register_fps_sliders,
  register_import_organisms,
  register_import_simulation,
  register_export_config,
  register_import_config,
} from "./components/Buttons";
import Simulation from "./controllers/simulation.controller";
import { render_settings } from "./components/Settings";

const config = SimulationConfig;
const simulation = new Simulation(config);

render_settings(simulation, config);
register_sidebar_button();
register_rendering_enabled_button(simulation);
register_sim_restart_button();
register_sim_start_stop_button(simulation);
register_download_neuralnet_button();
register_export_all_organisms_button(simulation);
register_export_simulation_button(simulation, config);
register_export_config(config);
register_fps_sliders(simulation, config);
register_import_organisms(simulation);
register_import_config(simulation)
register_import_simulation(simulation);
