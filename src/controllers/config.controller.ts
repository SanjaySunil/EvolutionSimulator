import { DefaultSimulationConfig } from "../config/simulation.config";

// ConfigController is a singleton class that stores the current configuration
export class ConfigController {
  // Singleton instance
  private static instance: ConfigController;
  // Configuration object
  private _config: typeof DefaultSimulationConfig;

  private constructor() {
    this._config = {};
  }

  // Returns the singleton instance of ConfigController
  public static get_instance(): ConfigController {
    // If the singleton instance does not exist, create it
    if (!ConfigController.instance) {
      // Create the singleton instance
      ConfigController.instance = new ConfigController();
    }
    return ConfigController.instance;
  }

  // Getter for the configuration object
  public get config(): { [key: string]: any } {
    // Return the configuration object
    return this._config;
  }

  // Setter for the configuration object.
  public set config(new_value: typeof DefaultSimulationConfig) {
    this._config = new_value;
  }
}
