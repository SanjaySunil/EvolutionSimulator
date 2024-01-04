export function render_fps_element(element, fps): void {
  element.innerHTML = Math.round(fps).toString();
}

export function render_settings(config: object): void {
  const settings = document.getElementById("settings") as HTMLDivElement;
  const keys = Object.keys(config);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = config[key];

    const row = document.createElement("tr");
    const td = document.createElement("td");
    td.textContent = key.replaceAll("_", " ");

    row.appendChild(td);
    settings.appendChild(row);

    const td2 = document.createElement("td");
    const input = document.createElement("input");
    input.setAttribute("type", (typeof value === "number" ? "number" : "checkbox"));
    input.setAttribute("id", key);
    if (typeof value == "boolean" && value) {
      input.setAttribute("checked", "true");
    } else {
      input.setAttribute("value", value.toString());
    }
    input.addEventListener("change", (e: Event) => {
      const target = e.target as HTMLInputElement;
      const key = target.id;
      const value = target.value;

      if (typeof config[key] === "number") {
        config[key] = parseInt(value);
      } else if (typeof config[key] === "boolean") {
        config[key] = target.checked;
      }
    });

    row.appendChild(td);
    td2.appendChild(input);
    row.appendChild(td2);
    settings.appendChild(row);
  }
}
