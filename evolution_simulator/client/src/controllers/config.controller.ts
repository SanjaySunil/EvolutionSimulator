import { DefaultSimulationConfig } from "../config/simulation.config";

export class ConfigController {
  private static instance: ConfigController;
  private _config: { [key: string]: any };

  private constructor() {
    this._config = {};
  }

  public static get_instance(): ConfigController {
    if (!ConfigController.instance) {
      ConfigController.instance = new ConfigController();
    }
    return ConfigController.instance;
  }

  public get config(): { [key: string]: any } {
    return this._config;
  }

  public set config(new_value: typeof DefaultSimulationConfig) {
    this._config = new_value;
  }

  public update_value(key: string, new_value: any): void {
    this._config[key] = new_value;
  }
}
