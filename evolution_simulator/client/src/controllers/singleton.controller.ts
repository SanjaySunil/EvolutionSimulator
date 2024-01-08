import { DefaultConfig } from "../config/simulation.config";

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

  public set config(newValue: typeof DefaultConfig) {
    this._config = newValue;
  }

  public update_value(key: string, newValue: any): void {
    this._config[key] = newValue;
  }
}
