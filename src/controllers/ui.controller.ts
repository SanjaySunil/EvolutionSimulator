// Function to render the frames per second (fps) element
export function render_fps_element(element, fps): void {
  element.innerHTML = Math.round(fps).toString();
}

// Function to render the settings based on the provided config object
export function render_settings(config: object): void {
  const settings = document.getElementById("settings") as HTMLDivElement;
  const keys = Object.keys(config);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = config[key];

    // Create a new table row
    const row = document.createElement("tr");

    // Create a new table cell for the key
    const td = document.createElement("td");
    td.textContent = key.replaceAll("_", " ");

    // Append the key cell to the row
    row.appendChild(td);

    // Append the row to the settings div
    settings.appendChild(row);

    // Create a new table cell for the input
    const td2 = document.createElement("td");
    const input = document.createElement("input");

    // Set the input type based on the value type
    input.setAttribute("type", typeof value === "number" ? "number" : "checkbox");
    input.setAttribute("id", key);

    // Set the input value or checked attribute based on the value
    if (typeof value == "boolean" && value) {
      input.setAttribute("checked", "true");
    } else {
      input.setAttribute("value", value.toString());
    }

    // Add event listener for input change
    input.addEventListener("change", (e: Event) => {
      const target = e.target as HTMLInputElement;
      const key = target.id;
      const value = target.value;

      // Update the config object based on the input type
      if (typeof config[key] === "number") {
        config[key] = parseInt(value);
      } else if (typeof config[key] === "boolean") {
        config[key] = target.checked;
      }
    });

    // Append the input cell to the row
    row.appendChild(td2);
    td2.appendChild(input);

    // Append the row to the settings div
    settings.appendChild(row);
  }
}
