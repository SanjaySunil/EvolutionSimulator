/**
 * Function to read a file.
 * @param event - The event that triggered the function.
 * @returns - The data from the file.
 */
export function read_file(event: Event): Promise<any> {
  return new Promise((resolve) => {
    const target = event.target as HTMLInputElement;
    const file = target.files![0];
    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = (event: Event): any => {
      const result = (event.target as FileReader).result as string;
      const data = JSON.parse(result);
      resolve(data);
    };
  });
}
