import {
  register_download_neuralnet_button,
  register_fps_slider,
  register_rendering_enabled_button,
  register_show_controls,
  register_sim_restart_button,
  register_sim_start_stop_button,
} from "./components/Buttons";
import {
  export_population_button,
  register_export_config_button,
  register_export_environment_button,
  register_export_simulation_button,
  register_import_config_button,
  register_import_environment_button,
  register_import_organisms_button,
  register_import_simulation_button,
} from "./components/ImportExport";
import { render_settings } from "./components/Settings";
import Simulation from "./controllers/simulation.controller";
import { ConfigController } from "./controllers/config.controller";
import { DefaultSimulationConfig } from "./config/simulation.config";

const config = ConfigController.get_instance();
config.config = DefaultSimulationConfig;

const simulation = new Simulation(config.config);

// Render settings and register event listeners for buttons.
render_settings(simulation, config.config);
register_show_controls();
register_rendering_enabled_button(simulation);
register_sim_restart_button();
register_sim_start_stop_button(simulation);
register_download_neuralnet_button();
register_fps_slider(simulation, config.config);

// Import Buttons
register_import_organisms_button(simulation);
register_import_simulation_button(simulation);
register_import_config_button(simulation, config.config);
register_import_environment_button(simulation);

// Export Buttons
register_export_config_button(config.config);
register_export_environment_button(simulation);
export_population_button(simulation);
register_export_simulation_button(simulation, config.config);
