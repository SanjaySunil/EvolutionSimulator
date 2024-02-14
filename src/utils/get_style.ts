/**
 * Obtains an element's specific style.
 * @param element - The element to obtain the style from.
 * @param property-  The style property to obtain.
 * @returns - The value of the style property.
 */
export default function get_style(element: string, property: string): string {
  // Get the element by its ID.
  const html_element = document.getElementById(element) as HTMLElement;
  // Get the computed style of the element.
  const styles = window.getComputedStyle(html_element);
  // Get the value of the specified property.
  const value = styles.getPropertyValue(property);
  // Return the value of the specified property.
  return value;
}
