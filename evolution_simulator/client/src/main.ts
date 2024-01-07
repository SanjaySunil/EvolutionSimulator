import { register_download_neuralnet_button } from "./components/Buttons";
import {
  register_export_all_organisms_button,
  register_export_config_button,
  register_export_environment_button,
  register_import_environment_button,
} from "./components/ImportExport";
import { register_fps_sliders } from "./components/Buttons";
import {
  register_import_config_button,
  register_import_organisms_button,
  register_import_simulation_button,
} from "./components/ImportExport";
import { register_rendering_enabled_button, register_sim_restart_button, register_sim_start_stop_button } from "./components/Buttons";
import { register_sidebar_button } from "./components/Buttons";
import { render_settings } from "./components/Settings";
import { SimulationConfig } from "./config/simulation.config";
import Simulation from "./controllers/simulation.controller";

const config = SimulationConfig;
const simulation = new Simulation(config);

render_settings(simulation, config);
register_sidebar_button();
register_rendering_enabled_button(simulation);
register_sim_restart_button();
register_sim_start_stop_button(simulation);
register_download_neuralnet_button();
register_fps_sliders(simulation, config);
register_import_organisms_button(simulation);
register_import_simulation_button(simulation);
register_import_config_button(simulation);
register_import_environment_button(simulation);
register_export_config_button(simulation);
register_export_environment_button(simulation);
register_export_all_organisms_button(simulation);
register_export_environment_button(simulation);

