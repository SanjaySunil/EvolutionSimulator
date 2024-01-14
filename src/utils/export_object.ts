/**
 * Export an object as a JSON file.
 * @param object - The object to export.
 * @param export_name - The name of the exported file.
 */
export default function export_object(object, export_name): void {
  // Create a data string from the object.
  const data_string = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(object));
  // Create a link element and set its attributes.
  const download_anchor_node = document.createElement("a");
  download_anchor_node.setAttribute("href", data_string);
  download_anchor_node.setAttribute("download", export_name + ".json");
  // Append the link element to the document body.
  document.body.appendChild(download_anchor_node);
  // Click the link element to download the JSON file.
  download_anchor_node.click();
  // Remove the link element from the document body.
  download_anchor_node.remove();
}
