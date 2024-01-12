/**
 * Export an object as a JSON file.
 * @param object - The object to export.
 * @param export_name - The name of the exported file.
 */
export default function export_object(object, export_name): void {
  const data_string = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(object));
  const download_anchor_node = document.createElement("a");
  download_anchor_node.setAttribute("href", data_string);
  download_anchor_node.setAttribute("download", export_name + ".json");
  document.body.appendChild(download_anchor_node);
  download_anchor_node.click();
  download_anchor_node.remove();
}
