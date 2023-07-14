function get_style(element, property) {
  element = document.getElementById(element);
  const styles = window.getComputedStyle(element);
  const value = styles.getPropertyValue(property);
  return value;
}

module.exports = {get_style};
