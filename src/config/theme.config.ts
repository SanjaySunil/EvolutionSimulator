// Defining ThemeConfig types.
type Types = Record<string, string>;

/** Theme palette for simulation, cells are coloured with hex values. */
const ThemeConfig: Types = {
  EMPTY: "#282a36",
  WALL: "#44475a",
  FOOD: "#44475a",
  RADIOACTIVE: "#ff5555",
  HIGHLIGHTED: "#f1fa8c",
  SELECTED: "#ffffff",
};

export default ThemeConfig;
