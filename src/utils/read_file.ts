/**
 * Function to read a file.
 * @param event - The event that triggered the function.
 * @returns - The data from the file.
 */
export function read_file(event: Event): Promise<any> {
  // Return a promise to read the file.
  return new Promise((resolve, reject) => {
    // Get the target of the event.
    const target = event.target as HTMLInputElement;
    // Get the file from the target.
    const file = target.files![0];
    // Create a new file reader.
    const reader = new FileReader();
    // Read the file as text.
    reader.readAsText(file, "UTF-8");
    // Resolve the promise with the data from the file.
    reader.onload = (event: Event): any => {
      // Get the result of the file reader as a string.
      const result = (event.target as FileReader).result as string;
      if (file.name.split(".").pop() !== "json") {
        // Reject the promise if the file is not a JSON file.
        reject(alert("Please upload a JSON file."));
      } else {
        // Parse the result as JSON.
        const data = JSON.parse(result);
        // Return the data from the file.
        resolve(data);
      }
    };
  });
}
