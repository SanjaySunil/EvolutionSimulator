export default function get_style(element: string, property: string): string {
  const html_element = document.getElementById(element) as HTMLElement;
  const styles = window.getComputedStyle(html_element);
  const value = styles.getPropertyValue(property);
  return value;
}
