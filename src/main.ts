import {
  register_clear_obstructions_button,
  register_download_neuralnet_button,
  register_fps_slider,
  register_generate_obstructions_button,
  register_rendering_enabled_button,
  register_show_controls,
  register_sim_restart_button,
  register_sim_start_stop_button,
  register_switch_chart,
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
import { DefaultSimulationConfig } from "./config/simulation.config";
import { ConfigController } from "./controllers/config.controller";
import Simulation from "./controllers/simulation.controller";

const config = ConfigController.get_instance();

// Set the default configuration.
config.config = DefaultSimulationConfig;
const simulation = new Simulation(config.config);

// Render settings
render_settings(simulation, config.config);

// Register event listeners for the four main buttons.
register_show_controls();
register_rendering_enabled_button(simulation);
register_sim_restart_button();
register_sim_start_stop_button(simulation);

// Other buttons in the control menu.
register_download_neuralnet_button();
register_fps_slider(simulation, config.config);
register_switch_chart(simulation);

// Import Buttons
register_import_organisms_button(simulation);
register_import_simulation_button(simulation);
register_import_config_button(simulation);
register_import_environment_button(simulation);

// Export Buttons
register_export_config_button(config.config);
register_export_environment_button(simulation);
export_population_button(simulation);
register_export_simulation_button(simulation, config.config);

// Environment buttons
register_generate_obstructions_button(simulation);
register_clear_obstructions_button(simulation);

// Remove when evolution simulator is complete.
console.log("All files loaded.");
