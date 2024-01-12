/**
 * Obtains an element's specific style.
 * @param element - The element to obtain the style from.
 * @param property-  The style property to obtain.
 * @returns - The value of the style property.
 */
export default function get_style(element: string, property: string): string {
  const html_element = document.getElementById(element) as HTMLElement;
  const styles = window.getComputedStyle(html_element);
  const value = styles.getPropertyValue(property);
  return value;
}
